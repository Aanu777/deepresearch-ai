"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  createConversation,
  deleteConversation,
  getConversation,
  getConversations,
  sendConversationMessage,
  type ConversationChat,
  type ConversationMessage,
} from "@/lib/conversation";

import { createClient } from "@/lib/supabase/client";

// ============================================================
// CONTEXT TYPE
// ============================================================

type ConversationContextType = {
  chat: ConversationChat | null;
  messages: ConversationMessage[];
  activeChatId: string | null;

  chats: ConversationChat[];

  loading: boolean;
  historyLoading: boolean;
  sending: boolean;

  newChat: () => Promise<string | null>;

  selectChat: (
    chatId: string
  ) => Promise<void>;

  sendMessage: (
    content: string
  ) => Promise<void>;

  deleteChat: (
    chatId: string
  ) => Promise<void>;

  refreshChats: () => Promise<void>;
};

// ============================================================
// CONTEXT
// ============================================================

const ConversationContext =
  createContext<ConversationContextType | null>(
    null
  );

// ============================================================
// PROVIDER
// ============================================================

export function ConversationProvider({
  children,
}: {
  children: ReactNode;
}) {
  // ==========================================================
  // SUPABASE
  // ==========================================================

  const supabase = createClient();

  // ==========================================================
  // AUTHENTICATION
  // ==========================================================

  const [authenticated, setAuthenticated] =
    useState(false);

  const [authInitialized, setAuthInitialized] =
    useState(false);

  // ==========================================================
  // STATE
  // ==========================================================

  const [chat, setChat] =
    useState<ConversationChat | null>(
      null
    );

  const [messages, setMessages] =
    useState<ConversationMessage[]>(
      []
    );

  const [chats, setChats] =
    useState<ConversationChat[]>(
      []
    );

  const [activeChatId, setActiveChatId] =
    useState<string | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  // ==========================================================
  // AUTHENTICATION STATE
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        setAuthenticated(
          Boolean(session)
        );

        setAuthInitialized(true);
      } catch (error) {
        console.error(
          "Failed to initialize authentication:",
          error
        );

        if (mounted) {
          setAuthenticated(false);
          setAuthInitialized(true);
        }
      }
    }

    initializeAuth();

    const {
      data: { subscription },
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

          // ----------------------------------------------------
          // LOGGED OUT
          // ----------------------------------------------------

          if (!isAuthenticated) {
            setChats([]);

            setChat(null);

            setMessages([]);

            setActiveChatId(null);

            setLoading(false);

            setHistoryLoading(false);

            setSending(false);

            return;
          }

          // ----------------------------------------------------
          // LOGGED IN
          //
          // History loading is handled by the authenticated
          // effect below.
          // ----------------------------------------------------
        }
      );

    return () => {
      mounted = false;

      subscription.unsubscribe();
    };
  }, []);

  // ==========================================================
  // REFRESH CHAT HISTORY
  // ==========================================================

  async function refreshChats() {
    // IMPORTANT:
    // Never call the protected conversations endpoint
    // without an authenticated Supabase session.

    if (!authenticated) {
      setChats([]);
      setHistoryLoading(false);
      return;
    }

    setHistoryLoading(true);

    try {
      const response =
        await getConversations();

      const sortedChats =
        [...response.chats].sort(
          (a, b) =>
            new Date(
              b.updated_at
            ).getTime() -
            new Date(
              a.updated_at
            ).getTime()
        );

      setChats(
        sortedChats
      );
    } catch (error) {
      console.error(
        "Failed to load conversations:",
        error
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  // ==========================================================
  // LOAD HISTORY AFTER AUTHENTICATION
  // ==========================================================

  useEffect(() => {
    if (!authInitialized) {
      return;
    }

    if (!authenticated) {
      return;
    }

    refreshChats();
  }, [
    authInitialized,
    authenticated,
  ]);

  // ==========================================================
  // SELECT EXISTING CHAT
  // ==========================================================

  async function selectChat(
    chatId: string
  ) {
    if (!chatId) {
      return;
    }

    if (!authenticated) {
      return;
    }

    if (
      activeChatId === chatId
    ) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await getConversation(
          chatId
        );

      setChat(
        response.chat
      );

      setMessages(
        response.messages
      );

      setActiveChatId(
        chatId
      );
    } catch (error) {
      console.error(
        "Failed to load conversation:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // NEW CHAT
  // ==========================================================

  async function newChat(): Promise<string | null> {
    if (!authenticated) {
      return null;
    }

    setLoading(true);

    try {
      const newConversation =
        await createConversation();

      setChat(
        newConversation
      );

      setMessages([]);

      setActiveChatId(
        newConversation.chat_id
      );

      setChats(
        (previous) => [
          newConversation,
          ...previous.filter(
            (item) =>
              item.chat_id !==
              newConversation.chat_id
          ),
        ]
      );

      return newConversation.chat_id;
    } catch (error) {
      console.error(
        "Failed to create conversation:",
        error
      );

      return null;
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  async function sendMessage(
    content: string
  ) {
    const trimmed =
      content.trim();

    if (!trimmed) {
      return;
    }

    if (!authenticated) {
      throw new Error(
        "You must be signed in to send a message."
      );
    }

    let chatId =
      activeChatId;

    // --------------------------------------------------------
    // Create conversation automatically if none exists
    // --------------------------------------------------------

    if (!chatId) {
      chatId =
        await newChat();

      if (!chatId) {
        throw new Error(
          "Failed to create conversation."
        );
      }
    }

    setSending(true);

    try {
      const response =
        await sendConversationMessage(
          chatId,
          trimmed
        );

      // ------------------------------------------------------
      // Add both messages
      // ------------------------------------------------------

      setMessages(
        (previous) => [
          ...previous,
          response.user_message,
          response.assistant_message,
        ]
      );

      // ------------------------------------------------------
      // Update current chat
      // ------------------------------------------------------

      setChat(
        response.chat
      );

      // ------------------------------------------------------
      // Update sidebar
      // ------------------------------------------------------

      setChats(
        (previous) => {
          const withoutCurrent =
            previous.filter(
              (item) =>
                item.chat_id !==
                response.chat.chat_id
            );

          return [
            response.chat,
            ...withoutCurrent,
          ];
        }
      );
    } catch (error) {
      console.error(
        "Failed to send conversation message:",
        error
      );

      throw error;
    } finally {
      setSending(false);
    }
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  async function deleteChat(
    chatId: string
  ) {
    if (!authenticated) {
      return;
    }

    try {
      await deleteConversation(
        chatId
      );

      setChats(
        (previous) =>
          previous.filter(
            (item) =>
              item.chat_id !==
              chatId
          )
      );

      if (
        activeChatId ===
        chatId
      ) {
        setChat(null);

        setMessages([]);

        setActiveChatId(
          null
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete conversation:",
        error
      );

      throw error;
    }
  }

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <ConversationContext.Provider
      value={{
        chat,

        messages,

        activeChatId,

        chats,

        loading,

        historyLoading,

        sending,

        newChat,

        selectChat,

        sendMessage,

        deleteChat,

        refreshChats,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useConversation() {
  const context =
    useContext(
      ConversationContext
    );

  if (!context) {
    throw new Error(
      "useConversation must be used inside ConversationProvider"
    );
  }

  return context;
}

export type { ConversationChat, ConversationMessage };