"use client";

import {
  Spinner,
} from "@/components/ui";

export default function TypingIndicator() {
  return (
    <div
      className="
        flex
        w-full
        items-center
        gap-2
        py-1
      "
    >
      <Spinner
        size={14}
        className="text-white/35"
      />

      <span
        className="
          text-xs
          text-white/30
        "
      >
        Thinking
      </span>
    </div>
  );
}