"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  createConversation,
  deleteConversation,
  editConversationMessage,
  generateConversationImage,
  getConversation,
  getConversations,
  sendConversationMessage,
  sendConversationMessageWithAttachments,
  transcribeConversationAudio,
  type ConversationChat,
  type ConversationMessage,
} from "@/lib/conversation";

import {
  createClient,
} from "@/lib/supabase/client";


/* ============================================================
   ACTIVITY
   ============================================================ */

export type ConversationActivity =
  | "idle"
  | "sending"
  | "generating"
  | "recording"
  | "transcribing"
  | "generating_image"
  | "playing"
  | "retrying"
  | "streaming"
  | "error";


/* ============================================================
   CONTEXT TYPE
   ============================================================ */

type ConversationContextType = {
  chat:
    ConversationChat | null;

  messages:
    ConversationMessage[];

  activeChatId:
    string | null;

  chats:
    ConversationChat[];

  loading:
    boolean;

  historyLoading:
    boolean;

  sending:
    boolean;

  streamingMessageId:
    string | null;

  finishStreamingMessage: (
    messageId: string
  ) => void;

  activity:
    ConversationActivity;

  error:
    string | null;

  isBusy:
    boolean;

  selectedImageForEdit:
    ConversationMessage | null;

  setActivity: (
    activity:
      ConversationActivity
  ) => void;

  setConversationError: (
    message:
      string | null
  ) => void;

  clearConversationError:
    () => void;

  selectImageForEdit: (
    message:
      ConversationMessage
  ) => void;

  clearImageEdit:
    () => void;

  newChat:
    () =>
      Promise<
        string | null
      >;

  selectChat: (
    chatId:
      string
  ) =>
    Promise<void>;

  sendMessage: (
    content:
      string
  ) =>
    Promise<void>;

  editMessage: (
    messageId:
      string,

    content:
      string
  ) =>
    Promise<void>;

  sendMessageWithAttachments: (
    content:
      string,

    files:
      File[]
  ) =>
    Promise<void>;

  transcribeAudio: (
    audio:
      Blob,

    filename?:
      string
  ) =>
    Promise<string>;

  generateImage: (
    prompt:
      string,

    sourceMessageId?:
      string | null
  ) =>
    Promise<
      ConversationMessage
    >;

  deleteChat: (
    chatId:
      string
  ) =>
    Promise<void>;

  refreshChats:
    () =>
      Promise<void>;
};


/* ============================================================
   CONTEXT
   ============================================================ */

const ConversationContext =
  createContext<
    ConversationContextType | null
  >(
    null
  );


/* ============================================================
   PROVIDER
   ============================================================ */

export function ConversationProvider({
  children,
}: {
  children:
    ReactNode;
}) {

  /* ==========================================================
     SUPABASE
     ========================================================== */

  const supabase =
    createClient();


  /* ==========================================================
     AUTH
     ========================================================== */

  const [
    authenticated,
    setAuthenticated,
  ] =
    useState(
      false
    );

  const [
    authInitialized,
    setAuthInitialized,
  ] =
    useState(
      false
    );


  /* ==========================================================
     CHAT STATE
     ========================================================== */

  const [
    chat,
    setChat,
  ] =
    useState<
      ConversationChat | null
    >(
      null
    );

  const [
    messages,
    setMessages,
  ] =
    useState<
      ConversationMessage[]
    >(
      []
    );

  const [
    chats,
    setChats,
  ] =
    useState<
      ConversationChat[]
    >(
      []
    );

  const [
    activeChatId,
    setActiveChatId,
  ] =
    useState<
      string | null
    >(
      null
    );


  /* ==========================================================
     UI STATE
     ========================================================== */

  const [
    loading,
    setLoading,
  ] =
    useState(
      false
    );

  const [
    historyLoading,
    setHistoryLoading,
  ] =
    useState(
      false
    );

  const [
    sending,
    setSending,
  ] =
    useState(
      false
    );

  const [
    activity,
    setActivity,
  ] =
    useState<
      ConversationActivity
    >(
      "idle"
    );

  const [
    streamingMessageId,
    setStreamingMessageId,
  ] =
    useState<
      string | null
    >(
      null
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null
    );


  /* ==========================================================
     IMAGE EDITING
     ========================================================== */

  const [
    selectedImageForEdit,
    setSelectedImageForEdit,
  ] =
    useState<
      ConversationMessage | null
    >(
      null
    );


  /* ==========================================================
     DERIVED
     ========================================================== */

  const isBusy =
    sending ||
    [
      "sending",
      "generating",
      "transcribing",
      "generating_image",
      "retrying",
      "streaming",
    ].includes(
      activity
    );


  /* ==========================================================
     AUTH INITIALIZATION
     ========================================================== */

  useEffect(
    () => {
      let mounted =
        true;


      async function initializeAuth() {
        try {
          const {
            data: {
              session,
            },
          } =
            await supabase
              .auth
              .getSession();


          if (
            !mounted
          ) {
            return;
          }


          setAuthenticated(
            Boolean(
              session
            )
          );

          setAuthInitialized(
            true
          );

        } catch (
          caught
        ) {
          console.error(
            "Failed to initialize authentication:",
            caught
          );


          if (
            mounted
          ) {
            setAuthenticated(
              false
            );

            setAuthInitialized(
              true
            );
          }
        }
      }


      initializeAuth();


      const {
        data: {
          subscription,
        },
      } =
        supabase
          .auth
          .onAuthStateChange(
            (
              _event,
              session
            ) => {

              if (
                !mounted
              ) {
                return;
              }


              const loggedIn =
                Boolean(
                  session
                );


              setAuthenticated(
                loggedIn
              );


              if (
                !loggedIn
              ) {
                setChats(
                  []
                );

                setChat(
                  null
                );

                setMessages(
                  []
                );

                setActiveChatId(
                  null
                );

                setSelectedImageForEdit(
                  null
                );

                setLoading(
                  false
                );

                setHistoryLoading(
                  false
                );

                setSending(
                  false
                );

                setError(
                  null
                );

                setActivity(
                  "idle"
                );
              }
            }
          );


      return () => {
        mounted =
          false;

        subscription
          .unsubscribe();
      };
    },
    []
  );


  /* ==========================================================
     ERROR
     ========================================================== */

  function clearConversationError() {
    setError(
      null
    );


    if (
      activity ===
      "error"
    ) {
      setActivity(
        "idle"
      );
    }
  }


  function setConversationError(
    message:
      string | null
  ) {
    setError(
      message
    );


    if (
      message
    ) {
      setActivity(
        "error"
      );

      return;
    }


    if (
      activity ===
      "error"
    ) {
      setActivity(
        "idle"
      );
    }
  }


  /* ==========================================================
     IMAGE SELECTION
     ========================================================== */

  function selectImageForEdit(
    message:
      ConversationMessage
  ) {
    if (
      message.message_type !==
      "image"
    ) {
      return;
    }


    if (
      !message.image_url
    ) {
      return;
    }


    clearConversationError();


    setSelectedImageForEdit(
      message
    );
  }


  function clearImageEdit() {
    setSelectedImageForEdit(
      null
    );
  }


  /* ==========================================================
     CHAT HISTORY
     ========================================================== */

  async function refreshChats() {
    if (
      !authenticated
    ) {
      setChats(
        []
      );

      setHistoryLoading(
        false
      );

      return;
    }


    setHistoryLoading(
      true
    );


    try {
      const response =
        await getConversations();


      const sorted =
        [
          ...response.chats,
        ].sort(
          (
            first,
            second
          ) =>
            new Date(
              second.updated_at
            ).getTime()
            -
            new Date(
              first.updated_at
            ).getTime()
        );


      setChats(
        sorted
      );

    } catch (
      caught
    ) {
      console.error(
        "Failed to load conversations:",
        caught
      );

    } finally {
      setHistoryLoading(
        false
      );
    }
  }


  /* ==========================================================
     LOAD HISTORY
     ========================================================== */

  useEffect(
    () => {
      if (
        !authInitialized
      ) {
        return;
      }


      if (
        !authenticated
      ) {
        return;
      }


      refreshChats();
    },
    [
      authInitialized,
      authenticated,
    ]
  );


  /* ==========================================================
     SELECT CHAT
     ========================================================== */

  async function selectChat(
    chatId:
      string
  ) {
    if (
      !chatId ||
      !authenticated
    ) {
      return;
    }


    if (
      activeChatId ===
      chatId
    ) {
      return;
    }


    setLoading(
      true
    );

    setError(
      null
    );

    setActivity(
      "idle"
    );

    setStreamingMessageId(
      null
    );

    setSelectedImageForEdit(
      null
    );

    setStreamingMessageId(
      null
    );


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

    } catch (
      caught
    ) {
      console.error(
        "Failed to load conversation:",
        caught
      );


      setConversationError(
        getErrorMessage(
          caught,
          "Failed to load conversation."
        )
      );

    } finally {
      setLoading(
        false
      );
    }
  }


  /* ==========================================================
     NEW CHAT
     ========================================================== */

  async function newChat():
    Promise<
      string | null
    > {

    if (
      !authenticated
    ) {
      return null;
    }


    setLoading(
      true
    );

    setError(
      null
    );

    setSelectedImageForEdit(
      null
    );


    try {
      const created =
        await createConversation();


      setChat(
        created
      );

      setMessages(
        []
      );

      setActiveChatId(
        created.chat_id
      );


      setChats(
        (
          previous
        ) => [
          created,

          ...previous.filter(
            (
              item
            ) =>
              item.chat_id !==
              created.chat_id
          ),
        ]
      );


      return (
        created.chat_id
      );

    } catch (
      caught
    ) {
      console.error(
        "Failed to create conversation:",
        caught
      );


      setConversationError(
        getErrorMessage(
          caught,
          "Failed to create conversation."
        )
      );


      return null;

    } finally {
      setLoading(
        false
      );
    }
  }


  /* ==========================================================
     ENSURE CHAT
     ========================================================== */

  async function ensureChat():
    Promise<string> {

    if (
      activeChatId
    ) {
      return (
        activeChatId
      );
    }


    const chatId =
      await newChat();


    if (
      !chatId
    ) {
      throw new Error(
        "Failed to create conversation."
      );
    }


    return (
      chatId
    );
  }


  /* ==========================================================
     APPLY NORMAL RESPONSE
     ========================================================== */

  function applyMessageResponse(
    response: {
      chat:
        ConversationChat;

      user_message:
        ConversationMessage;

      assistant_message:
        ConversationMessage;
    },
    optimisticMessageId?:
      string
  ) {

    setMessages(
      (
        previous
      ) => {
        const retained =
          optimisticMessageId
            ? previous.filter(
                (
                  message
                ) =>
                  message.message_id !==
                  optimisticMessageId
              )
            : previous;

        return [
          ...retained,

          response
            .user_message,

          response
            .assistant_message,
        ];
      }
    );


    setChat(
      response.chat
    );


    moveChatToTop(
      response.chat
    );
  }


  function createOptimisticUserMessage(
    chatId: string,
    content: string
  ): ConversationMessage {
    return {
      message_id:
        `optimistic-${crypto.randomUUID()}`,

      chat_id:
        chatId,

      role:
        "user",

      message_type:
        "text",

      content,

      image_url:
        null,

      image_prompt:
        null,

      image_operation:
        null,

      image_provider:
        null,

      image_model:
        null,

      image_media_type:
        null,

      parent_image_id:
        null,

      created_at:
        new Date().toISOString(),
    };
  }


  const finishStreamingMessage =
    useCallback(
      (
        messageId: string
      ) => {
        setStreamingMessageId(
          (
            current
          ) =>
            current ===
            messageId
              ? null
              : current
        );

        setActivity(
          (
            current
          ) =>
            current ===
            "streaming"
              ? "idle"
              : current
        );
      },
      []
    );


  /* ==========================================================
     SIDEBAR UPDATE
     ========================================================== */

  function moveChatToTop(
    updatedChat:
      ConversationChat
  ) {

    setChats(
      (
        previous
      ) => [
        updatedChat,

        ...previous.filter(
          (
            item
          ) =>
            item.chat_id !==
            updatedChat
              .chat_id
        ),
      ]
    );
  }


  /* ==========================================================
     SEND TEXT MESSAGE
     ========================================================== */

  async function sendMessage(
    content:
      string
  ) {

    const trimmed =
      content.trim();


    if (
      !trimmed ||
      sending
    ) {
      return;
    }


    if (
      !authenticated
    ) {
      throw new Error(
        "You must be signed in to send a message."
      );
    }


    const chatId =
      await ensureChat();

    const optimisticMessage =
      createOptimisticUserMessage(
        chatId,
        trimmed
      );

    setMessages(
      (
        previous
      ) => [
        ...previous,
        optimisticMessage,
      ]
    );


    setSending(
      true
    );

    setError(
      null
    );

    setActivity(
      "sending"
    );


    try {
      setActivity(
        "generating"
      );


      const response =
        await sendConversationMessage(
          chatId,
          trimmed
        );


      applyMessageResponse(
        response,
        optimisticMessage
          .message_id
      );

      setStreamingMessageId(
        response
          .assistant_message
          .message_id
      );

      setActivity(
        "streaming"
      );

    } catch (
      caught
    ) {
      console.error(
        "Failed to send conversation message:",
        caught
      );


      setMessages(
        (
          previous
        ) =>
          previous.filter(
            (
              message
            ) =>
              message.message_id !==
              optimisticMessage
                .message_id
          )
      );

      setStreamingMessageId(
        null
      );

      setConversationError(
        getErrorMessage(
          caught,
          "Message could not be sent."
        )
      );


      throw caught;

    } finally {
      setSending(
        false
      );
    }
  }


  /* ==========================================================
     EDIT USER TEXT MESSAGE
     ========================================================== */

  async function editMessage(
    messageId:
      string,

    content:
      string
  ) {

    const trimmed =
      content.trim();


    if (
      !trimmed
    ) {
      return;
    }


    if (
      !authenticated
    ) {
      throw new Error(
        "You must be signed in to edit a message."
      );
    }


    if (
      !activeChatId
    ) {
      throw new Error(
        "No active conversation."
      );
    }


    if (
      sending
    ) {
      return;
    }


    setSending(
      true
    );

    setError(
      null
    );

    setActivity(
      "retrying"
    );


    try {
      const response =
        await editConversationMessage(
          activeChatId,
          messageId,
          trimmed
        );


      /*
       * IMPORTANT:
       *
       * Editing an old user message causes the
       * backend to remove the branch after it and
       * regenerate the assistant response.
       *
       * Therefore we replace the WHOLE local message
       * array instead of trying to patch one bubble.
       */

      setMessages(
        response.messages
      );


      setChat(
        response.chat
      );


      moveChatToTop(
        response.chat
      );


      /*
       * If the selected image belonged to a branch
       * that was removed by the text edit, clear it.
       */

      setSelectedImageForEdit(
        (
          current
        ) => {

          if (
            !current
          ) {
            return null;
          }


          const stillExists =
            response.messages
              .some(
                (
                  message
                ) =>
                  message.message_id ===
                  current.message_id
              );


          return (
            stillExists
              ? current
              : null
          );
        }
      );


      setActivity(
        "idle"
      );

    } catch (
      caught
    ) {
      console.error(
        "Failed to edit conversation message:",
        caught
      );


      setConversationError(
        getErrorMessage(
          caught,
          "Message could not be edited."
        )
      );


      throw caught;

    } finally {
      setSending(
        false
      );
    }
  }


  /* ==========================================================
     ATTACHMENT MESSAGE
     ========================================================== */

  async function sendMessageWithAttachments(
    content:
      string,

    files:
      File[]
  ) {

    if (
      files.length ===
      0
    ) {
      await sendMessage(
        content
      );

      return;
    }


    if (
      sending
    ) {
      return;
    }


    if (
      !authenticated
    ) {
      throw new Error(
        "You must be signed in to send attachments."
      );
    }


    const chatId =
      await ensureChat();

    const optimisticMessage =
      createOptimisticUserMessage(
        chatId,
        content.trim() ||
          "Analyze the attached files."
      );

    setMessages(
      (
        previous
      ) => [
        ...previous,
        optimisticMessage,
      ]
    );


    setSending(
      true
    );

    setError(
      null
    );

    setActivity(
      "sending"
    );


    try {
      setActivity(
        "generating"
      );


      const response =
        await sendConversationMessageWithAttachments(
          chatId,
          content,
          files
        );


      applyMessageResponse(
        response,
        optimisticMessage
          .message_id
      );

      setStreamingMessageId(
        response
          .assistant_message
          .message_id
      );

      setActivity(
        "streaming"
      );

    } catch (
      caught
    ) {
      console.error(
        "Attachment message failed:",
        caught
      );


      setMessages(
        (
          previous
        ) =>
          previous.filter(
            (
              message
            ) =>
              message.message_id !==
              optimisticMessage
                .message_id
          )
      );

      setStreamingMessageId(
        null
      );

      setConversationError(
        getErrorMessage(
          caught,
          "The attachment could not be processed."
        )
      );


      throw caught;

    } finally {
      setSending(
        false
      );
    }
  }


  /* ==========================================================
     TRANSCRIBE AUDIO
     ========================================================== */

  async function transcribeAudio(
    audio:
      Blob,

    filename?:
      string
  ) {

    setError(
      null
    );

    setActivity(
      "transcribing"
    );


    try {
      const response =
        await transcribeConversationAudio(
          audio,
          filename
        );


      setActivity(
        "idle"
      );


      return (
        response.text
      );

    } catch (
      caught
    ) {
      console.error(
        "Transcription failed:",
        caught
      );


      setConversationError(
        getErrorMessage(
          caught,
          "Audio transcription failed."
        )
      );


      throw caught;
    }
  }


  /* ==========================================================
     GENERATE / EDIT IMAGE
     ========================================================== */

  async function generateImage(
    prompt:
      string,

    sourceMessageId:
      string | null = null
  ):
    Promise<
      ConversationMessage
    > {

    const trimmed =
      prompt.trim();


    if (
      !trimmed
    ) {
      throw new Error(
        "Image prompt cannot be empty."
      );
    }


    if (
      !authenticated
    ) {
      throw new Error(
        "You must be signed in to generate an image."
      );
    }


    const chatId =
      await ensureChat();


    setError(
      null
    );

    setActivity(
      "generating_image"
    );


    try {
      const response =
        await generateConversationImage(
          chatId,
          trimmed,
          sourceMessageId
        );


      /*
       * Generated images now behave exactly like
       * assistant messages.
       */

      applyMessageResponse(
        response
      );


      /*
       * The latest generated/edited image becomes
       * the active image source.
       *
       * This makes consecutive image editing easy:
       *
       * A → B → C → D
       */

      if (
        response
          .assistant_message
          .message_type ===
        "image"
      ) {

        setSelectedImageForEdit(
          response
            .assistant_message
        );
      }


      setActivity(
        "idle"
      );


      return (
        response
          .assistant_message
      );

    } catch (
      caught
    ) {
      console.error(
        sourceMessageId
          ? "Image editing failed:"
          : "Image generation failed:",
        caught
      );


      setConversationError(
        getErrorMessage(
          caught,
          sourceMessageId
            ? "Image editing failed."
            : "Image generation failed."
        )
      );


      throw caught;
    }
  }


  /* ==========================================================
     DELETE CHAT
     ========================================================== */

  async function deleteChat(
    chatId:
      string
  ) {

    if (
      !authenticated
    ) {
      return;
    }


    try {
      await deleteConversation(
        chatId
      );


      setChats(
        (
          previous
        ) =>
          previous.filter(
            (
              item
            ) =>
              item.chat_id !==
              chatId
          )
      );


      if (
        activeChatId ===
        chatId
      ) {

        setChat(
          null
        );

        setMessages(
          []
        );

        setActiveChatId(
          null
        );

        setSelectedImageForEdit(
          null
        );

        setError(
          null
        );

        setActivity(
          "idle"
        );
      }

    } catch (
      caught
    ) {
      console.error(
        "Failed to delete conversation:",
        caught
      );


      setConversationError(
        getErrorMessage(
          caught,
          "Failed to delete conversation."
        )
      );


      throw caught;
    }
  }


  /* ==========================================================
     PROVIDER
     ========================================================== */

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

        streamingMessageId,

        finishStreamingMessage,

        activity,

        error,

        isBusy,

        selectedImageForEdit,

        setActivity,

        setConversationError,

        clearConversationError,

        selectImageForEdit,

        clearImageEdit,

        newChat,

        selectChat,

        sendMessage,

        editMessage,

        sendMessageWithAttachments,

        transcribeAudio,

        generateImage,

        deleteChat,

        refreshChats,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}


/* ============================================================
   HOOK
   ============================================================ */

export function useConversation() {

  const context =
    useContext(
      ConversationContext
    );


  if (
    !context
  ) {
    throw new Error(
      "useConversation must be used inside ConversationProvider"
    );
  }


  return context;
}


/* ============================================================
   ERROR HELPER
   ============================================================ */

function getErrorMessage(
  error:
    unknown,

  fallback:
    string
) {

  if (
    error instanceof
      Error &&
    error.message
  ) {
    return (
      error.message
    );
  }


  return (
    fallback
  );
}


export type {
  ConversationChat,
  ConversationMessage,
};