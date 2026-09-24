"use client";

import {
  motion,
} from "framer-motion";

import {
  BrainCircuit,
  FileText,
  Search,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search",
    description:
      "Find relevant information across the web and attached documents.",
  },
  {
    icon: BrainCircuit,
    title: "Analyze",
    description:
      "Extract useful evidence and reason across multiple findings.",
  },
  {
    icon: ShieldCheck,
    title: "Reflect",
    description:
      "Identify weak points, missing context, and conflicting information.",
  },
  {
    icon: FileText,
    title: "Report",
    description:
      "Turn the research into a structured answer with traceable sources.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
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

        <motion.div
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
            margin: "-80px",
          }}
          transition={{
            duration: 0.5,
          }}
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
            How it works
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
            A research workflow,
            not a single prompt.
          </h2>

          <p
            className="
              mt-4
              max-w-xl
              text-sm
              leading-7
              text-white/35
            "
          >
            DeepResearch separates discovery, analysis, reflection,
            and writing into distinct stages so complex questions can
            be handled more systematically.
          </p>
        </motion.div>

        {/* STEPS */}

        <div
          className="
            relative
            mt-14
            grid
            gap-3
            md:grid-cols-2
            lg:grid-cols-4
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              left-[10%]
              right-[10%]
              top-[27px]
              hidden
              h-px
              bg-white/[0.07]
              lg:block
            "
          />

          {steps.map(
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
                    y: 18,
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
                      0.07,
                  }}
                  className="
                    relative
                    rounded-2xl
                    border
                    border-white/[0.07]
                    bg-[#101010]
                    p-5
                  "
                >
                  <div
                    className="
                      relative
                      z-10
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-white/[0.08]
                      bg-[#171717]
                    "
                  >
                    <Icon
                      size={17}
                      className={
                        index ===
                        0
                          ? "text-cyan-300"
                          : "text-white/45"
                      }
                    />
                  </div>

                  <div
                    className="
                      mt-8
                      text-[10px]
                      font-medium
                      text-white/20
                    "
                  >
                    0{index + 1}
                  </div>

                  <h3
                    className="
                      mt-2
                      text-base
                      font-semibold
                      text-white/80
                    "
                  >
                    {step.title}
                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-white/32
                    "
                  >
                    {step.description}
                  </p>
                </motion.div>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}