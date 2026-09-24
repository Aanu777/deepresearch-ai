"use client";

import {
  Circle,
} from "lucide-react";

import {
  useConversation,
} from "@/components/context/ConversationContext";

import {
  Badge,
} from "@/components/ui";

export default function ConversationHeader() {
  const {
    chat,
  } = useConversation();

  return (
    <header
      className="
        flex
        h-14
        shrink-0
        items-center
        justify-between
        border-b
        border-white/[0.06]
        bg-[#050505]/95
        pl-16
        pr-4
        backdrop-blur-xl
        sm:pl-16
        sm:pr-5
        lg:px-5
      "
    >
      {/* LEFT */}

      <div className="min-w-0">
        <p
          className="
            truncate
            text-sm
            font-medium
            tracking-[-0.01em]
            text-white/90
          "
        >
          {chat?.title ||
            "New Chat"}
        </p>

        <p
          className="
            mt-0.5
            text-[11px]
            text-white/30
          "
        >
          Conversation
        </p>
      </div>

      {/* RIGHT */}

      <Badge
        variant="success"
        className="
          hidden
          sm:inline-flex
        "
      >
        <Circle
          size={6}
          fill="currentColor"
        />

        Online
      </Badge>
    </header>
  );
}