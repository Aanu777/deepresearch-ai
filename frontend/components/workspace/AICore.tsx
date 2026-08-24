"use client";

import {
  BrainCircuit,
  Loader2,
  CheckCircle2,
  Circle,
  Sparkles,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import { useResearch } from "@/components/context/ResearchContext";

export default function AICore() {
  const { job, loading } = useResearch();

  const status = job?.status ?? "idle";
  const progress = job?.progress ?? 0;
  const step = job?.current_step ?? "Waiting for research";

  const isCompleted = status === "completed";
  const isRunning =
    loading ||
    status === "running" ||
    status === "researching";

  return (
    <section
      className="
        relative
        min-h-[520px]
        overflow-hidden
        rounded-[32px]
        border
        border-white/[0.08]
        bg-[#080D14]
        shadow-[0_25px_100px_rgba(0,0,0,0.28)]
      "
    >
      {/* ====================================================== */}
      {/* AMBIENT BACKGROUND */}
      {/* ====================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <motion.div
          animate={{
            scale: isRunning ? [1, 1.15, 1] : 1,
            opacity: isRunning
              ? [0.12, 0.22, 0.12]
              : 0.08,
          }}
          transition={{
            duration: 5,
            repeat: isRunning ? Infinity : 0,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-1/2
            top-1/2
            h-[420px]
            w-[420px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-cyan-400
            blur-[140px]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.025]
            [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
            [background-size:48px_48px]
          "
        />

      </div>

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div
        className="
          relative
          z-10
          flex
          items-center
          justify-between
          border-b
          border-white/[0.06]
          px-7
          py-5
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              border
              border-cyan-400/10
              bg-cyan-400/[0.06]
            "
          >
            <BrainCircuit
              size={18}
              className="text-cyan-400"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              DeepResearch Core
            </p>

            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
              Research engine
            </p>
          </div>

        </div>

        {/* Status */}

        <div className="flex items-center gap-2">

          <span className="relative flex h-2 w-2">

            {isRunning && (
              <span
                className="
                  absolute
                  inline-flex
                  h-full
                  w-full
                  animate-ping
                  rounded-full
                  bg-cyan-400/50
                "
              />
            )}

            <span
              className={`
                relative
                inline-flex
                h-2
                w-2
                rounded-full
                ${
                  isCompleted
                    ? "bg-emerald-400"
                    : isRunning
                    ? "bg-cyan-400"
                    : "bg-slate-600"
                }
              `}
            />

          </span>

          <span
            className={`
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.16em]
              ${
                isCompleted
                  ? "text-emerald-400/80"
                  : isRunning
                  ? "text-cyan-400/80"
                  : "text-slate-600"
              }
            `}
          >
            {isCompleted
              ? "Complete"
              : isRunning
              ? "Running"
              : "Idle"}
          </span>

        </div>

      </div>

      {/* ====================================================== */}
      {/* CORE */}
      {/* ====================================================== */}

      <div
        className="
          relative
          z-10
          flex
          flex-col
          items-center
          px-8
          pb-8
          pt-10
        "
      >

        {/* ================================================== */}
        {/* CORE VISUAL */}
        {/* ================================================== */}

        <div className="relative">

          {/* Outer rings */}

          {isRunning && (
            <>
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="
                  absolute
                  -inset-5
                  rounded-full
                  border
                  border-dashed
                  border-cyan-400/15
                "
              />

              <motion.div
                animate={{
                  rotate: -360,
                }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="
                  absolute
                  -inset-10
                  rounded-full
                  border
                  border-cyan-400/[0.06]
                "
              />
            </>
          )}

          {/* Glow */}

          <motion.div
            animate={{
              opacity: isRunning
                ? [0.25, 0.55, 0.25]
                : isCompleted
                ? [0.18, 0.3, 0.18]
                : 0.12,
              scale: isRunning
                ? [0.95, 1.08, 0.95]
                : 1,
            }}
            transition={{
              duration: 2.5,
              repeat: isRunning ? Infinity : 0,
              ease: "easeInOut",
            }}
            className={`
              absolute
              inset-0
              rounded-full
              blur-[45px]
              ${
                isCompleted
                  ? "bg-emerald-400/30"
                  : "bg-cyan-400/30"
              }
            `}
          />

          {/* Core */}

          <motion.div
            animate={{
              scale: isRunning
                ? [1, 1.035, 1]
                : 1,
            }}
            transition={{
              duration: 2,
              repeat: isRunning ? Infinity : 0,
              ease: "easeInOut",
            }}
            className={`
              relative
              flex
              h-44
              w-44
              items-center
              justify-center
              rounded-full
              border
              ${
                isCompleted
                  ? "border-emerald-400/30 bg-emerald-400/[0.04]"
                  : "border-cyan-400/25 bg-[#07131C]"
              }
              shadow-[inset_0_0_50px_rgba(34,211,238,0.04)]
            `}
          >

            {/* Inner ring */}

            <div
              className="
                absolute
                inset-4
                rounded-full
                border
                border-white/[0.035]
              "
            />

            {isCompleted ? (
              <CheckCircle2
                size={68}
                strokeWidth={1.5}
                className="text-emerald-400"
              />
            ) : isRunning ? (
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Loader2
                  size={66}
                  strokeWidth={1.5}
                  className="text-cyan-400"
                />
              </motion.div>
            ) : (
              <BrainCircuit
                size={68}
                strokeWidth={1.4}
                className="text-cyan-400/80"
              />
            )}

          </motion.div>

        </div>

        {/* ================================================== */}
        {/* TITLE */}
        {/* ================================================== */}

        <div className="mt-9 text-center">

          <div className="flex items-center justify-center gap-2">

            <Sparkles
              size={14}
              className="text-cyan-400/60"
            />

            <h2 className="text-xl font-semibold tracking-tight text-white">
              {isCompleted
                ? "Research complete"
                : isRunning
                ? "DeepResearch is working"
                : "Ready to research"}
            </h2>

            <Sparkles
              size={14}
              className="text-cyan-400/60"
            />

          </div>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            {step}
          </p>

        </div>

        {/* ================================================== */}
        {/* PROGRESS */}
        {/* ================================================== */}

        <div className="mt-8 w-full max-w-xl">

          <div className="mb-2 flex items-center justify-between">

            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Research progress
            </span>

            <span className="text-xs font-medium tabular-nums text-cyan-400">
              {progress}%
            </span>

          </div>

          <div
            className="
              relative
              h-2
              overflow-hidden
              rounded-full
              bg-white/[0.045]
            "
          >

            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${Math.min(
                  Math.max(progress, 0),
                  100
                )}%`,
              }}
              transition={{
                duration: 0.7,
                ease: "easeOut",
              }}
              className={`
                relative
                h-full
                rounded-full
                ${
                  isCompleted
                    ? "bg-gradient-to-r from-emerald-400 to-cyan-400"
                    : "bg-gradient-to-r from-cyan-400 to-blue-500"
                }
              `}
            >

              {isRunning && (
                <motion.div
                  animate={{
                    x: ["-100%", "300%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="
                    absolute
                    inset-y-0
                    w-24
                    bg-gradient-to-r
                    from-transparent
                    via-white/30
                    to-transparent
                  "
                />
              )}

            </motion.div>

          </div>

        </div>

        {/* ================================================== */}
        {/* STATUS FOOTER */}
        {/* ================================================== */}

        <div
          className="
            mt-7
            flex
            items-center
            gap-2
            rounded-full
            border
            border-white/[0.06]
            bg-white/[0.02]
            px-4
            py-2
          "
        >

          <Activity
            size={13}
            className={
              isRunning
                ? "text-cyan-400"
                : "text-slate-600"
            }
          />

          <span className="text-[10px] font-medium tracking-wide text-slate-500">
            {isCompleted
              ? "All research agents completed"
              : isRunning
              ? "Agents are actively processing your request"
              : "Awaiting a research request"}
          </span>

        </div>

      </div>

    </section>
  );
}