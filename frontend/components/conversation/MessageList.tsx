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
  // SMART AUTO SCROLL
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

    if (!messageCountChanged && !sending) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    const userIsNearBottom =
      distanceFromBottom < 160;

    if (
      messageCountChanged &&
      userIsNearBottom
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
  // EMPTY STATE
  // ==========================================================

  if (
    !loading &&
    messages.length === 0
  ) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
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
        <div className="flex items-center gap-3 text-sm text-white/35">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />

          <span>
            Loading conversation...
          </span>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MESSAGE LIST
  // ==========================================================

  return (
    <div
      ref={scrollRef}
      className="
        min-h-0
        flex-1
        overflow-y-auto
        overscroll-contain
        scroll-smooth
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
          pb-32
          pt-8
          sm:px-6
        "
      >
        <div className="space-y-6">
  {messages.map((message) => (
    <MessageBubble
      key={message.message_id}
      message={message}
    />
  ))}

  {sending && <TypingIndicator />}
</div>

        <div
          ref={bottomRef}
          className="h-px w-full"
        />
      </div>
    </div>
  );
}
