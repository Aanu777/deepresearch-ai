"use client";

import {
  BrainCircuit,
  Search,
  Sparkles,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Circle,
  Loader2,
  Activity,
} from "lucide-react";

import { motion } from "framer-motion";

import { useResearch } from "../context/ResearchContext";

const icons: Record<string, any> = {
  Planner: BrainCircuit,
  Searcher: Search,
  Extractor: Search,
  Synthesizer: Sparkles,
  Reflection: ShieldCheck,
  Verifier: ShieldCheck,
  Writer: FileText,
  Completed: CheckCircle2,
};

export default function ActivityPanel() {
  const { job } = useResearch();

  /* ========================================================== */
  /* EMPTY STATE */
  /* ========================================================== */

  if (!job) {
    return (
      <section
        className="
          relative
          overflow-hidden
          rounded-[28px]
          border
          border-white/[0.07]
          bg-[#080D14]
          p-6
        "
      >
        {/* Ambient glow */}

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-48
            w-48
            rounded-full
            bg-cyan-400/[0.06]
            blur-[80px]
          "
        />

        <div className="relative">

          {/* Header */}

          <div className="flex items-start justify-between">

            <div>

              <div className="flex items-center gap-2.5">

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
                  <Activity
                    size={17}
                    className="text-cyan-400/70"
                  />
                </div>

                <div>

                  <h2 className="text-sm font-semibold text-white">
                    Research Activity
                  </h2>

                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-slate-600">
                    Agent pipeline
                  </p>

                </div>

              </div>

            </div>

            <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              Idle
            </span>

          </div>

          {/* Empty state */}

          <div className="mt-10 flex flex-col items-center text-center">

            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                border
                border-white/[0.06]
                bg-white/[0.02]
              "
            >
              <BrainCircuit
                size={28}
                strokeWidth={1.5}
                className="text-slate-600"
              />
            </div>

            <p className="mt-5 text-sm font-medium text-slate-400">
              No active research
            </p>

            <p className="mt-2 max-w-[220px] text-xs leading-5 text-slate-600">
              Start a research task to see the agent pipeline come alive.
            </p>

          </div>

        </div>
      </section>
    );
  }

  const timeline = job.timeline ?? [];
  const progress = Math.min(
    Math.max(job.progress ?? 0, 0),
    100
  );

  const activeIndex = timeline.findIndex(
    (event: any) => !event.completed
  );

  const completedCount = timeline.filter(
    (event: any) => event.completed
  ).length;

  const totalSteps = timeline.length;

  const isComplete =
    job.status === "completed" ||
    (timeline.length > 0 && activeIndex === -1);

  /* ========================================================== */
  /* WORKSPACE */
  /* ========================================================== */

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-white/[0.07]
        bg-[#080D14]
        shadow-[0_20px_70px_rgba(0,0,0,0.22)]
      "
    >
      {/* ====================================================== */}
      {/* AMBIENT BACKGROUND */}
      {/* ====================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div
          className="
            absolute
            -right-28
            -top-28
            h-56
            w-56
            rounded-full
            bg-cyan-400/[0.045]
            blur-[100px]
          "
        />

        <div
          className="
            absolute
            bottom-[-100px]
            left-[-100px]
            h-52
            w-52
            rounded-full
            bg-blue-500/[0.035]
            blur-[90px]
          "
        />

      </div>

      <div className="relative z-10">

        {/* ==================================================== */}
        {/* HEADER */}
        {/* ==================================================== */}

        <div
          className="
            flex
            items-start
            justify-between
            border-b
            border-white/[0.06]
            px-6
            py-5
          "
        >

          <div>

            <div className="flex items-center gap-2.5">

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
                <Activity
                  size={17}
                  className="text-cyan-400"
                />
              </div>

              <div>

                <h2 className="text-sm font-semibold text-white">
                  Research Activity
                </h2>

                <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-slate-600">
                  Live agent execution
                </p>

              </div>

            </div>

          </div>

          {/* Pipeline count */}

          {totalSteps > 0 && (
            <div className="text-right">

              <p className="text-lg font-semibold tabular-nums text-white">
                {completedCount}
                <span className="mx-1 text-slate-700">
                  /
                </span>
                <span className="text-slate-500">
                  {totalSteps}
                </span>
              </p>

              <p className="text-[9px] uppercase tracking-[0.14em] text-slate-600">
                stages
              </p>

            </div>
          )}

        </div>

        {/* ==================================================== */}
        {/* CURRENT STEP */}
        {/* ==================================================== */}

        <div className="px-6 pt-5">

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-cyan-400/[0.08]
              bg-cyan-400/[0.025]
              px-4
              py-3.5
            "
          >

            <div className="relative flex h-8 w-8 items-center justify-center">

              {isComplete ? (
                <CheckCircle2
                  size={18}
                  className="text-emerald-400"
                />
              ) : (
                <>
                  <span className="absolute h-2 w-2 animate-ping rounded-full bg-cyan-400/30" />

                  <span className="relative h-2 w-2 rounded-full bg-cyan-400" />
                </>
              )}

            </div>

            <div className="min-w-0">

              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                Current operation
              </p>

              <p className="mt-0.5 truncate text-xs font-medium text-cyan-300">
                {job.current_step || "Processing research"}
              </p>

            </div>

            {!isComplete && (
              <Loader2
                size={14}
                className="ml-auto shrink-0 animate-spin text-cyan-400/50"
              />
            )}

          </div>

        </div>

        {/* ==================================================== */}
        {/* TIMELINE */}
        {/* ==================================================== */}

        <div className="px-6 pb-2 pt-6">

          {timeline.length === 0 ? (
            <div className="py-8 text-center">

              <Loader2
                size={20}
                className="mx-auto animate-spin text-cyan-400/50"
              />

              <p className="mt-3 text-xs text-slate-600">
                Initializing research agents...
              </p>

            </div>
          ) : (
            <div className="relative">

              {/* Vertical pipeline line */}

              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-7
                  left-[15px]
                  top-7
                  w-px
                  bg-gradient-to-b
                  from-cyan-400/20
                  via-white/[0.07]
                  to-transparent
                "
              />

              <div className="space-y-2">

                {timeline.map(
                  (event: any, index: number) => {

                    const Icon =
                      icons[event.title] ??
                      BrainCircuit;

                    const isActive =
                      index === activeIndex &&
                      !event.completed;

                    const isLast =
                      index === timeline.length - 1;

                    return (
                      <motion.div
                        key={
                          event.id ??
                          `${event.title}-${index}`
                        }
                        initial={{
                          opacity: 0,
                          x: -8,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          duration: 0.35,
                          delay: index * 0.05,
                        }}
                        className="relative"
                      >

                        <div
                          className={`
                            group
                            relative
                            flex
                            items-center
                            gap-3
                            rounded-2xl
                            border
                            px-3
                            py-3
                            transition-all
                            duration-300
                            ${
                              isActive
                                ? "border-cyan-400/15 bg-cyan-400/[0.045]"
                                : "border-transparent bg-transparent hover:border-white/[0.05] hover:bg-white/[0.02]"
                            }
                          `}
                        >

                          {/* Timeline node */}

                          <div
                            className="
                              relative
                              z-10
                              flex
                              h-8
                              w-8
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              border
                              border-white/[0.06]
                              bg-[#080D14]
                            "
                          >

                            {event.completed ? (
                              <CheckCircle2
                                size={15}
                                className="text-emerald-400"
                              />
                            ) : isActive ? (
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
                                  size={15}
                                  className="text-cyan-400"
                                />
                              </motion.div>
                            ) : (
                              <Circle
                                size={14}
                                className="text-slate-700"
                              />
                            )}

                          </div>

                          {/* Content */}

                          <div className="min-w-0 flex-1">

                            <div className="flex items-center gap-2">

                              <h3
                                className={`
                                  truncate
                                  text-xs
                                  font-semibold
                                  ${
                                    event.completed
                                      ? "text-slate-300"
                                      : isActive
                                      ? "text-white"
                                      : "text-slate-500"
                                  }
                                `}
                              >
                                {event.title}
                              </h3>

                              {isActive && (
                                <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.14em] text-cyan-400">
                                  Working
                                </span>
                              )}

                            </div>

                            <p
                              className="
                                mt-1
                                truncate
                                text-[10px]
                                leading-4
                                text-slate-600
                              "
                            >
                              {event.description}
                            </p>

                          </div>

                          {/* Event time */}

                          {event.time && (
                            <span className="shrink-0 text-[9px] tabular-nums text-slate-700">
                              {event.time}
                            </span>
                          )}

                          {/* Agent icon */}

                          <div
                            className={`
                              hidden
                              shrink-0
                              rounded-lg
                              p-1.5
                              sm:flex
                              ${
                                isActive
                                  ? "bg-cyan-400/[0.08]"
                                  : "bg-white/[0.025]"
                              }
                            `}
                          >
                            <Icon
                              size={13}
                              className={
                                isActive
                                  ? "text-cyan-400"
                                  : event.completed
                                  ? "text-emerald-400/60"
                                  : "text-slate-700"
                              }
                            />
                          </div>

                        </div>

                        {/* Active signal */}

                        {isActive && !isLast && (
                          <motion.div
                            initial={{
                              opacity: 0,
                            }}
                            animate={{
                              opacity: [0.15, 0.8, 0.15],
                            }}
                            transition={{
                              duration: 1.8,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="
                              pointer-events-none
                              absolute
                              left-[12px]
                              top-[38px]
                              z-20
                              h-3
                              w-1.5
                              rounded-full
                              bg-cyan-400
                              blur-[2px]
                            "
                          />
                        )}

                      </motion.div>
                    );
                  }
                )}

              </div>

            </div>
          )}

        </div>

        {/* ==================================================== */}
        {/* PROGRESS */}
        {/* ==================================================== */}

        <div
          className="
            mt-3
            border-t
            border-white/[0.06]
            px-6
            py-5
          "
        >

          <div className="mb-2.5 flex items-center justify-between">

            <div className="flex items-center gap-2">

              <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                Overall progress
              </span>

            </div>

            <span className="text-xs font-semibold tabular-nums text-cyan-400">
              {progress}%
            </span>

          </div>

          <div
            className="
              relative
              h-1.5
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
                width: `${progress}%`,
              }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
              }}
              className="
                relative
                h-full
                rounded-full
                bg-gradient-to-r
                from-cyan-400
                via-blue-500
                to-violet-500
              "
            >

              {!isComplete && (
                <motion.div
                  animate={{
                    x: ["-100%", "300%"],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="
                    absolute
                    inset-y-0
                    w-16
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

      </div>
    </section>
  );
}