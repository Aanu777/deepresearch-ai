"use client";

export default function TypingIndicator() {
  return (
    <div
      className="
        flex
        w-full
        items-center
        gap-3
        py-1.5
      "
      aria-live="polite"
      aria-label="DeepResearch is thinking"
    >
      <div
        className="
          flex
          h-6
          items-center
          gap-1
        "
        aria-hidden="true"
      >
        {[0, 1, 2].map(
          (index) => (
            <span
              key={index}
              className="
                h-1.5
                w-1.5
                animate-bounce
                rounded-full
                bg-white/45
              "
              style={{
                animationDelay:
                  `${index * 120}ms`,
                animationDuration:
                  "900ms",
              }}
            />
          )
        )}
      </div>

      <span
        className="
          animate-pulse
          text-xs
          font-medium
          tracking-wide
          text-white/35
        "
      >
        Thinking
      </span>
    </div>
  );
}
