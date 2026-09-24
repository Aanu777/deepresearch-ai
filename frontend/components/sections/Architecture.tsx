"use client";

import {
  motion,
} from "framer-motion";

import {
  BrainCircuit,
  FileSearch,
  FileText,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

const pipeline = [
  {
    icon:
      BrainCircuit,
    title:
      "Planner",
    description:
      "Breaks the research request into a structured plan.",
  },
  {
    icon:
      Search,
    title:
      "Searcher",
    description:
      "Collects relevant information from external sources.",
  },
  {
    icon:
      FileSearch,
    title:
      "Extractor",
    description:
      "Pulls useful evidence and context from gathered material.",
  },
  {
    icon:
      RefreshCw,
    title:
      "Reflection",
    description:
      "Reviews findings and identifies gaps that need attention.",
  },
  {
    icon:
      Sparkles,
    title:
      "Synthesizer",
    description:
      "Combines evidence into a coherent understanding.",
  },
  {
    icon:
      FileText,
    title:
      "Writer",
    description:
      "Produces the final structured research report.",
  },
];

export default function Architecture() {
  return (
    <section
      id="architecture"
      className="
        border-b
        border-white/[0.06]
        bg-[#050505]
        py-24
        sm:py-28
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1200px]
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* HEADER */}

        <div
          className="
            max-w-2xl
          "
        >
          <p
            className="
              text-xs
              font-medium
              text-cyan-300
            "
          >
            Architecture
          </p>

          <h2
            className="
              mt-3
              text-3xl
              font-semibold
              tracking-[-0.04em]
              text-white
              sm:text-4xl
            "
          >
            One request.
            Multiple specialized stages.
          </h2>

          <p
            className="
              mt-4
              max-w-xl
              text-sm
              leading-7
              text-white/32
            "
          >
            Instead of asking one model to perform the entire task
            at once, DeepResearch passes state through a structured
            research pipeline.
          </p>
        </div>

        {/* PIPELINE */}

        <div
          className="
            mt-14
            overflow-hidden
            rounded-2xl
            border
            border-white/[0.07]
            bg-[#0d0d0d]
          "
        >
          {pipeline.map(
            (
              step,
              index
            ) => {
              const Icon =
                step.icon;

              return (
                <motion.div
                  key={
                    step.title
                  }
                  initial={{
                    opacity: 0,
                    x: -12,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.4,
                    delay:
                      index *
                      0.05,
                  }}
                  className="
                    group
                    grid
                    gap-4
                    border-b
                    border-white/[0.06]
                    p-4
                    transition-colors
                    last:border-b-0
                    hover:bg-white/[0.02]
                    sm:grid-cols-[44px_160px_1fr_70px]
                    sm:items-center
                    sm:p-5
                  "
                >
                  {/* ICON */}

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-white/[0.07]
                      bg-white/[0.025]
                    "
                  >
                    <Icon
                      size={16}
                      className={
                        index ===
                        0
                          ? "text-cyan-300"
                          : "text-white/35"
                      }
                    />
                  </div>

                  {/* NAME */}

                  <div>
                    <p
                      className="
                        text-sm
                        font-medium
                        text-white/70
                      "
                    >
                      {step.title}
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[10px]
                        text-white/18
                        sm:hidden
                      "
                    >
                      Stage {index + 1}
                    </p>
                  </div>

                  {/* DESCRIPTION */}

                  <p
                    className="
                      text-xs
                      leading-5
                      text-white/28
                    "
                  >
                    {step.description}
                  </p>

                  {/* STAGE */}

                  <span
                    className="
                      hidden
                      text-right
                      text-[10px]
                      font-medium
                      text-white/15
                      sm:block
                    "
                  >
                    0{index + 1}
                  </span>
                </motion.div>
              );
            }
          )}
        </div>

        <div
          className="
            mt-5
            flex
            items-center
            gap-2
            text-[11px]
            text-white/20
          "
        >
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-cyan-400
            "
          />

          Each stage contributes to the same evolving research state.
        </div>
      </div>
    </section>
  );
}