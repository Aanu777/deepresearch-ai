"use client";

import {
  motion,
} from "framer-motion";

import {
  FileSearch,
  FileText,
  Globe2,
  MessageSquare,
  Network,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Network,
    title:
      "Multi-stage research",
    description:
      "A coordinated workflow separates planning, searching, extraction, reflection, synthesis, and writing.",
    featured: true,
  },
  {
    icon: Globe2,
    title:
      "Live web search",
    description:
      "Research current information instead of relying only on model training data.",
  },
  {
    icon: ShieldCheck,
    title:
      "Traceable sources",
    description:
      "Keep source links alongside research so evidence remains inspectable.",
  },
  {
    icon: FileSearch,
    title:
      "PDF research",
    description:
      "Attach documents and use them as part of deeper research tasks.",
  },
  {
    icon: MessageSquare,
    title:
      "Conversation mode",
    description:
      "Switch from long-form research to fast conversational assistance.",
  },
  {
    icon: FileText,
    title:
      "Structured reports",
    description:
      "Turn research into readable reports with sections, summaries, and sources.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="
        border-b
        border-white/[0.06]
        bg-[#080808]
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
            grid
            gap-6
            lg:grid-cols-[1fr_0.8fr]
            lg:items-end
          "
        >
          <div>
            <p
              className="
                text-xs
                font-medium
                text-cyan-300
              "
            >
              Features
            </p>

            <h2
              className="
                mt-3
                max-w-2xl
                text-3xl
                font-semibold
                tracking-[-0.04em]
                text-white
                sm:text-4xl
              "
            >
              Built around the research,
              not the spectacle.
            </h2>
          </div>

          <p
            className="
              max-w-lg
              text-sm
              leading-7
              text-white/32
              lg:justify-self-end
            "
          >
            Every part of DeepResearch is designed to help you move
            from a vague question to evidence, understanding, and a
            usable final answer.
          </p>
        </div>

        {/* BENTO */}

        <div
          className="
            mt-14
            grid
            auto-rows-auto
            gap-3
            md:grid-cols-2
            lg:grid-cols-3
          "
        >
          {features.map(
            (
              feature,
              index
            ) => {
              const Icon =
                feature.icon;

              return (
                <motion.article
                  key={
                    feature.title
                  }
                  initial={{
                    opacity: 0,
                    y: 16,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    margin: "-60px",
                  }}
                  transition={{
                    duration: 0.45,
                    delay:
                      index *
                      0.05,
                  }}
                  className={`
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/[0.07]
                    bg-[#101010]
                    p-6
                    transition-colors
                    duration-200
                    hover:border-white/[0.11]
                    hover:bg-[#121212]
                    ${
                      feature.featured
                        ? "md:col-span-2 lg:col-span-2"
                        : ""
                    }
                  `}
                >
                  {feature.featured && (
                    <div
                      className="
                        pointer-events-none
                        absolute
                        right-[-100px]
                        top-[-120px]
                        h-[280px]
                        w-[280px]
                        rounded-full
                        bg-cyan-400/[0.035]
                        blur-[80px]
                      "
                    />
                  )}

                  <div
                    className="
                      relative
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
                        feature.featured
                          ? "text-cyan-300"
                          : "text-white/40"
                      }
                    />
                  </div>

                  <div
                    className={`
                      relative
                      ${
                        feature.featured
                          ? "mt-16 max-w-xl"
                          : "mt-10"
                      }
                    `}
                  >
                    <h3
                      className="
                        text-base
                        font-semibold
                        tracking-[-0.02em]
                        text-white/80
                      "
                    >
                      {feature.title}
                    </h3>

                    <p
                      className="
                        mt-2
                        text-sm
                        leading-6
                        text-white/30
                      "
                    >
                      {feature.description}
                    </p>
                  </div>
                </motion.article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}