"use client";

import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  Globe,
  ShieldCheck,
  FileText,
  Network,
  Sparkles,
} from "lucide-react";

const cards = [
  {
    title: "Multi-Agent Intelligence",
    description:
      "Planner, Searcher, Reflection, Verifier and Writer collaborate to solve research tasks together. One AI finds facts, another checks the math, and a third writes the final report. The AI agents share notes and talk back and forth to fix mistakes. They can do many jobs at the same time.  Splitting up tasks leads to fewer mistakes. If one AI breaks, the others can keep going.",
    icon: BrainCircuit,
    className: "lg:col-span-2 lg:row-span-2",
  },
  {
    title: "Verified Sources",
    description:
      "Every conclusion is backed by evidence from trusted sources.",
    icon: ShieldCheck,
    className: "",
  },
  {
    title: "Live Web Search",
    description:
      "Research the latest information instead of relying on outdated training data.",
    icon: Globe,
    className: "",
  },
  {
    title: "Professional Reports",
    description:
      "Generate polished reports with summaries, citations and references.",
    icon: FileText,
    className: "lg:col-span-2",
  },
  {
    title: "Agent Orchestration",
    description:
      "Watch specialized AI agents collaborate in real time.",
    icon: Network,
    className: "",
  },
  {
    title: "Modern Experience",
    description:
      "Beautiful animations with a premium research workflow.",
    icon: Sparkles,
    className: "",
  },
];

export default function Features() {
  return (
    <Section>

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <Heading
        eyebrow="Features"
        title="Built for serious research."
        description="Everything inside DeepResearch is designed to produce reliable, transparent and professional research."
      />

      {/* ====================================================== */}
      {/* FEATURE GRID */}
      {/* ====================================================== */}

      <div className="mt-20">

        <div className="grid auto-rows-[250px] gap-6 lg:grid-cols-4">

          {cards.map((card, i) => {

            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                initial={{
                  opacity: 0,
                  y: 35,
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
                  delay: i * 0.08,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -8,
                }}
                className={`
                  group
                  relative
                  overflow-hidden
                  rounded-[32px]
                  border
                  border-white/10
                  bg-[#0a1018]
                  p-8
                  transition-all
                  duration-500
                  hover:border-cyan-400/40
                  hover:bg-[#0b131d]
                  hover:shadow-[0_0_60px_rgba(34,211,238,.15)]
                  ${card.className}
                `}
              >

                {/* ================================================== */}
                {/* AMBIENT GLOW */}
                {/* ================================================== */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-20
                    h-56
                    w-56
                    rounded-full
                    bg-cyan-500/10
                    blur-[90px]
                    opacity-0
                    transition-all
                    duration-500
                    group-hover:opacity-100
                  "
                />

                {/* Bottom glow */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -bottom-24
                    left-1/2
                    h-40
                    w-64
                    -translate-x-1/2
                    rounded-full
                    bg-cyan-400/[0.04]
                    blur-[80px]
                    opacity-0
                    transition-all
                    duration-700
                    group-hover:opacity-100
                  "
                />

                {/* ================================================== */}
                {/* CONTENT */}
                {/* ================================================== */}

                <div className="relative z-10">

                  {/* Icon */}

                  <div
                    className="
                      mb-8
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-cyan-400/10
                      bg-cyan-500/10
                      transition-all
                      duration-500
                      group-hover:border-cyan-400/25
                      group-hover:bg-cyan-400/[0.13]
                      group-hover:shadow-[0_0_30px_rgba(34,211,238,.12)]
                    "
                  >
                    <Icon
                      size={30}
                      strokeWidth={1.8}
                      className="
                        text-cyan-400
                        transition-transform
                        duration-500
                        group-hover:scale-110
                      "
                    />
                  </div>

                  {/* Title */}

                  <h3
                    className="
                      text-2xl
                      font-bold
                      tracking-tight
                      text-white
                      transition-colors
                      duration-300
                      group-hover:text-cyan-50
                    "
                  >
                    {card.title}
                  </h3>

                  {/* Description */}

                  <p
                    className="
                      mt-5
                      max-w-md
                      leading-8
                      text-slate-400
                      transition-colors
                      duration-300
                      group-hover:text-slate-300
                    "
                  >
                    {card.description}
                  </p>

                </div>

                {/* ================================================== */}
                {/* HOVER BORDER LIGHT */}
                {/* ================================================== */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    rounded-[32px]
                    border
                    border-cyan-300/0
                    transition-all
                    duration-500
                    group-hover:border-cyan-300/[0.08]
                  "
                />

              </motion.div>
            );
          })}

        </div>

      </div>

    </Section>
  );
}