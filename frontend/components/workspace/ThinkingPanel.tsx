"use client";

import {
  Brain,
  Sparkles,
  Clock3,
  Activity,
} from "lucide-react";

import { useResearch } from "../context/ResearchContext";

export default function ThinkingPanel() {
  const { job } = useResearch();

  /* ============================================================
     EMPTY STATE
     ============================================================ */

  if (!job) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0A0F16] p-6">

        {/* Ambient glow */}

        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/[0.05] blur-3xl" />

        <div className="relative">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.07]">

                <Brain
                  size={18}
                  strokeWidth={1.8}
                  className="text-cyan-400"
                />

              </div>

              <div>

                <h2 className="text-lg font-semibold tracking-tight text-white">
                  AI Thinking
                </h2>

                <p className="mt-0.5 text-xs text-white/35">
                  Reasoning stream
                </p>

              </div>

            </div>

          </div>


          <div className="mt-7 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-5 py-8 text-center">

            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.035]">

              <Sparkles
                size={19}
                className="text-white/25"
              />

            </div>

            <p className="mt-4 text-sm font-medium text-white/55">
              No reasoning activity yet
            </p>

            <p className="mt-2 text-xs leading-5 text-white/30">
              Start a research task to watch the AI work.
            </p>

          </div>

        </div>

      </section>
    );
  }


  const isRunning = job.status === "running";


  /* ============================================================
     ACTIVE STATE
     ============================================================ */

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0A0F16] p-6">

      {/* ====================================================== */}
      {/* AMBIENT GLOW */}
      {/* ====================================================== */}

      <div
        className={`
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-48
          w-48
          rounded-full
          blur-3xl
          transition-all
          duration-700
          ${
            isRunning
              ? "bg-cyan-400/[0.07]"
              : "bg-white/[0.025]"
          }
        `}
      />


      <div className="relative">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="mb-6 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.07]">

              {isRunning && (
                <span className="absolute inset-0 animate-ping rounded-xl bg-cyan-400/[0.08]" />
              )}

              <Brain
                size={18}
                strokeWidth={1.8}
                className="relative text-cyan-400"
              />

            </div>

            <div>

              <h2 className="text-lg font-semibold tracking-tight text-white">
                AI Activity
              </h2>

              <p className="mt-0.5 text-xs text-white/35">
                Live reasoning stream
              </p>

            </div>

          </div>


          {/* Live indicator */}

          {isRunning ? (

            <div className="flex items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-400/[0.05] px-3 py-1.5">

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />

              </span>

              <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                Live
              </span>

            </div>

          ) : (

            <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5">

              <Activity
                size={12}
                className="text-white/30"
              />

              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                Idle
              </span>

            </div>

          )}

        </div>


        {/* ================================================== */}
        {/* THINKING STREAM */}
        {/* ================================================== */}

        <div className="relative">

          {job.thinking.length === 0 ? (

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] px-5 py-8">

              <div className="flex items-center justify-center gap-3">

                <Sparkles
                  size={17}
                  className="animate-pulse text-cyan-400"
                />

                <span className="text-sm text-white/40">
                  Waiting for AI activity...
                </span>

              </div>

            </div>

          ) : (

            <div className="space-y-3">

              {job.thinking.map((event, index) => {

                const isLatest =
                  index === job.thinking.length - 1 &&
                  isRunning;

                return (

                  <div
                    key={`${event.time}-${index}`}
                    className={`
                      group
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      p-4
                      transition-all
                      duration-300
                      ${
                        isLatest
                          ? "border-cyan-400/15 bg-cyan-400/[0.045]"
                          : "border-white/[0.06] bg-white/[0.025] hover:border-white/[0.10] hover:bg-white/[0.035]"
                      }
                    `}
                  >

                    {/* Latest event glow */}

                    {isLatest && (
                      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-400/[0.08] blur-2xl" />
                    )}


                    <div className="relative flex gap-3">

                      {/* Icon */}

                      <div
                        className={`
                          mt-0.5
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          transition-all
                          duration-300
                          ${
                            isLatest
                              ? "border-cyan-400/15 bg-cyan-400/[0.08]"
                              : "border-white/[0.06] bg-white/[0.035]"
                          }
                        `}
                      >

                        <Sparkles
                          size={15}
                          className={
                            isLatest
                              ? "text-cyan-400"
                              : "text-white/30"
                          }
                        />

                      </div>


                      {/* Content */}

                      <div className="min-w-0 flex-1">

                        <p
                          className={`
                            text-sm
                            leading-6
                            ${
                              isLatest
                                ? "text-white/85"
                                : "text-white/60"
                            }
                          `}
                        >
                          {event.message}
                        </p>


                        {/* Timestamp */}

                        {event.time && (

                          <div className="mt-2.5 flex items-center gap-1.5">

                            <Clock3
                              size={11}
                              className="text-white/20"
                            />

                            <span className="text-[10px] text-white/25">
                              {event.time}
                            </span>

                          </div>

                        )}

                      </div>


                      {/* Active indicator */}

                      {isLatest && (

                        <div className="mt-2 flex h-2 w-2 shrink-0">

                          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />

                        </div>

                      )}

                    </div>

                  </div>

                );
              })}

            </div>

          )}

        </div>


        {/* ================================================== */}
        {/* FOOTER STATUS */}
        {/* ================================================== */}

        {job.thinking.length > 0 && (

          <div className="mt-5 flex items-center justify-between border-t border-white/[0.05] pt-4">

            <div className="flex items-center gap-2">

              <div
                className={`
                  h-1.5
                  w-1.5
                  rounded-full
                  ${
                    isRunning
                      ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]"
                      : "bg-white/20"
                  }
                `}
              />

              <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">
                {isRunning
                  ? "Processing"
                  : "Session activity"}
              </span>

            </div>


            <span className="text-[10px] text-white/20">
              {job.thinking.length}{" "}
              {job.thinking.length === 1
                ? "event"
                : "events"}
            </span>

          </div>

        )}

      </div>

    </section>
  );
}