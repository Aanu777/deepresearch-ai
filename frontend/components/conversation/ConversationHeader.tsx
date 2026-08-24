"use client";

import { useConversation } from "@/components/context/ConversationContext";

export default function ConversationHeader() {
  const {
    chat,
    activeChatId,
  } = useConversation();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#05070B]/95 px-5 backdrop-blur-xl">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
          <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-medium text-white">
            {chat?.title || "New Chat"}
          </h1>

          <p className="text-[11px] text-white/35">
            Conversation Mode
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1.5 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />

          <span className="text-[11px] text-white/45">
            Online
          </span>
        </div>

        {activeChatId && (
          <div className="hidden rounded-lg px-2.5 py-1.5 text-[11px] text-white/25 md:block">
            Conversation
          </div>
        )}
      </div>
    </header>
  );
}
