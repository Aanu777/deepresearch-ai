"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  Globe2,
  Lightbulb,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

type DemoPhase =
  | "welcome"
  | "question"
  | "research"
  | "sources"
  | "report"
  | "followup"
  | "complete";

type HotspotId =
  | "question"
  | "activity"
  | "sources"
  | "report"
  | "followup";

type ResearchStage = {
  title: string;
  description: string;
};

const researchStages: ResearchStage[] = [
  {
    title: "Understanding the question",
    description: "Breaking the topic into focused research areas.",
  },
  {
    title: "Searching relevant information",
    description: "Exploring sources related to the research question.",
  },
  {
    title: "Comparing findings",
    description: "Connecting information across different sources.",
  },
  {
    title: "Verifying evidence",
    description: "Checking findings before they are included.",
  },
  {
    title: "Preparing the report",
    description: "Turning the findings into a structured answer.",
  },
];

const hotspots: Record<
  HotspotId,
  {
    title: string;
    description: string;
    position: string;
  }
> = {
  question: {
    title: "Start with a question",
    description:
      "Tell DeepResearch what you want to understand. Clear questions generally produce more focused research.",
    position: "left-[8%] top-[18%]",
  },
  activity: {
    title: "Follow the research",
    description:
      "The activity area gives you a high-level view of what the research process is currently doing.",
    position: "right-[8%] top-[25%]",
  },
  sources: {
    title: "Inspect the sources",
    description:
      "Sources help you understand where important findings came from and give you context for the report.",
    position: "right-[8%] bottom-[23%]",
  },
  report: {
    title: "Read the result",
    description:
      "The report brings the researched information together into a structured, readable result.",
    position: "left-[8%] bottom-[19%]",
  },
  followup: {
    title: "Keep researching",
    description:
      "You can continue asking questions about the same research instead of starting from scratch.",
    position: "right-[9%] bottom-[8%]",
  },
};

const suggestedQuestions = [
  "How are AI agents changing software development?",
  "What are the biggest trends in renewable energy?",
  "How is modern database architecture evolving?",
];

const sourceData = [
  {
    title: "Research overview",
    domain: "example-research.org",
    snippet:
      "A high-level overview of the topic, terminology, and major developments.",
  },
  {
    title: "Industry analysis",
    domain: "example-insights.com",
    snippet:
      "Recent analysis covering important trends and practical applications.",
  },
  {
    title: "Technical perspective",
    domain: "example-technology.com",
    snippet:
      "Technical context that helps explain how the underlying systems work.",
  },
];

export default function WatchDemoPage() {
  const [phase, setPhase] = useState<DemoPhase>("welcome");
  const [question, setQuestion] = useState("");
  const [hotspot, setHotspot] = useState<HotspotId | null>(null);
  const [stage, setStage] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);

  const activeStage =
    researchStages[
      Math.min(stage, researchStages.length - 1)
    ];

  const demoQuestion = useMemo(
    () =>
      question.trim() ||
      "How are AI agents changing software development?",
    [question]
  );

  function startTutorial() {
    setHotspot(null);
    setPhase("question");
  }

  // Skip tutorial now goes directly to the real workspace.
  function skipTutorial() {
    setHotspot(null);
    window.location.href = "/workspace";
  }

  function restartDemo() {
    setPhase("welcome");
    setQuestion("");
    setHotspot(null);
    setStage(0);
    setIsRunning(false);
    setFollowUp("");
    setFollowUpSubmitted(false);
  }

  function startResearch() {
    setHotspot(null);
    setIsRunning(true);
    setStage(0);
    setPhase("research");

    let current = 0;

    const interval = window.setInterval(() => {
      current += 1;

      if (current >= researchStages.length) {
        window.clearInterval(interval);

        window.setTimeout(() => {
          setIsRunning(false);
          setStage(researchStages.length - 1);
          setPhase("sources");
        }, 700);

        return;
      }

      setStage(current);
    }, 900);
  }

  function openReport() {
    setHotspot(null);
    setPhase("report");
  }

  function submitFollowUp() {
    if (!followUp.trim()) return;

    setFollowUpSubmitted(true);
    setPhase("complete");
  }

  function openHotspot(id: HotspotId) {
    setHotspot((current) =>
      current === id ? null : id
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070B] text-white">
      {/* ====================================================== */}
      {/* AMBIENT BACKGROUND */}
      {/* ====================================================== */}

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-240px] h-[650px] w-[950px] -translate-x-1/2 rounded-full bg-cyan-400/[0.04] blur-[160px]" />

        <div className="absolute right-[-250px] top-[45%] h-[550px] w-[550px] rounded-full bg-blue-500/[0.025] blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <header className="relative z-40 border-b border-white/[0.06] bg-[#05070B]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
          >
            <ArrowLeft
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            <span className="hidden sm:inline">
              Back to DeepResearch
            </span>

            <span className="sm:hidden">
              Back
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {phase !== "welcome" &&
              phase !== "complete" && (
                <button
                  type="button"
                  onClick={restartDemo}
                  className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2 text-xs text-slate-400 transition hover:border-white/[0.13] hover:bg-white/[0.05] hover:text-white sm:flex"
                >
                  <RotateCcw size={13} />
                  Restart Tour
                </button>
              )}

            <Link
              href="/workspace"
              className="group flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-semibold text-[#05070B] transition hover:bg-cyan-300"
            >
              Start Research

              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* ====================================================== */}
      {/* CONTENT */}
      {/* ====================================================== */}

      <AnimatePresence mode="wait">
        {/* ==================================================== */}
        {/* WELCOME */}
        {/* ==================================================== */}

        {phase === "welcome" && (
          <motion.section
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            className="relative z-10 flex min-h-[calc(100vh-64px)] items-center px-5 py-16 sm:px-6"
          >
            <div className="mx-auto w-full max-w-5xl">
              <div className="mx-auto max-w-3xl text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-400/[0.045] px-4 py-2 text-xs font-medium text-cyan-300"
                >
                  <Sparkles size={13} />

                  Interactive Product Tour
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.65,
                    delay: 0.08,
                  }}
                  className="text-5xl font-semibold tracking-[-0.045em] sm:text-6xl lg:text-7xl"
                >
                  See how DeepResearch
                  <span className="block bg-gradient-to-r from-cyan-300 via-white to-slate-300 bg-clip-text text-transparent">
                    works for you.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.65,
                    delay: 0.16,
                  }}
                  className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg"
                >
                  Take a short interactive tour, then try
                  the research workflow yourself. No account
                  required.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.65,
                    delay: 0.24,
                  }}
                  className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
                >
                  <button
                    type="button"
                    onClick={startTutorial}
                    className="group flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 text-sm font-semibold text-[#05070B] shadow-[0_10px_40px_rgba(34,211,238,0.12)] transition hover:-translate-y-0.5 hover:bg-cyan-300"
                  >
                    <Play
                      size={15}
                      fill="currentColor"
                    />

                    Start Interactive Tour

                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={skipTutorial}
                    className="flex h-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 text-sm font-medium text-slate-300 transition hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white"
                  >
                    Skip tutorial
                  </button>
                </motion.div>
              </div>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 30,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.32,
                }}
                className="mx-auto mt-16 max-w-4xl"
              >
                <DemoWindow
                  question={demoQuestion}
                  phase="welcome"
                  stage={0}
                  onQuestion={() => {}}
                  onActivity={() => {}}
                  onSources={() => {}}
                  onReport={() => {}}
                  onFollowup={() => {}}
                />
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* ==================================================== */}
        {/* INTERACTIVE EXPERIENCE */}
        {/* ==================================================== */}

        {phase !== "welcome" && (
          <motion.section
            key="interactive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 px-4 py-8 sm:px-6 sm:py-10"
          >
            <div className="mx-auto max-w-[1400px]">
              <div className="mx-auto mb-7 max-w-5xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-400">
                      {phase === "complete"
                        ? "Tour complete"
                        : "Interactive demo"}
                    </p>

                    <h1 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">
                      {phase === "complete"
                        ? "You know the workflow."
                        : "Explore the research experience."}
                    </h1>
                  </div>

                  {phase !== "complete" && (
                    <button
                      type="button"
                      onClick={skipTutorial}
                      className="text-xs text-slate-600 transition hover:text-slate-300"
                    >
                      Skip tutorial →
                    </button>
                  )}
                </div>

                <div className="mt-5 flex gap-1.5">
                  {[
                    "question",
                    "research",
                    "sources",
                    "report",
                    "followup",
                  ].map((item, index) => {
                    const active =
                      [
                        "question",
                        "research",
                        "sources",
                        "report",
                        "followup",
                      ].indexOf(phase) >= index;

                    return (
                      <div
                        key={item}
                        className={`h-1 flex-1 rounded-full transition ${
                          active
                            ? "bg-cyan-400"
                            : "bg-white/[0.07]"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="relative">
                <DemoWindow
                  question={demoQuestion}
                  phase={phase}
                  stage={stage}
                  onQuestion={() =>
                    openHotspot("question")
                  }
                  onActivity={() =>
                    openHotspot("activity")
                  }
                  onSources={() =>
                    openHotspot("sources")
                  }
                  onReport={() =>
                    openHotspot("report")
                  }
                  onFollowup={() =>
                    openHotspot("followup")
                  }
                  onStartResearch={startResearch}
                  onOpenReport={openReport}
                  onSubmitFollowup={submitFollowUp}
                  followUp={followUp}
                  setFollowUp={setFollowUp}
                  followUpSubmitted={followUpSubmitted}
                  isRunning={isRunning}
                  setQuestion={setQuestion}
                />

                <AnimatePresence>
                  {hotspot && (
                    <HotspotPopover
                      hotspot={hotspot}
                      onClose={() =>
                        setHotspot(null)
                      }
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* ================================================= */}
              {/* FINAL CTA */}
              {/* ================================================= */}

              {phase === "complete" ? (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mx-auto mt-8 max-w-4xl rounded-[28px] border border-cyan-400/[0.1] bg-[#0B1118] px-6 py-10 text-center shadow-[0_25px_100px_rgba(0,0,0,0.3)] sm:px-10"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/[0.07]">
                    <CheckCircle2
                      size={22}
                      className="text-cyan-400"
                    />
                  </div>

                  <h2 className="mt-5 text-2xl font-semibold text-white">
                    Ready to do real research?
                  </h2>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
                    You have seen how DeepResearch takes a
                    question, researches it, verifies the
                    information, and turns it into a structured
                    report.
                  </p>

                  <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    {/* Start real research */}

                    <Link
                      href="/workspace"
                      className="group flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 text-sm font-semibold text-[#05070B] transition hover:-translate-y-0.5 hover:bg-cyan-300"
                    >
                      Start Real Research

                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>

                    {/* Back to landing page */}

                    <Link
                      href="/"
                      className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 text-sm font-medium text-slate-300 transition hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white"
                    >
                      <ArrowLeft size={15} />

                      Back to Landing Page
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <div className="mx-auto mt-6 flex max-w-5xl items-center justify-between">
                  <button
                    type="button"
                    onClick={restartDemo}
                    className="flex items-center gap-2 text-xs text-slate-600 transition hover:text-slate-300"
                  >
                    <RotateCcw size={13} />
                    Restart
                  </button>

                  <p className="hidden text-xs text-slate-700 sm:block">
                    This is an interactive product simulation.
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ============================================================ */
/* DEMO WINDOW */
/* ============================================================ */

function DemoWindow({
  question,
  phase,
  stage,
  onQuestion,
  onActivity,
  onSources,
  onReport,
  onFollowup,
  onStartResearch,
  onOpenReport,
  onSubmitFollowup,
  followUp,
  setFollowUp,
  followUpSubmitted,
  isRunning,
  setQuestion,
}: {
  question: string;
  phase: DemoPhase;
  stage: number;
  onQuestion: () => void;
  onActivity: () => void;
  onSources: () => void;
  onReport: () => void;
  onFollowup: () => void;
  onStartResearch?: () => void;
  onOpenReport?: () => void;
  onSubmitFollowup?: () => void;
  followUp?: string;
  setFollowUp?: (value: string) => void;
  followUpSubmitted?: boolean;
  isRunning?: boolean;
  setQuestion?: (value: string) => void;
}) {
  const showReport =
    phase === "report" ||
    phase === "followup" ||
    phase === "complete";

  const activeStage =
    researchStages[
      Math.min(stage, researchStages.length - 1)
    ];

  return (
    <div className="relative mx-auto w-full max-w-[1180px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0A1017] shadow-[0_40px_140px_rgba(0,0,0,0.45)]">
      {/* Browser header */}

      <div className="flex h-12 items-center border-b border-white/[0.06] bg-white/[0.012] px-4 sm:px-5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
        </div>

        <div className="mx-auto rounded-lg border border-white/[0.05] bg-white/[0.025] px-5 py-1.5 text-[10px] text-slate-700">
          deepresearch
        </div>

        <div className="w-[42px]" />
      </div>

      {/* Application */}

      <div className="grid min-h-[620px] lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}

        <aside className="hidden border-r border-white/[0.06] bg-[#080D13] p-4 lg:block">
          <div className="flex items-center gap-2 px-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400/[0.07]">
              <Sparkles
                size={13}
                className="text-cyan-400"
              />
            </div>

            <span className="text-xs font-semibold text-slate-300">
              DeepResearch
            </span>
          </div>

          <button
            type="button"
            className="mt-7 flex w-full items-center gap-2 rounded-xl bg-cyan-400/[0.06] px-3 py-2.5 text-left text-xs font-medium text-cyan-300"
          >
            <Search size={13} />
            New Research
          </button>

          <div className="mt-6 space-y-1">
            <div className="px-3 py-2.5 text-[11px] text-slate-600">
              Recent research
            </div>

            <div className="px-3 py-2.5 text-[11px] text-slate-600">
              Saved reports
            </div>
          </div>

          <div className="mt-auto pt-32">
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-3">
              <p className="text-[10px] font-medium text-slate-500">
                Demo mode
              </p>

              <p className="mt-1 text-[10px] leading-4 text-slate-700">
                Explore the interface without affecting your
                real research.
              </p>
            </div>
          </div>
        </aside>

        {/* Main */}

        <div className="relative flex min-w-0 flex-col">
          {/* Workspace header */}

          <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-5 sm:px-7">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-slate-300">
                {showReport
                  ? "AI Agents & Software Development"
                  : "New research"}
              </p>

              <p className="mt-0.5 text-[10px] text-slate-700">
                Interactive demo
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
              {isRunning
                ? "Researching"
                : "Demo ready"}
            </div>
          </div>

          {/* Content */}

          <div className="flex-1 px-5 py-7 sm:px-8 sm:py-8">
            {/* Question */}

            {!showReport && (
              <div className="relative">
                <button
                  type="button"
                  onClick={onQuestion}
                  className="absolute -inset-4 rounded-2xl border border-transparent transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.015]"
                  aria-label="Learn about asking a question"
                />

                <div className="relative pointer-events-none">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-400/70">
                    Research question
                  </p>

                  {phase === "question" &&
                  setQuestion ? (
                    <div className="mt-3">
                      <textarea
                        value={
                          question ===
                          "How are AI agents changing software development?"
                            ? ""
                            : question
                        }
                        onChange={(event) =>
                          setQuestion(
                            event.target.value
                          )
                        }
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                        placeholder="What would you like to research?"
                        className="pointer-events-auto min-h-[100px] w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/30"
                      />

                      <div className="pointer-events-auto mt-3 flex flex-wrap gap-2">
                        {suggestedQuestions.map(
                          (suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() =>
                                setQuestion(
                                  suggestion
                                )
                              }
                              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[10px] text-slate-500 transition hover:border-cyan-400/20 hover:text-slate-300"
                            >
                              {suggestion}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={
                          onStartResearch
                        }
                        disabled={
                          !question.trim()
                        }
                        className="pointer-events-auto mt-4 flex h-11 items-center gap-2 rounded-xl bg-cyan-400 px-5 text-xs font-semibold text-[#05070B] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Search size={14} />
                        Start Research
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <h2 className="mt-3 max-w-3xl text-xl font-medium leading-8 text-white sm:text-2xl">
                      {question}
                    </h2>
                  )}
                </div>
              </div>
            )}

            {/* Research state */}

            {phase === "research" && (
              <div className="mt-10 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <button
                  type="button"
                  onClick={onActivity}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-left transition hover:border-cyan-400/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/[0.06]">
                        <Zap
                          size={14}
                          className="text-cyan-400"
                        />
                      </div>

                      <span className="text-xs font-medium text-slate-300">
                        Research activity
                      </span>
                    </div>

                    <span className="text-[10px] text-cyan-400">
                      {Math.round(
                        ((stage + 1) /
                          researchStages.length) *
                          100
                      )}
                      %
                    </span>
                  </div>

                  <div className="mt-6">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        animate={{
                          width: `${
                            ((stage + 1) /
                              researchStages.length) *
                            100
                          }%`,
                        }}
                        className="h-full rounded-full bg-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-medium text-white">
                      {activeStage.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {activeStage.description}
                    </p>
                  </div>

                  <div className="mt-6 space-y-2">
                    {researchStages.map(
                      (item, index) => (
                        <div
                          key={item.title}
                          className="flex items-center gap-2"
                        >
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full ${
                              index <= stage
                                ? "bg-cyan-400/10"
                                : "bg-white/[0.03]"
                            }`}
                          >
                            {index < stage ? (
                              <Check
                                size={11}
                                className="text-cyan-400"
                              />
                            ) : index === stage ? (
                              <motion.div
                                animate={{
                                  opacity: [
                                    0.4,
                                    1,
                                    0.4,
                                  ],
                                }}
                                transition={{
                                  duration: 1.2,
                                  repeat: Infinity,
                                }}
                                className="h-1.5 w-1.5 rounded-full bg-cyan-400"
                              />
                            ) : (
                              <span className="h-1 w-1 rounded-full bg-slate-700" />
                            )}
                          </div>

                          <span
                            className={`text-[11px] ${
                              index <= stage
                                ? "text-slate-400"
                                : "text-slate-700"
                            }`}
                          >
                            {item.title}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </button>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <div className="flex items-center gap-2">
                    <Lightbulb
                      size={15}
                      className="text-cyan-400"
                    />

                    <span className="text-xs font-medium text-slate-300">
                      What is happening?
                    </span>
                  </div>

                  <p className="mt-4 text-xs leading-6 text-slate-600">
                    DeepResearch breaks a broad question into
                    smaller research tasks, investigates them,
                    and brings the findings back together.
                  </p>

                  <div className="mt-6 rounded-xl border border-white/[0.05] bg-black/10 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-slate-700">
                      Current task
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {activeStage.title}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sources */}

            {phase === "sources" && (
              <div className="mt-8">
                <button
                  type="button"
                  onClick={onSources}
                  className="mb-5 flex w-full items-center justify-between rounded-2xl border border-cyan-400/[0.08] bg-cyan-400/[0.02] px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Globe2
                      size={15}
                      className="text-cyan-400"
                    />

                    <span className="text-xs font-medium text-slate-300">
                      Sources discovered
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-600">
                    3 sources
                  </span>
                </button>

                <div className="grid gap-3 md:grid-cols-3">
                  {sourceData.map(
                    (source, index) => (
                      <motion.div
                        key={source.title}
                        initial={{
                          opacity: 0,
                          y: 12,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: index * 0.12,
                        }}
                        className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
                      >
                        <div className="flex items-center justify-between">
                          <Globe2
                            size={14}
                            className="text-cyan-400/70"
                          />

                          <span className="text-[9px] text-slate-700">
                            SOURCE {index + 1}
                          </span>
                        </div>

                        <h3 className="mt-5 text-xs font-medium leading-5 text-slate-300">
                          {source.title}
                        </h3>

                        <p className="mt-1 text-[10px] text-cyan-400/60">
                          {source.domain}
                        </p>

                        <p className="mt-3 text-[10px] leading-5 text-slate-600">
                          {source.snippet}
                        </p>
                      </motion.div>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={onOpenReport}
                  className="group mx-auto mt-7 flex h-11 items-center gap-2 rounded-xl bg-cyan-400 px-5 text-xs font-semibold text-[#05070B] transition hover:bg-cyan-300"
                >
                  View Research Report

                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </div>
            )}

            {/* Report */}

            {showReport && (
              <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-400/70">
                        Research report
                      </p>

                      <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                        AI Agents & Software Development
                      </h2>
                    </div>

                    <div className="hidden items-center gap-1.5 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-2 text-[10px] text-emerald-400 sm:flex">
                      <CheckCircle2 size={12} />
                      Research complete
                    </div>
                  </div>

                  <div className="mt-7 space-y-6">
                    <ReportSection
                      title="Executive summary"
                      text="AI agents are increasingly moving from simple assistants toward systems that can plan tasks, interact with tools, and complete multi-step workflows. Their impact is becoming especially visible in software development."
                    />

                    <ReportSection
                      title="Key findings"
                      text="The strongest pattern is the shift from generating individual pieces of code toward assisting across broader development workflows, including exploration, implementation, testing, and documentation."
                    />

                    <ReportSection
                      title="What this means"
                      text="The most useful agentic systems are not simply faster text generators. They combine reasoning, tool use, contextual information, and verification to handle longer tasks with less manual coordination."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={onReport}
                    className="mt-7 flex items-center gap-2 text-xs text-cyan-400 transition hover:text-cyan-300"
                  >
                    <FileText size={13} />
                    About research reports
                  </button>
                </div>

                {/* Right panel */}

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={onSources}
                    className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-left transition hover:border-cyan-400/15"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe2
                          size={14}
                          className="text-cyan-400"
                        />

                        <span className="text-xs font-medium text-slate-300">
                          Sources
                        </span>
                      </div>

                      <ChevronRight
                        size={13}
                        className="text-slate-700"
                      />
                    </div>

                    <p className="mt-3 text-[10px] leading-5 text-slate-600">
                      Supporting material discovered during
                      the research.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={onFollowup}
                    className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-left transition hover:border-cyan-400/15"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search
                          size={14}
                          className="text-cyan-400"
                        />

                        <span className="text-xs font-medium text-slate-300">
                          Continue research
                        </span>
                      </div>

                      <ChevronRight
                        size={13}
                        className="text-slate-700"
                      />
                    </div>

                    <p className="mt-3 text-[10px] leading-5 text-slate-600">
                      Ask another question about the same
                      research.
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Follow-up */}

            {phase === "followup" &&
              !followUpSubmitted && (
                <div className="mx-auto mt-8 max-w-2xl">
                  <div className="text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/[0.06]">
                      <Search
                        size={18}
                        className="text-cyan-400"
                      />
                    </div>

                    <h2 className="mt-5 text-xl font-semibold text-white">
                      Continue the conversation.
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Ask a follow-up without rebuilding the
                      research from scratch.
                    </p>
                  </div>

                  <div className="mt-7 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
                    <textarea
                      value={followUp}
                      onChange={(event) =>
                        setFollowUp?.(
                          event.target.value
                        )
                      }
                      placeholder="Ask a follow-up question..."
                      className="min-h-[110px] w-full resize-none bg-transparent p-2 text-sm leading-6 text-white outline-none placeholder:text-slate-700"
                    />

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={onSubmitFollowup}
                        disabled={!followUp?.trim()}
                        className="flex h-10 items-center gap-2 rounded-xl bg-cyan-400 px-4 text-xs font-semibold text-[#05070B] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Ask Follow-up
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {phase === "followup" &&
              followUpSubmitted && (
                <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-cyan-400/[0.08] bg-cyan-400/[0.025] p-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={15}
                      className="text-emerald-400"
                    />

                    <span className="text-xs font-medium text-slate-300">
                      Follow-up added to the research
                    </span>
                  </div>
                </div>
              )}
          </div>

          {/* Mobile footer */}

          <div className="border-t border-white/[0.06] px-5 py-3 lg:hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-700">
                DeepResearch demo
              </span>

              <span className="text-[10px] text-cyan-400/60">
                Client-side simulation
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */
/* HOTSPOT POPOVER */
/* ============================================================ */

function HotspotPopover({
  hotspot,
  onClose,
}: {
  hotspot: HotspotId;
  onClose: () => void;
}) {
  const data = hotspots[hotspot];

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.96,
        y: 8,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.96,
        y: 8,
      }}
      className="absolute left-1/2 top-20 z-30 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-2xl border border-cyan-400/15 bg-[#0C141C]/95 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:w-[360px]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />

            <p className="text-xs font-semibold text-white">
              {data.title}
            </p>
          </div>

          <p className="mt-3 text-xs leading-6 text-slate-500">
            {data.description}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-600 transition hover:bg-white/[0.05] hover:text-white"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/* ============================================================ */
/* REPORT SECTION */
/* ============================================================ */

function ReportSection({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {text}
      </p>
    </section>
  );
}


