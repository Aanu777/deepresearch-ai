import {
  createClient,
} from "@/lib/supabase/client";

import {
  secureFetch,
} from "@/lib/secure-transport";


/* ============================================================
   API
   ============================================================ */

const API_URL =
  (
    process.env
      .NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:8000/api/v1"
  ).replace(
    /\/$/,
    ""
  );


/* ============================================================
   CHAT
   ============================================================ */

export type ConversationChat = {
  chat_id: string;

  user_id?: string;

  title: string;

  message_ids?: string[];

  job_ids?: string[];

  created_at: string;

  updated_at: string;
};


/* ============================================================
   MESSAGE TYPES
   ============================================================ */

export type ConversationMessageType =
  | "text"
  | "image";


export type ConversationImageOperation =
  | "generation"
  | "edit";


/* ============================================================
   MESSAGE
   ============================================================ */

export type ConversationMessage = {
  message_id: string;

  chat_id: string;

  role:
    | "user"
    | "assistant";

  message_type:
    ConversationMessageType;

  /* ========================================================
     TEXT
     ======================================================== */

  content: string;

  /* ========================================================
     IMAGE
     ======================================================== */

  image_url:
    string | null;

  image_prompt:
    string | null;

  image_operation:
    ConversationImageOperation | null;

  image_provider:
    string | null;

  image_model:
    string | null;

  image_media_type:
    string | null;

  parent_image_id:
    string | null;

  /* ========================================================
     TIME
     ======================================================== */

  created_at: string;
};


/* ============================================================
   GET CONVERSATION RESPONSE
   ============================================================ */

export type ConversationResponse = {
  chat:
    ConversationChat;

  jobs?: unknown[];

  messages:
    ConversationMessage[];
};


/* ============================================================
   NORMAL SEND RESPONSE
   ============================================================ */

export type SendMessageResponse = {
  chat:
    ConversationChat;

  user_message:
    ConversationMessage;

  assistant_message:
    ConversationMessage;
};


/* ============================================================
   EDIT MESSAGE RESPONSE
   ============================================================ */

export type EditMessageResponse = {
  chat:
    ConversationChat;

  messages:
    ConversationMessage[];

  edited_message:
    ConversationMessage;

  assistant_message:
    ConversationMessage;
};


/* ============================================================
   HISTORY RESPONSE
   ============================================================ */

export type ConversationHistoryResponse = {
  total: number;

  chats:
    ConversationChat[];
};


/* ============================================================
   TRANSCRIPTION
   ============================================================ */

export type TranscriptionResult = {
  text: string;
};


/* ============================================================
   IMAGE REQUEST
   ============================================================ */

export type GenerateImageRequest = {
  chat_id: string;

  prompt: string;

  source_message_id:
    string | null;
};


export type ConversationFeedbackRating =
  | "up"
  | "down";


export type ConversationFeedbackReason =
  | "incorrect"
  | "did_not_follow_instructions"
  | "outdated"
  | "too_verbose"
  | "too_brief"
  | "bad_sources"
  | "formatting"
  | "other";


export type ConversationFeedbackInput = {
  rating:
    ConversationFeedbackRating;

  reason?:
    ConversationFeedbackReason;

  correction?:
    string;
};


/* ============================================================
   AUTHENTICATED FETCH
   ============================================================ */

async function authenticatedFetch(
  path: string,
  options: RequestInit = {}
) {
  const supabase =
    createClient();

  const {
    data,
    error,
  } =
    await supabase.auth
      .getSession();


  if (
    error
  ) {
    throw new Error(
      error.message
    );
  }


  const accessToken =
    data.session
      ?.access_token;


  if (
    !accessToken
  ) {
    throw new Error(
      "You are not signed in."
    );
  }


  const headers =
    new Headers(
      options.headers
    );


  headers.set(
    "Authorization",
    `Bearer ${accessToken}`
  );


  const response =
    await secureFetch(
      `${API_URL}${path}`,
      {
        ...options,

        headers,

        cache:
          "no-store",
      }
    );


  if (
    !response.ok
  ) {
    throw new Error(
      await readApiError(
        response
      )
    );
  }


  return response;
}


/* ============================================================
   API ERROR
   ============================================================ */

async function readApiError(
  response: Response
) {
  try {
    const data =
      await response.json();


    if (
      typeof data?.detail ===
      "string"
    ) {
      return data.detail;
    }


    if (
      typeof data?.message ===
      "string"
    ) {
      return data.message;
    }


    if (
      Array.isArray(
        data?.detail
      )
    ) {
      return data.detail
        .map(
          (
            item: {
              msg?: string;
            }
          ) =>
            item.msg ??
            "Validation error"
        )
        .join(
          ", "
        );
    }

  } catch {
    // Fall through.
  }


  return (
    `Request failed ` +
    `(${response.status}).`
  );
}


/* ============================================================
   CREATE CHAT
   ============================================================ */

export async function createConversation():
  Promise<ConversationChat> {

  const response =
    await authenticatedFetch(
      "/conversations/",
      {
        method:
          "POST",
      }
    );


  return response.json();
}


/* ============================================================
   LIST CHATS
   ============================================================ */

export async function getConversations():
  Promise<ConversationHistoryResponse> {

  const response =
    await authenticatedFetch(
      "/conversations/",
      {
        method:
          "GET",
      }
    );


  return response.json();
}


/* ============================================================
   GET CHAT
   ============================================================ */

export async function getConversation(
  chatId: string
): Promise<ConversationResponse> {

  const response =
    await authenticatedFetch(
      `/conversations/${encodeURIComponent(
        chatId
      )}`,
      {
        method:
          "GET",
      }
    );


  return response.json();
}


/* ============================================================
   GET MESSAGES
   ============================================================ */

export async function getConversationMessages(
  chatId: string
): Promise<{
  chat_id: string;

  total: number;

  messages:
    ConversationMessage[];
}> {

  const response =
    await authenticatedFetch(
      `/conversations/${encodeURIComponent(
        chatId
      )}/messages`,
      {
        method:
          "GET",
      }
    );


  return response.json();
}


/* ============================================================
   SEND NORMAL MESSAGE
   ============================================================ */

export async function sendConversationMessage(
  chatId: string,
  content: string
): Promise<SendMessageResponse> {

  const response =
    await authenticatedFetch(
      `/conversations/${encodeURIComponent(
        chatId
      )}/messages`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            content,
          }),
      }
    );


  return response.json();
}


/* ============================================================
   EDIT EXISTING USER MESSAGE
   ============================================================ */

export async function editConversationMessage(
  chatId: string,
  messageId: string,
  content: string
): Promise<EditMessageResponse> {

  const response =
    await authenticatedFetch(
      `/conversations/${encodeURIComponent(
        chatId
      )}/messages/${encodeURIComponent(
        messageId
      )}`,
      {
        method:
          "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            content,
          }),
      }
    );


  return response.json();
}


/* ============================================================
   ASSISTANT FEEDBACK
   ============================================================ */

export async function submitConversationFeedback(
  chatId: string,
  messageId: string,
  feedback:
    ConversationFeedbackInput
): Promise<{
  saved: boolean;
  rating:
    ConversationFeedbackRating;
  correction_learning:
    boolean;
}> {

  const response =
    await authenticatedFetch(
      `/conversations/${encodeURIComponent(
        chatId
      )}/messages/${encodeURIComponent(
        messageId
      )}/feedback`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            feedback
          ),
      }
    );


  return response.json();
}


/* ============================================================
   SEND ATTACHMENTS
   ============================================================ */

export async function sendConversationMessageWithAttachments(
  chatId: string,
  content: string,
  files: File[]
): Promise<SendMessageResponse> {

  const form =
    new FormData();


  form.append(
    "content",
    content
  );


  files.forEach(
    (
      file
    ) => {
      form.append(
        "files",
        file,
        file.name
      );
    }
  );


  const response =
    await authenticatedFetch(
      `/conversations/${encodeURIComponent(
        chatId
      )}/messages-with-attachments`,
      {
        method:
          "POST",

        body:
          form,
      }
    );


  return response.json();
}


/* ============================================================
   TRANSCRIBE AUDIO
   ============================================================ */

export async function transcribeConversationAudio(
  audio: Blob,
  filename =
    "conversation-recording.webm"
): Promise<TranscriptionResult> {

  const form =
    new FormData();


  form.append(
    "audio",
    audio,
    filename
  );


  const response =
    await authenticatedFetch(
      "/conversations/transcribe",
      {
        method:
          "POST",

        body:
          form,
      }
    );


  return response.json();
}


/* ============================================================
   GENERATE / EDIT IMAGE
   ============================================================ */

export async function generateConversationImage(
  chatId: string,
  prompt: string,
  sourceMessageId:
    string | null = null
): Promise<SendMessageResponse> {

  const payload:
    GenerateImageRequest = {
      chat_id:
        chatId,

      prompt,

      source_message_id:
        sourceMessageId,
    };


  const response =
    await authenticatedFetch(
      "/conversations/generate-image",
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload
          ),
      }
    );


  return response.json();
}


/* ============================================================
   DELETE CHAT
   ============================================================ */

export async function deleteConversation(
  chatId: string
): Promise<{
  success: boolean;

  message: string;
}> {

  const response =
    await authenticatedFetch(
      `/conversations/${encodeURIComponent(
        chatId
      )}`,
      {
        method:
          "DELETE",
      }
    );


  return response.json();
}