"use client";

import { useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

import { useConversation } from "@/components/context/ConversationContext";

export default function ConversationComposer() {
  const [message, setMessage] = useState("");

  const {
    sendMessage,
    sending,
  } = useConversation();

  async function handleSubmit() {
    const trimmed = message.trim();

    if (!trimmed || sending) {
      return;
    }

    setMessage("");

    try {
      await sendMessage(trimmed);
    } catch (error) {
      console.error(
        "Failed to send message:",
        error
      );

      // Restore message if sending fails.
      setMessage(trimmed);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="w-full px-4 pb-4 pt-3">
      <div className="mx-auto w-full max-w-3xl">
        <div
          className={[
            "relative overflow-hidden rounded-2xl",
            "border border-white/[0.10]",
            "bg-[#0B0E14]",
            "shadow-[0_-10px_40px_rgba(0,0,0,0.25)]",
            "transition-all duration-200",
            "focus-within:border-violet-400/40",
            "focus-within:shadow-[0_0_30px_rgba(139,92,246,0.08)]",
          ].join(" ")}
        >
          <textarea
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            disabled={sending}
            rows={1}
            placeholder="Message DeepResearch AI..."
            className={[
              "block w-full resize-none",
              "bg-transparent",
              "px-5 pb-14 pt-4",
              "text-[15px] leading-6 text-white",
              "outline-none",
              "placeholder:text-slate-600",
              "disabled:cursor-not-allowed",
            ].join(" ")}
            style={{
              maxHeight: "180px",
            }}
          />

          <div className="absolute bottom-2.5 left-4 right-3 flex items-center justify-between">
            <div className="text-[11px] text-slate-600">
              Enter to send · Shift + Enter for new line
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                sending ||
                message.trim().length === 0
              }
              className={[
                "flex h-9 w-9 items-center justify-center rounded-xl",
                "transition-all duration-150",
                message.trim() && !sending
                  ? "bg-violet-500 text-white hover:bg-violet-400"
                  : "bg-white/[0.06] text-slate-600",
                "disabled:cursor-not-allowed",
              ].join(" ")}
              aria-label="Send message"
            >
              {sending ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <ArrowUp size={18} />
              )}
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-[10px] text-slate-700">
          DeepResearch AI can make mistakes. Check important information.
        </p>
      </div>
    </div>
  );
}
