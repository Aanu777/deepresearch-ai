"use client";

import {
  BookOpen,
  Code2,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";

import {
  useConversation,
} from "@/components/context/ConversationContext";

import {
  Surface,
} from "@/components/ui";

const suggestions = [
  {
    icon:
      BookOpen,

    title:
      "Research a topic",

    prompt:
      "Research the latest developments in autonomous AI agents",
  },

  {
    icon:
      ShieldCheck,

    title:
      "Explore cybersecurity",

    prompt:
      "Help me explore a new cybersecurity project idea",
  },

  {
    icon:
      Code2,

    title:
      "Build something",

    prompt:
      "Help me design the architecture for an AI application",
  },

  {
    icon:
      Lightbulb,

    title:
      "Explain something",

    prompt:
      "Explain a complex technical concept in simple terms",
  },
];

export default function EmptyConversation() {
  const {
    sendMessage,
    sending,
  } =
    useConversation();

  async function usePrompt(
    prompt: string
  ) {
    if (sending) {
      return;
    }

    try {
      await sendMessage(
        prompt
      );
    } catch (error) {
      console.error(
        "Failed to send suggestion:",
        error
      );
    }
  }

  return (
    <div
      className="
        flex
        min-h-full
        items-center
        justify-center
        px-4
        py-12
      "
    >
      <div
        className="
          w-full
          max-w-2xl
        "
      >
        {/* TITLE */}

        <div className="text-center">
          <h2
            className="
              text-2xl
              font-semibold
              tracking-[-0.03em]
              text-white/95
              sm:text-3xl
            "
          >
            What can I help
            you with?
          </h2>

          <p
            className="
              mx-auto
              mt-2
              max-w-md
              text-sm
              leading-6
              text-white/35
            "
          >
            Ask a question,
            explore an idea,
            or work through
            something complex.
          </p>
        </div>

        {/* SUGGESTIONS */}

        <div
          className="
            mt-8
            grid
            grid-cols-1
            gap-2
            sm:grid-cols-2
          "
        >
          {suggestions.map(
            ({
              icon: Icon,
              title,
              prompt,
            }) => (
              <button
                key={
                  title
                }
                type="button"
                onClick={() =>
                  usePrompt(
                    prompt
                  )
                }
                disabled={
                  sending
                }
                className="
                  text-left
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Surface
                  variant="subtle"
                  className="
                    flex
                    h-full
                    items-start
                    gap-3
                    rounded-xl
                    p-4
                    transition-colors
                    duration-150
                    hover:border-white/[0.10]
                    hover:bg-white/[0.04]
                  "
                >
                  <Icon
                    size={17}
                    className="
                      mt-0.5
                      shrink-0
                      text-white/35
                    "
                  />

                  <div className="min-w-0">
                    <p
                      className="
                        text-sm
                        font-medium
                        text-white/70
                      "
                    >
                      {title}
                    </p>

                    <p
                      className="
                        mt-1
                        line-clamp-2
                        text-xs
                        leading-5
                        text-white/30
                      "
                    >
                      {prompt}
                    </p>
                  </div>
                </Surface>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}