"use client";

import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";

export default function EmptyConversation() {
  return (
    <div className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden bg-[#05070B] px-4 sm:px-6">
      {/* ============================================================
          BACKGROUND
      ============================================================ */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Main atmospheric glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 65% 55% at 50% 28%,
                rgba(34, 211, 238, 0.045) 0%,
                rgba(34, 211, 238, 0.018) 38%,
                transparent 72%
              )
            `,
          }}
        />

        {/* Secondary side glows */}
        <div className="absolute left-[-15%] top-[20%] h-[420px] w-[420px] rounded-full bg-cyan-500/[0.012] blur-[130px]" />

        <div className="absolute right-[-15%] top-[25%] h-[420px] w-[420px] rounded-full bg-blue-500/[0.012] blur-[130px]" />

        {/* Technical grid */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(
                rgba(148, 163, 184, 0.8) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(148, 163, 184, 0.8) 1px,
                transparent 1px
              )
            `,
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(ellipse 75% 75% at 50% 35%, black, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 75% at 50% 35%, black, transparent 90%)",
          }}
        />

        {/* Top ambient glow */}
        <div className="absolute left-1/2 top-[-220px] h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-400/[0.018] blur-[120px]" />

        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-32"
          style={{
            background:
              "linear-gradient(to top, rgba(5,7,11,0.75), transparent)",
          }}
        />

        {/* Edge vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 48%, rgba(2,4,8,0.32) 100%)",
          }}
        />
      </div>

      {/* ============================================================
          CONTENT

          IMPORTANT:
          No negative margin.
          No fixed viewport height.
          This stays centered inside the actual conversation area.
      ============================================================ */}

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.55,
          ease: "easeOut",
        }}
        className="relative z-10 flex w-full max-w-2xl flex-col items-center justify-center py-10 text-center sm:py-12"
      >
        {/* ========================================================
            AI CORE
        ======================================================== */}

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.55,
            delay: 0.05,
            ease: "easeOut",
          }}
          className="relative mb-6 flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border border-white/[0.08] bg-[#0B1118]/90 shadow-[0_0_55px_rgba(34,211,238,0.07)] backdrop-blur-xl sm:mb-7 sm:h-[68px] sm:w-[68px]"
        >
          <div className="absolute inset-0 rounded-[20px] bg-cyan-400/[0.025]" />

          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.055] sm:h-9 sm:w-9">
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.7)] sm:h-3.5 sm:w-3.5"
            />
          </div>
        </motion.div>

        {/* ========================================================
            EYEBROW
        ======================================================== */}

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[10px] font-medium tracking-wide text-slate-500 backdrop-blur-sm sm:mb-5 sm:text-[11px]">
          <Sparkles
            size={12}
            className="shrink-0 text-cyan-400"
          />

          <span>DeepResearch AI</span>
        </div>

        {/* ========================================================
            HEADING
        ======================================================== */}

        <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">
          What are you researching?
        </h1>

        {/* ========================================================
            DESCRIPTION
        ======================================================== */}

        <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-slate-500 sm:mt-4 sm:text-sm sm:leading-7 lg:text-base">
          Start a conversation to explore a question,
          investigate a topic, or develop an idea with
          DeepResearch AI.
        </p>

        {/* ========================================================
            STATUS
        ======================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 7 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: 0.18,
          }}
          className="mt-7 flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#0B1118]/75 px-3.5 py-2.5 shadow-[0_15px_45px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:mt-8 sm:px-4 sm:py-3"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/[0.06] bg-cyan-400/[0.05]">
            <Search
              size={15}
              className="text-cyan-400/80"
            />
          </div>

          <div className="text-left">
            <p className="text-[11px] font-medium text-slate-300 sm:text-xs">
              Ready to research
            </p>

            <p className="mt-0.5 text-[10px] text-slate-600 sm:text-[11px]">
              Ask your first question below
            </p>
          </div>

          <motion.div
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="ml-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)] sm:ml-2"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}