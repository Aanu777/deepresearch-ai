"use client";

import type { ConversationMessage } from "@/lib/conversation";

type MessageBubbleProps = {
  message: ConversationMessage;
};

export default function MessageBubble({
  message,
}: MessageBubbleProps) {
  const isUser =
    message.role === "user";

  return (
    <div
      className={[
        "w-full",
        isUser
          ? "flex justify-end"
          : "flex justify-start",
      ].join(" ")}
    >
      <div
        className={[
          "text-[15px] leading-7",
          "break-words whitespace-pre-wrap",
          isUser
            ? [
                "max-w-[80%]",
                "rounded-3xl",
                "bg-[#2F2F2F]",
                "px-5 py-3",
                "text-white",
              ].join(" ")
            : [
                "w-full",
                "max-w-[calc(100%-0px)]",
                "py-2",
                "pr-8",
                "text-white/90",
              ].join(" "),
        ].join(" ")}
      >
        {message.content}
      </div>
    </div>
  );
}

