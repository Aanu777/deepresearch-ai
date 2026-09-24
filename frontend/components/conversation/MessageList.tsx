"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  useConversation,
} from "@/components/context/ConversationContext";

import EmptyConversation from "./EmptyConversation";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function MessageList() {
  const {
    messages,
    sending,
    loading,
  } = useConversation();

  const scrollRef =
    useRef<HTMLDivElement | null>(null);

  const bottomRef =
    useRef<HTMLDivElement | null>(null);

  const previousMessageCount =
    useRef(messages.length);

  // ==========================================================
  // AUTO SCROLL
  // ==========================================================

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const messageCountChanged =
      messages.length !==
      previousMessageCount.current;

    previousMessageCount.current =
      messages.length;

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    const nearBottom =
      distanceFromBottom < 220;

    if (
      messageCountChanged &&
      nearBottom
    ) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });

      return;
    }

    if (sending) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [
    messages.length,
    sending,
  ]);

  // ==========================================================
  // EMPTY
  // ==========================================================

  if (
    !loading &&
    messages.length === 0
  ) {
    return (
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <EmptyConversation />
      </div>
    );
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading &&
    messages.length === 0
  ) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-white/40">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />

          <span>
            Loading conversation...
          </span>
        </div>
      </div>
    );
  }

  // ==========================================================
  // CHAT
  // ==========================================================

  return (
    <div
      ref={scrollRef}
      className="
        min-h-0
        flex-1
        overflow-y-auto
        overscroll-contain
      "
    >
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-3xl
          flex-col
          px-4
          pb-16
          pt-8
          sm:px-6
          sm:pt-10
        "
      >
        <div className="space-y-8">
          {messages.map(
            (message) => (
              <MessageBubble
                key={
                  message.message_id
                }
                message={
                  message
                }
              />
            )
          )}

          {sending && (
            <TypingIndicator />
          )}
        </div>

        <div
          ref={bottomRef}
          className="h-1"
        />
      </div>
    </div>
  );
}