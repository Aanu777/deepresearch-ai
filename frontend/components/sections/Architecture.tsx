"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  Search,
  Sparkles,
  ShieldCheck,
  FileText,
  ArrowRight,
  Activity,
} from "lucide-react";

import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";

const pipeline = [
  {
    icon: BrainCircuit,
    title: "Planner",
    description:
      "Breaks the research request into intelligent subtasks.",
  },
  {
    icon: Search,
    title: "Searcher",
    description:
      "Collects relevant information from trusted online sources.",
  },
  {
    icon: Sparkles,
    title: "Reflection",
    description:
      "Reasons over findings and identifies missing information.",
  },
  {
    icon: ShieldCheck,
    title: "Verifier",
    description:
      "Cross-checks claims and validates source credibility.",
  },
  {
    icon: FileText,
    title: "Writer",
    description:
      "Produces a polished report with citations and references.",
  },
];

export default function Architecture() {
  return (
    <Section id="architecture">
      <Heading
        eyebrow="Research Pipeline"
        title="How DeepResearch Thinks"
        description="Instead of asking one model to do everything, DeepResearch coordinates multiple specialized AI agents that work together to produce reliable research."
      />

      {/* ====================================================== */}
      {/* PIPELINE */}
      {/* ====================================================== */}

      <div className="relative mx-auto mt-20 max-w-6xl">

        {/* Ambient glow */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-[600px]
            w-[600px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-cyan-500/[0.035]
            blur-[140px]
          "
        />

        {/* ================================================== */}
        {/* DESKTOP FLOW LINE */}
        {/* ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            left-[10%]
            right-[10%]
            top-[78px]
            hidden
            h-px
            bg-gradient-to-r
            from-transparent
            via-cyan-400/20
            to-transparent
            xl:block
          "
        />

        {/* Animated signal */}

        <motion.div
          initial={{
            left: "10%",
            opacity: 0,
          }}
          whileInView={{
            left: "90%",
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 4,
            delay: 0.5,
            ease: "easeInOut",
          }}
          viewport={{
            once: true,
          }}
          className="
            pointer-events-none
            absolute
            top-[74px]
            z-20
            hidden
            h-[8px]
            w-[8px]
            -translate-x-1/2
            rounded-full
            bg-cyan-300
            shadow-[0_0_20px_rgba(34,211,238,0.95)]
            xl:block
          "
        />

        {/* ================================================== */}
        {/* AGENT GRID */}
        {/* ================================================== */}

        <div className="grid gap-5 xl:grid-cols-5">

          {pipeline.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{
                  opacity: 0,
                  y: 35,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.65,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                viewport={{
                  once: true,
                  margin: "-80px",
                }}
                className="group relative"
              >

                {/* ================================================= */}
                {/* MOBILE / TABLET CONNECTOR */}
                {/* ================================================= */}

                {index !== pipeline.length - 1 && (
                  <div
                    className="
                      pointer-events-none
                      absolute
                      bottom-[-22px]
                      left-1/2
                      z-20
                      flex
                      -translate-x-1/2
                      xl:hidden
                    "
                  >
                    <ArrowRight
                      size={20}
                      className="
                        rotate-90
                        text-cyan-400/30
                        transition-all
                        duration-300
                        group-hover:text-cyan-400/70
                      "
                    />
                  </div>
                )}

                {/* ================================================= */}
                {/* CARD */}
                {/* ================================================= */}

                <div
                  className="
                    relative
                    h-full
                    min-h-[280px]
                    overflow-hidden
                    rounded-[28px]
                    border
                    border-white/[0.08]
                    bg-[#0a1018]/90
                    p-7
                    backdrop-blur-xl
                    transition-all
                    duration-500
                    group-hover:-translate-y-2
                    group-hover:border-cyan-400/25
                    group-hover:bg-[#0d1621]
                    group-hover:shadow-[0_25px_70px_rgba(0,0,0,0.35)]
                  "
                >

                  {/* Top accent */}

                  <div
                    className="
                      absolute
                      inset-x-0
                      top-0
                      h-px
                      bg-gradient-to-r
                      from-transparent
                      via-cyan-400/0
                      to-transparent
                      transition-all
                      duration-500
                      group-hover:via-cyan-400/60
                    "
                  />

                  {/* Hover glow */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      -right-20
                      -top-20
                      h-44
                      w-44
                      rounded-full
                      bg-cyan-400/0
                      blur-[70px]
                      transition-all
                      duration-500
                      group-hover:bg-cyan-400/10
                    "
                  />

                  {/* Agent number */}

                  <div
                    className="
                      absolute
                      right-6
                      top-6
                      text-[11px]
                      font-semibold
                      tracking-[0.2em]
                      text-slate-700
                      transition-colors
                      duration-300
                      group-hover:text-cyan-400/40
                    "
                  >
                    0{index + 1}
                  </div>

                  {/* ================================================= */}
                  {/* ICON */}
                  {/* ================================================= */}

                  <div
                    className="
                      relative
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-cyan-400/10
                      bg-cyan-400/[0.06]
                      transition-all
                      duration-500
                      group-hover:border-cyan-400/25
                      group-hover:bg-cyan-400/[0.11]
                      group-hover:shadow-[0_0_35px_rgba(34,211,238,0.12)]
                    "
                  >
                    <Icon
                      size={29}
                      strokeWidth={1.7}
                      className="
                        text-cyan-400
                        transition-transform
                        duration-500
                        group-hover:scale-110
                      "
                    />
                  </div>

                  {/* ================================================= */}
                  {/* STATUS */}
                  {/* ================================================= */}

                  <div className="mt-7 flex items-center gap-2">

                    <span
                      className="
                        relative
                        flex
                        h-2
                        w-2
                      "
                    >
                      <span
                        className="
                          absolute
                          inline-flex
                          h-full
                          w-full
                          animate-ping
                          rounded-full
                          bg-cyan-400/40
                        "
                      />

                      <span
                        className="
                          relative
                          inline-flex
                          h-2
                          w-2
                          rounded-full
                          bg-cyan-400
                        "
                      />
                    </span>

                    <span
                      className="
                        flex
                        items-center
                        gap-1.5
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.18em]
                        text-cyan-400/60
                      "
                    >
                      <Activity size={11} />
                      Agent active
                    </span>

                  </div>

                  {/* ================================================= */}
                  {/* CONTENT */}
                  {/* ================================================= */}

                  <h3
                    className="
                      mt-4
                      text-xl
                      font-semibold
                      tracking-tight
                      text-white
                    "
                  >
                    {step.title}
                  </h3>

                  <p
                    className="
                      mt-3
                      text-sm
                      leading-6
                      text-slate-400
                    "
                  >
                    {step.description}
                  </p>

                  {/* ================================================= */}
                  {/* BOTTOM LINE */}
                  {/* ================================================= */}

                  <div
                    className="
                      absolute
                      bottom-0
                      left-7
                      right-7
                      h-px
                      bg-gradient-to-r
                      from-cyan-400/0
                      via-cyan-400/0
                      to-cyan-400/0
                      transition-all
                      duration-500
                      group-hover:via-cyan-400/20
                    "
                  />

                </div>

                {/* ================================================= */}
                {/* DESKTOP ARROW */}
                {/* ================================================= */}

                {index !== pipeline.length - 1 && (
                  <div
                    className="
                      pointer-events-none
                      absolute
                      -right-[14px]
                      top-[70px]
                      z-30
                      hidden
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-cyan-400/10
                      bg-[#06070b]
                      xl:flex
                    "
                  >
                    <ArrowRight
                      size={14}
                      className="
                        text-cyan-400/50
                        transition-all
                        duration-300
                        group-hover:text-cyan-400
                      "
                    />
                  </div>
                )}

              </motion.div>
            );
          })}

        </div>

        {/* ====================================================== */}
        {/* PIPELINE FOOTER */}
        {/* ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.7,
          }}
          viewport={{
            once: true,
          }}
          className="
            mx-auto
            mt-14
            flex
            max-w-xl
            items-center
            justify-center
            gap-3
            text-center
          "
        >

          <div className="h-px flex-1 bg-white/[0.06]" />

          <div
            className="
              flex
              items-center
              gap-2
              rounded-full
              border
              border-white/[0.07]
              bg-white/[0.025]
              px-4
              py-2
              text-[11px]
              font-medium
              tracking-wide
              text-slate-500
            "
          >
            <BrainCircuit
              size={13}
              className="text-cyan-400/70"
            />

            Multiple agents. One research system.
          </div>

          <div className="h-px flex-1 bg-white/[0.06]" />

        </motion.div>

      </div>
    </Section>
  );
}