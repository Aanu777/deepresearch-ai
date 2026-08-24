
"use client";

export default function TypingIndicator() {
  return (
    <div className="group flex w-full justify-start">
      <div className="flex max-w-[85%] gap-3 sm:max-w-[80%]">
        {/* ================================================== */}
        {/* AI AVATAR */}
        {/* ================================================== */}

        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-400/10 bg-cyan-400/[0.06]">
          <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
        </div>

        {/* ================================================== */}
        {/* TYPING DOTS */}
        {/* ================================================== */}

        <div className="flex items-center gap-1.5 py-3">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/35 [animation-delay:-0.3s]" />

          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/35 [animation-delay:-0.15s]" />

          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/35" />
        </div>
      </div>
    </div>
  );
}

