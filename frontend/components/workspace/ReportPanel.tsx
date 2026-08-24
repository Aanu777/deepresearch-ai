"use client";

import {
  Clock3,
  Copy,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Check,
} from "lucide-react";

import { useState } from "react";

import { useResearch } from "../context/ResearchContext";

export default function ReportPanel() {
  const { job } = useResearch();

  const [copied, setCopied] = useState(false);

  const metrics = job?.metrics ?? {
    sources: 0,
    confidence: 0,
    agents: 5,
    runtime: 0,
  };

  const report = job?.report ?? "";

  const status = job?.status ?? "idle";

  const runtime = metrics.runtime ?? 0;

  const minutes = Math.floor(runtime / 60);
  const seconds = runtime % 60;

  const formattedRuntime =
    runtime > 0
      ? `${minutes}m ${seconds}s`
      : "0s";

  // ============================================================
  // COPY REPORT
  // ============================================================

  const copyReport = async () => {
    if (!report) return;

    try {
      await navigator.clipboard.writeText(report);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy report:",
        error
      );
    }
  };

  // ============================================================
  // EXPORT REPORT
  // ============================================================

  const exportReport = () => {
    if (!report) return;

    const blob = new Blob(
      [report],
      {
        type: "text/plain",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "deepresearch-report.txt";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ============================================================
  // STATUS
  // ============================================================

  const isCompleted =
    status === "completed";

  const isRunning =
    status === "running" ||
    status === "queued";

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[32px]
        border
        border-white/[0.09]
        bg-[#090E15]
        shadow-[0_25px_100px_rgba(0,0,0,0.35)]
      "
    >

      {/* ====================================================== */}
      {/* AMBIENT BACKGROUND */}
      {/* ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          -top-40
          h-80
          w-80
          rounded-full
          bg-cyan-400/[0.035]
          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-40
          left-1/3
          h-80
          w-80
          rounded-full
          bg-blue-500/[0.025]
          blur-[120px]
        "
      />


      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div
        className="
          relative
          flex
          flex-col
          gap-5
          border-b
          border-white/[0.07]
          px-6
          py-6
          sm:px-8
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        {/* TITLE */}

        <div className="flex items-center gap-4">

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border
              border-cyan-400/10
              bg-cyan-400/[0.07]
            "
          >
            <FileText
              size={21}
              className="text-cyan-400"
            />
          </div>

          <div>

            <div className="flex items-center gap-3">

              <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Final Research Report
              </h2>

              {isCompleted && (
                <span
                  className="
                    hidden
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-emerald-400/15
                    bg-emerald-400/[0.06]
                    px-2.5
                    py-1
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-emerald-400
                    sm:flex
                  "
                >
                  <CheckCircle2 size={11} />
                  Complete
                </span>
              )}

            </div>

            <p className="mt-1.5 text-sm text-slate-500">
              Generated by DeepResearch AI
            </p>

          </div>

        </div>


        {/* ACTIONS */}

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={copyReport}
            disabled={!report}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/[0.08]
              bg-white/[0.025]
              px-3.5
              py-2.5
              text-xs
              font-medium
              text-slate-400
              transition-all
              duration-300
              hover:border-cyan-400/20
              hover:bg-cyan-400/[0.04]
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >

            {copied ? (
              <Check
                size={15}
                className="text-emerald-400"
              />
            ) : (
              <Copy size={15} />
            )}

            {copied
              ? "Copied"
              : "Copy"}

          </button>

          <button
            type="button"
            onClick={exportReport}
            disabled={!report}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-cyan-400/15
              bg-cyan-400/[0.06]
              px-3.5
              py-2.5
              text-xs
              font-medium
              text-cyan-300
              transition-all
              duration-300
              hover:border-cyan-400/30
              hover:bg-cyan-400/[0.10]
              hover:text-cyan-200
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >

            <Download size={15} />

            Export

          </button>

        </div>

      </div>


      {/* ====================================================== */}
      {/* METRICS */}
      {/* ====================================================== */}

      <div
        className="
          relative
          grid
          grid-cols-2
          border-b
          border-white/[0.07]
          bg-white/[0.015]
          sm:grid-cols-4
        "
      >

        <Metric
          title="Sources"
          value={String(metrics.sources)}
          icon={
            <BookOpen
              size={15}
            />
          }
        />

        <Metric
          title="Confidence"
          value={`${metrics.confidence}%`}
          highlight
          icon={
            <ShieldCheck
              size={15}
            />
          }
        />

        <Metric
          title="AI Agents"
          value={String(metrics.agents)}
          icon={
            <Sparkles
              size={15}
            />
          }
        />

        <Metric
          title="Runtime"
          value={formattedRuntime}
          icon={
            <Clock3
              size={15}
            />
          }
        />

      </div>


      {/* ====================================================== */}
      {/* REPORT CONTENT */}
      {/* ====================================================== */}

      <article
        className="
          relative
          min-h-[430px]
          px-6
          py-8
          sm:px-10
          sm:py-10
          lg:px-14
          lg:py-12
        "
      >

        {/* ================================================== */}
        {/* IDLE */}
        {/* ================================================== */}

        {status === "idle" && !report && (
          <EmptyState />
        )}


        {/* ================================================== */}
        {/* QUEUED */}
        {/* ================================================== */}

        {status === "queued" && !report && (
          <LoadingState
            message="Research job queued..."
          />
        )}


        {/* ================================================== */}
        {/* RUNNING */}
        {/* ================================================== */}

        {status === "running" && !report && (
          <LoadingState
            message={
              job?.current_step
                ? `${job.current_step}...`
                : "Researching..."
            }
          />
        )}


        {/* ================================================== */}
        {/* FAILED */}
        {/* ================================================== */}

        {status === "failed" && (
          <div
            className="
              mx-auto
              max-w-2xl
              rounded-2xl
              border
              border-red-400/15
              bg-red-400/[0.04]
              p-6
            "
          >

            <div className="flex items-start gap-4">

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-red-400/[0.08]
                "
              >

                <AlertCircle
                  size={19}
                  className="text-red-400"
                />

              </div>

              <div>

                <h3 className="font-semibold text-red-400">
                  Research failed
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {job?.error ||
                    "An unknown error occurred."}
                </p>

              </div>

            </div>

          </div>
        )}


        {/* ================================================== */}
        {/* REPORT */}
        {/* ================================================== */}

        {report && (
          <div className="mx-auto max-w-4xl">

            {/* Status */}

            <div className="mb-9 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div
                  className={`
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    ${
                      isCompleted
                        ? "bg-emerald-400/[0.08]"
                        : "bg-cyan-400/[0.08]"
                    }
                  `}
                >

                  {isCompleted ? (
                    <CheckCircle2
                      size={17}
                      className="text-emerald-400"
                    />
                  ) : (
                    <Sparkles
                      size={16}
                      className="text-cyan-400"
                    />
                  )}

                </div>

                <span
                  className={
                    isCompleted
                      ? "text-sm font-medium text-emerald-400"
                      : "text-sm font-medium text-cyan-400"
                  }
                >
                  {isCompleted
                    ? "Research Completed Successfully"
                    : "Research In Progress"}
                </span>

              </div>


              {isRunning && (
                <span className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">

                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />

                  Live synthesis

                </span>
              )}

            </div>


            {/* Divider */}

            <div className="mb-9 h-px bg-gradient-to-r from-cyan-400/20 via-white/[0.06] to-transparent" />


            {/* Report */}

            <div
              className="
                whitespace-pre-wrap
                text-[15px]
                leading-8
                text-slate-300
                selection:bg-cyan-400/20
                selection:text-white
              "
            >
              {report}
            </div>


            {/* Bottom completion */}

            {isCompleted && (
              <div className="mt-12 border-t border-white/[0.06] pt-7">

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">

                  <div className="flex items-center gap-2">

                    <CheckCircle2
                      size={14}
                      className="text-emerald-400"
                    />

                    Research verified

                  </div>

                  <span className="text-white/10">
                    •
                  </span>

                  <span>
                    {metrics.sources} sources analyzed
                  </span>

                  <span className="text-white/10">
                    •
                  </span>

                  <span>
                    {metrics.agents} AI agents
                  </span>

                </div>

              </div>
            )}

          </div>
        )}

      </article>

    </section>
  );
}


/* ============================================================
   METRIC
============================================================ */

function Metric({
  title,
  value,
  highlight = false,
  icon,
}: {
  title: string;
  value: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className="
        group
        border-r
        border-b
        border-white/[0.06]
        px-5
        py-5
        transition-colors
        duration-300
        hover:bg-white/[0.025]
        sm:border-b-0
        sm:px-7
        sm:py-6
        last:border-r-0
        [&:nth-child(2)]:border-r-0
        sm:[&:nth-child(2)]:border-r
      "
    >

      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">

        <span
          className={
            highlight
              ? "text-cyan-400/70"
              : "text-slate-600"
          }
        >
          {icon}
        </span>

        {title}

      </div>

      <h3
        className={`
          mt-2
          text-2xl
          font-semibold
          tracking-tight
          ${
            highlight
              ? "text-cyan-400"
              : "text-white"
          }
        `}
      >
        {value}
      </h3>

    </div>
  );
}


/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState() {
  return (
    <div
      className="
        flex
        min-h-[320px]
        flex-col
        items-center
        justify-center
        text-center
      "
    >

      <div
        className="
          relative
          mb-6
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          border
          border-cyan-400/10
          bg-cyan-400/[0.05]
        "
      >

        <div
          className="
            absolute
            inset-0
            rounded-2xl
            bg-cyan-400/[0.04]
            blur-xl
          "
        />

        <FileText
          size={27}
          className="relative text-cyan-400/70"
        />

      </div>

      <h3 className="text-lg font-semibold text-white">
        No research report yet
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Enter a research question above and
        launch Deep Research to generate your
        report.
      </p>

    </div>
  );
}


/* ============================================================
   LOADING STATE
============================================================ */

function LoadingState({
  message,
}: {
  message: string;
}) {
  return (
    <div
      className="
        flex
        min-h-[320px]
        flex-col
        items-center
        justify-center
        text-center
      "
    >

      <div className="relative mb-7">

        <div
          className="
            absolute
            inset-0
            rounded-full
            bg-cyan-400/10
            blur-2xl
          "
        />

        <div
          className="
            relative
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            border
            border-cyan-400/20
            bg-cyan-400/[0.04]
          "
        >

          <div
            className="
              h-6
              w-6
              animate-spin
              rounded-full
              border-2
              border-white/10
              border-t-cyan-400
            "
          />

        </div>

      </div>

      <h3 className="text-lg font-semibold text-white">
        {message}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Autonomous research agents are working
        through the task and preparing your report.
      </p>

      <div className="mt-6 flex items-center gap-2">

        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />

        <span
          className="
            h-1.5
            w-1.5
            animate-pulse
            rounded-full
            bg-cyan-400/60
          "
          style={{
            animationDelay: "150ms",
          }}
        />

        <span
          className="
            h-1.5
            w-1.5
            animate-pulse
            rounded-full
            bg-cyan-400/30
          "
          style={{
            animationDelay: "300ms",
          }}
        />

      </div>

    </div>
  );
}