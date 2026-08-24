"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  createResearch,
  getResearch,
  getResearchHistory,
  sendResearchQuestion,
} from "@/lib/research";

import { createClient } from "@/lib/supabase/client";

// ============================================================
// TYPES
// ============================================================

type ThinkingEvent = {
  time: string;
  message: string;
};

type TimelineEvent = {
  id?: number;
  title: string;
  description: string;
  completed: boolean;
};

type ResearchSource = {
  title?: string;
  url?: string;
  domain?: string;
  snippet?: string;
};

type ResearchMetrics = {
  sources: number;
  confidence: number;
  agents: number;
  runtime: number;
  reflections: number;
};

export type ResearchQuestion = {
  id: number;
  query: string;
  created_at?: string;
};

export type ResearchJob = {
  job_id: string;

  query: string;

  questions?: ResearchQuestion[];

  pdf_filename?: string | null;

  status: string;

  progress: number;

  current_step: string;

  report: string;

  summary: string;

  error: string;

  timeline: TimelineEvent[];

  thinking: ThinkingEvent[];

  sources: ResearchSource[];

  metrics: ResearchMetrics;

  created_at?: string;
};

// ============================================================
// CONTEXT
// ============================================================

type ContextType = {
  job: ResearchJob | null;

  chats: ResearchJob[];

  activeChatId: string | null;

  loading: boolean;

  historyLoading: boolean;

  createJob: (
    query: string,
    pdfFile?: File | null
  ) => Promise<void>;

  refresh: () => Promise<void>;

  selectChat: (
    jobId: string
  ) => Promise<void>;

  newChat: () => void;

  refreshChats: () => Promise<void>;
};

const ResearchContext =
  createContext<ContextType | null>(null);

// ============================================================
// PROVIDER
// ============================================================

export function ResearchProvider({
  children,
}: {
  children: ReactNode;
}) {
  // ==========================================================
  // SUPABASE
  // ==========================================================

  const supabase = createClient();

  // ==========================================================
  // AUTH STATE
  // ==========================================================

  const [authenticated, setAuthenticated] =
    useState(false);

  const authInitialized =
    useRef(false);

  // ==========================================================
  // CURRENT JOB
  // ==========================================================

  const [job, setJob] =
    useState<ResearchJob | null>(null);

  // ==========================================================
  // HISTORY
  // ==========================================================

  const [chats, setChats] =
    useState<ResearchJob[]>([]);

  const [activeChatId, setActiveChatId] =
    useState<string | null>(null);

  // ==========================================================
  // LOADING
  // ==========================================================

  const [loading, setLoading] =
    useState(false);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  // ==========================================================
  // REFS
  // ==========================================================

  const activeJobId =
    useRef<string | null>(null);

  const pollingTimer =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  // ==========================================================
  // STOP POLLING
  // ==========================================================

  function stopPolling() {
    if (
      pollingTimer.current !== null
    ) {
      clearTimeout(
        pollingTimer.current
      );

      pollingTimer.current =
        null;
    }
  }

  // ==========================================================
  // UPDATE HISTORY
  // ==========================================================

  function updateChatHistory(
    updatedJob: ResearchJob
  ) {
    setChats(
      (previousChats) => {
        const exists =
          previousChats.some(
            (chat) =>
              chat.job_id ===
              updatedJob.job_id
          );

        if (!exists) {
          return [
            updatedJob,
            ...previousChats,
          ];
        }

        return previousChats.map(
          (chat) =>
            chat.job_id ===
            updatedJob.job_id
              ? updatedJob
              : chat
        );
      }
    );
  }

  // ==========================================================
  // REFRESH HISTORY
  // ==========================================================

  async function refreshChats() {
    // IMPORTANT:
    // Never call the protected backend endpoint
    // when there is no authenticated Supabase session.

    if (!authenticated) {
      setChats([]);
      return;
    }

    setHistoryLoading(true);

    try {
      const data =
        await getResearchHistory();

      const jobs: ResearchJob[] =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.jobs)
            ? data.jobs
            : [];

      jobs.sort(
        (a, b) => {
          const dateA =
            a.created_at
              ? new Date(
                  a.created_at
                ).getTime()
              : 0;

          const dateB =
            b.created_at
              ? new Date(
                  b.created_at
                ).getTime()
              : 0;

          return dateB - dateA;
        }
      );

      setChats(jobs);
    } catch (error) {
      console.error(
        "Failed to load research history:",
        error
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  // ==========================================================
  // AUTHENTICATION INITIALIZATION
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      const {
        data,
      } =
        await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      setAuthenticated(
        Boolean(data.session)
      );

      authInitialized.current =
        true;
    }

    initializeAuth();

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!mounted) {
            return;
          }

          const isAuthenticated =
            Boolean(session);

          setAuthenticated(
            isAuthenticated
          );

          // User logged out.
          if (!isAuthenticated) {
            stopPolling();

            activeJobId.current =
              null;

            setActiveChatId(
              null
            );

            setJob(null);

            setChats([]);

            setLoading(false);

            return;
          }

          // User logged in.
          // History loading is handled by the
          // authenticated effect below.
        }
      );

    return () => {
      mounted = false;

      authListener.subscription.unsubscribe();
    };
  }, []);

  // ==========================================================
  // LOAD HISTORY AFTER AUTHENTICATION
  // ==========================================================

  useEffect(() => {
    if (!authInitialized.current) {
      return;
    }

    if (!authenticated) {
      return;
    }

    refreshChats();
  }, [authenticated]);

  // ==========================================================
  // REFRESH CURRENT JOB
  // ==========================================================

  async function refresh() {
    const jobId =
      activeJobId.current;

    if (!jobId || !authenticated) {
      return;
    }

    try {
      const updated =
        await getResearch(
          jobId
        );

      if (
        activeJobId.current !==
        jobId
      ) {
        return;
      }

      setJob(updated);

      updateChatHistory(
        updated
      );
    } catch (error) {
      console.error(
        "Failed to refresh research job:",
        error
      );
    }
  }

  // ==========================================================
  // POLLING
  // ==========================================================

  function startPolling(
    jobId: string
  ) {
    stopPolling();

    activeJobId.current =
      jobId;

    setActiveChatId(
      jobId
    );

    const poll =
      async () => {
        if (
          activeJobId.current !==
          jobId
        ) {
          return;
        }

        if (!authenticated) {
          stopPolling();
          return;
        }

        try {
          const updated =
            await getResearch(
              jobId
            );

          if (
            activeJobId.current !==
            jobId
          ) {
            return;
          }

          setJob(updated);

          updateChatHistory(
            updated
          );

          if (
            updated.status ===
              "completed" ||
            updated.status ===
              "failed"
          ) {
            pollingTimer.current =
              null;

            return;
          }

          pollingTimer.current =
            setTimeout(
              poll,
              1000
            );
        } catch (error) {
          console.error(
            "Research polling error:",
            error
          );

          if (
            activeJobId.current ===
            jobId
          ) {
            pollingTimer.current =
              setTimeout(
                poll,
                1500
              );
          }
        }
      };

    poll();
  }

  // ==========================================================
  // CREATE OR CONTINUE RESEARCH
  // ==========================================================

  async function createJob(
    query: string,
    pdfFile?: File | null
  ) {
    if (!authenticated) {
      throw new Error(
        "You must be signed in to start research."
      );
    }

    const cleanQuery =
      query.trim();

    if (!cleanQuery) {
      return;
    }

    // ========================================================
    // EXISTING ACTIVE RESEARCH CHAT
    // ========================================================

    if (
      activeJobId.current
    ) {
      const existingJobId =
        activeJobId.current;

      stopPolling();

      setLoading(true);

      try {
        const response =
          await sendResearchQuestion(
            existingJobId,
            cleanQuery
          );

        if (
          response.job_id !==
          existingJobId
        ) {
          throw new Error(
            "Backend returned a different research job ID."
          );
        }

        const updated =
          await getResearch(
            existingJobId
          );

        if (
          activeJobId.current !==
          existingJobId
        ) {
          return;
        }

        setJob(updated);

        updateChatHistory(
          updated
        );

        startPolling(
          existingJobId
        );
      } catch (error) {
        console.error(
          "Failed to continue research:",
          error
        );

        throw error;
      } finally {
        setLoading(false);
      }

      return;
    }

    // ========================================================
    // NEW RESEARCH CONVERSATION
    // ========================================================

    stopPolling();

    activeJobId.current =
      null;

    setActiveChatId(
      null
    );

    setJob(null);

    setLoading(true);

    try {
      const response =
        await createResearch(
          cleanQuery,
          pdfFile
        );

      const jobId =
        response.job_id;

      if (!jobId) {
        throw new Error(
          "Backend did not return a job ID."
        );
      }

      activeJobId.current =
        jobId;

      setActiveChatId(
        jobId
      );

      const firstState =
        await getResearch(
          jobId
        );

      if (
        activeJobId.current !==
        jobId
      ) {
        return;
      }

      setJob(
        firstState
      );

      updateChatHistory(
        firstState
      );

      if (
        firstState.status !==
          "completed" &&
        firstState.status !==
          "failed"
      ) {
        startPolling(
          jobId
        );
      }

      await refreshChats();
    } catch (error) {
      console.error(
        "Failed to create research job:",
        error
      );

      if (
        activeJobId.current ===
        null
      ) {
        setJob(null);
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // SELECT EXISTING RESEARCH CHAT
  // ==========================================================

  async function selectChat(
    jobId: string
  ) {
    if (!authenticated) {
      return;
    }

    if (
      activeChatId ===
      jobId
    ) {
      return;
    }

    stopPolling();

    activeJobId.current =
      jobId;

    setActiveChatId(
      jobId
    );

    setLoading(true);

    try {
      const selectedJob =
        await getResearch(
          jobId
        );

      if (
        activeJobId.current !==
        jobId
      ) {
        return;
      }

      setJob(
        selectedJob
      );

      updateChatHistory(
        selectedJob
      );

      if (
        selectedJob.status !==
          "completed" &&
        selectedJob.status !==
          "failed"
      ) {
        startPolling(
          jobId
        );
      }
    } catch (error) {
      console.error(
        "Failed to load research chat:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // NEW RESEARCH CONVERSATION
  // ==========================================================

  function newChat() {
    stopPolling();

    activeJobId.current =
      null;

    setActiveChatId(
      null
    );

    setJob(
      null
    );

    setLoading(false);
  }

  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {
    return () => {
      stopPolling();

      activeJobId.current =
        null;
    };
  }, []);

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <ResearchContext.Provider
      value={{
        job,

        chats,

        activeChatId,

        loading,

        historyLoading,

        createJob,

        refresh,

        selectChat,

        newChat,

        refreshChats,
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useResearch(): ContextType {
  const context =
    useContext(
      ResearchContext
    );

  if (!context) {
    throw new Error(
      "useResearch must be used inside ResearchProvider"
    );
  }

  return context;
}