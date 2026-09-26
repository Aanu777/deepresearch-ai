"use client";

import {
  Brain,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  clearMemories,
  deleteMemory,
  getMemories,
  type UserMemory,
} from "@/lib/memory";


const KIND_LABELS:
  Record<
    UserMemory["kind"],
    string
  > = {
    preference:
      "Preference",
    correction:
      "Correction",
    profile:
      "Profile",
    project:
      "Project",
    goal:
      "Goal",
    fact:
      "Fact",
  };


export default function MemoryWorkspace() {
  const [
    memories,
    setMemories,
  ] =
    useState<UserMemory[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    busyId,
    setBusyId,
  ] =
    useState<
      string | null
    >(
      null
    );

  const [
    clearing,
    setClearing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null
    );


  const loadMemories =
    useCallback(
      async () => {
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          setMemories(
            await getMemories()
          );

        } catch (
          caught
        ) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Unable to load memories."
          );

        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );


  useEffect(
    () => {
      void loadMemories();
    },
    [
      loadMemories,
    ]
  );


  const counts =
    useMemo(
      () => {
        const result:
          Partial<
            Record<
              UserMemory["kind"],
              number
            >
          > = {};

        for (
          const memory
          of memories
        ) {
          result[
            memory.kind
          ] =
            (
              result[
                memory.kind
              ] ??
              0
            ) +
            1;
        }

        return result;
      },
      [
        memories,
      ]
    );


  async function removeMemory(
    memoryId: string
  ) {
    setBusyId(
      memoryId
    );

    setError(
      null
    );

    try {
      await deleteMemory(
        memoryId
      );

      setMemories(
        (
          previous
        ) =>
          previous.filter(
            (
              memory
            ) =>
              memory.id !==
              memoryId
          )
      );

    } catch (
      caught
    ) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to delete memory."
      );

    } finally {
      setBusyId(
        null
      );
    }
  }


  async function clearAll() {
    if (
      memories.length ===
      0
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Clear every learned memory? This cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    setClearing(
      true
    );

    setError(
      null
    );

    try {
      await clearMemories();

      setMemories(
        []
      );

    } catch (
      caught
    ) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to clear memories."
      );

    } finally {
      setClearing(
        false
      );
    }
  }


  return (
    <div className="min-h-[100dvh] bg-[#050505]">
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pt-10">
        <header className="mb-8 flex flex-col gap-5 border-b border-white/[0.07] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-white/35">
              <Brain
                size={14}
              />

              Adaptive memory
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              What DeepResearch remembers
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              Durable preferences, projects, goals and corrections can be recalled in future conversations. You stay in control of what is kept.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                void loadMemories();
              }}
              disabled={
                loading
              }
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-xs font-medium text-white/65 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
            >
              <RefreshCw
                size={14}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                void clearAll();
              }}
              disabled={
                clearing ||
                memories.length ===
                  0
              }
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-3 text-xs font-medium text-red-200/70 transition hover:bg-red-400/[0.10] hover:text-red-100 disabled:opacity-35"
            >
              <Trash2
                size={14}
              />

              Clear all
            </button>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs text-white/50">
            {memories.length}
            {" "}
            {memories.length === 1
              ? "memory"
              : "memories"}
          </div>

          {Object.entries(
            counts
          ).map(
            ([
              kind,
              count,
            ]) => (
              <div
                key={kind}
                className="rounded-full border border-white/[0.06] px-3 py-1.5 text-[11px] text-white/35"
              >
                {
                  KIND_LABELS[
                    kind as UserMemory["kind"]
                  ]
                }
                {" "}
                ·
                {" "}
                {count}
              </div>
            )
          )}
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-cyan-300/[0.10] bg-cyan-300/[0.035] p-4">
          <ShieldCheck
            size={17}
            className="mt-0.5 shrink-0 text-cyan-200/60"
          />

          <p className="text-xs leading-5 text-white/40">
            Memory is account-scoped and protected by database row-level security. The learner is designed to skip secrets and sensitive personal information.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-200/80">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[
              0,
              1,
              2,
            ].map(
              (
                item
              ) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]"
                />
              )
            )}
          </div>
        ) : memories.length ===
          0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.015] px-6 text-center">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035]">
              <Brain
                size={19}
                className="text-white/45"
              />
            </div>

            <h2 className="text-sm font-medium text-white/75">
              No long-term memories yet
            </h2>

            <p className="mt-2 max-w-md text-xs leading-5 text-white/35">
              As you use Conversation mode, stable preferences, ongoing projects, goals and corrections can appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {memories.map(
              (
                memory
              ) => (
                <article
                  key={
                    memory.id
                  }
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:border-white/[0.11] hover:bg-white/[0.035] sm:p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white/45">
                          {
                            KIND_LABELS[
                              memory.kind
                            ]
                          }
                        </span>

                        <span className="text-[10px] text-white/25">
                          confidence
                          {" "}
                          {
                            Math.round(
                              memory.confidence *
                              100
                            )
                          }%
                        </span>

                        <span className="text-[10px] text-white/25">
                          importance
                          {" "}
                          {
                            Math.round(
                              memory.importance *
                              100
                            )
                          }%
                        </span>
                      </div>

                      <p className="text-sm leading-6 text-white/75">
                        {
                          memory.content
                        }
                      </p>

                      <p className="mt-3 text-[10px] text-white/20">
                        Updated
                        {" "}
                        {
                          new Date(
                            memory.updated_at
                          ).toLocaleDateString()
                        }
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label="Delete memory"
                      title="Delete memory"
                      disabled={
                        busyId ===
                        memory.id
                      }
                      onClick={() => {
                        void removeMemory(
                          memory.id
                        );
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-transparent text-white/25 opacity-60 transition hover:border-red-400/10 hover:bg-red-400/[0.07] hover:text-red-200/80 group-hover:opacity-100 disabled:opacity-25"
                    >
                      <Trash2
                        size={14}
                      />
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
