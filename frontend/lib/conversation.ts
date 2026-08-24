import { api } from "./api";

// ============================================================
// TYPES
// ============================================================

export type ConversationChat = {
  chat_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  job_ids: string[];
  message_ids: string[];
};

export type ConversationMessage = {
  message_id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type ConversationChatResponse = {
  chat: ConversationChat;
  jobs: unknown[];
  messages: ConversationMessage[];
};

export type SendMessageResponse = {
  chat: ConversationChat;
  user_message: ConversationMessage;
  assistant_message: ConversationMessage;
};

// ============================================================
// CREATE CHAT
// ============================================================

export async function createConversation() {
  const response = await api.post(
    "/conversations/"
  );

  return response.data as ConversationChat;
}

// ============================================================
// LIST CHATS
// ============================================================

export async function getConversations() {
  const response = await api.get(
    "/conversations/"
  );

  return response.data as {
    total: number;
    chats: ConversationChat[];
  };
}

// ============================================================
// GET CHAT
// ============================================================

export async function getConversation(
  chatId: string
) {
  const response = await api.get(
    `/conversations/${chatId}`
  );

  return response.data as ConversationChatResponse;
}

// ============================================================
// GET MESSAGES
// ============================================================

export async function getConversationMessages(
  chatId: string
) {
  const response = await api.get(
    `/conversations/${chatId}/messages`
  );

  return response.data as {
    chat_id: string;
    total: number;
    messages: ConversationMessage[];
  };
}

// ============================================================
// SEND MESSAGE
// ============================================================

export async function sendConversationMessage(
  chatId: string,
  content: string
) {
  const response = await api.post(
    `/conversations/${chatId}/messages`,
    {
      content,
    }
  );

  return response.data as SendMessageResponse;
}

// ============================================================
// DELETE CHAT
// ============================================================

export async function deleteConversation(
  chatId: string
) {
  const response = await api.delete(
    `/conversations/${chatId}`
  );

  return response.data as {
    success: boolean;
    message: string;
  };
}