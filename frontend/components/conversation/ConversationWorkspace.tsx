"use client";

import ConversationHeader from "./ConversationHeader";
import MessageList from "./MessageList";
import ConversationComposer from "./ConversationComposer";

export default function ConversationWorkspace() {
  return (
    <main className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#05070B] text-white">
      {/* Header stays fixed */}
      <div className="shrink-0">
        <ConversationHeader />
      </div>

      {/* Chat area */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* ONLY THIS AREA SCROLLS */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <MessageList />
        </div>

        {/* Composer NEVER moves down with messages */}
        <div className="shrink-0 border-t border-white/[0.06] bg-[#05070B]/95 backdrop-blur-xl">
          <ConversationComposer />
        </div>
      </div>
    </main>
  );
}