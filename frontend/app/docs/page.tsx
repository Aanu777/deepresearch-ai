
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  FileText,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

type Section = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
};

const sections: Section[] = [
  {
    id: "overview",
    title: "Overview",
    description: "Understand what DeepResearch does and how it approaches research.",
    icon: BookOpen,
  },
  {
    id: "workflow",
    title: "How it works",
    description: "See how a research request moves from question to final report.",
    icon: Layers3,
  },
  {
    id: "research",
    title: "Research workflow",
    description: "Learn about searching, reasoning, verification, and synthesis.",
    icon: Search,
  },
  {
    id: "sources",
    title: "Sources & evidence",
    description: "Understand how sources and supporting evidence are presented.",
    icon: ShieldCheck,
  },
  {
    id: "reports",
    title: "Research reports",
    description: "Learn what a completed research result contains.",
    icon: FileText,
  },
  {
    id: "questions",
    title: "Follow-up research",
    description: "Continue an existing research conversation with additional questions.",
    icon: CircleHelp,
  },
];

const faqs = [
  {
    question: "What is DeepResearch?",
    answer:
      "DeepResearch is an autonomous research workspace designed to turn complex questions into structured, evidence-backed research. It combines search, reasoning, verification, and synthesis into one workflow.",
  },
  {
    question: "Does DeepResearch only search the web?",
    answer:
      "No. Search is only one part of the workflow. DeepResearch also evaluates information, organizes evidence, reasons across findings, and synthesizes the results into a coherent report.",
  },
  {
    question: "Can I ask follow-up questions?",
    answer:
      "Yes. Research conversations can be continued with additional questions so you can explore a topic without starting an entirely separate research session.",
  },
  {
    question: "Can I provide a PDF?",
    answer:
      "Yes. The research workflow supports PDF input so information from a provided document can be incorporated alongside the broader research process.",
  },
  {
    question: "Are research results guaranteed to be correct?",
    answer:
      "No system can guarantee that every research result is correct. DeepResearch is designed to improve reliability through source collection, evidence handling, verification, and structured synthesis. Important conclusions should still be independently reviewed.",
  },
];

function CodeBlock({
  children,
}: {
  children: string;
}) {
  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070B10]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        </div>

        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-600">
          example
        </span>
      </div>

      <pre className="overflow-x-auto p-5 text-sm leading-7 text-slate-300">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function Callout({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="my-8 flex gap-4 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.035] p-5">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06]">
        <Icon size={17} className="text-cyan-300" />
      </div>

      <div>
        <p className="font-medium text-white">{title}</p>
        <div className="mt-1 text-sm leading-6 text-slate-400">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] =
    useState("overview");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [openFaq, setOpenFaq] =
    useState<number | null>(null);

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return sections;
    }

    return sections.filter(
      (section) =>
        section.title.toLowerCase().includes(query) ||
        section.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  function scrollToSection(id: string) {
    setActiveSection(id);

    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  return (
    <main className="min-h-screen bg-[#05080D] text-white selection:bg-cyan-400/20">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[15%] top-[-15%] h-[500px] w-[500px] rounded-full bg-cyan-400/[0.035] blur-[140px]" />

        <div className="absolute right-[-10%] top-[25%] h-[600px] w-[600px] rounded-full bg-blue-500/[0.025] blur-[160px]" />

        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#05080D]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06]">
              <Sparkles
                size={15}
                className="text-cyan-300"
              />
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold tracking-tight text-white">
                DeepResearch
              </span>

              <span className="text-xs text-slate-600">
                Docs
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white sm:inline-flex"
            >
              <ArrowLeft size={15} />
              Back home
            </Link>

            <Link
              href="/workspace"
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-cyan-400 px-4 text-sm font-semibold text-[#05070B] transition hover:bg-cyan-300"
            >
              Start Research
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        {/* Sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 overflow-y-auto border-r border-white/[0.06] px-6 py-10 lg:block">
          <div className="mb-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Documentation
            </p>

            <p className="text-sm leading-6 text-slate-500">
              Everything you need to understand the DeepResearch workflow.
            </p>
          </div>

          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const active =
                activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() =>
                    scrollToSection(section.id)
                  }
                  className={`group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    active
                      ? "bg-white/[0.05] text-white"
                      : "text-slate-500 hover:bg-white/[0.025] hover:text-slate-300"
                  }`}
                >
                  <Icon
                    size={16}
                    className={`mt-0.5 shrink-0 ${
                      active
                        ? "text-cyan-300"
                        : "text-slate-600 group-hover:text-slate-400"
                    }`}
                  />

                  <span>
                    <span className="block text-sm font-medium">
                      {section.title}
                    </span>

                    {active && (
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {section.description}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-10 border-t border-white/[0.06] pt-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Quick links
            </p>

            <div className="space-y-1">
              <button
                onClick={() =>
                  scrollToSection("faq")
                }
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 transition hover:bg-white/[0.025] hover:text-white"
              >
                FAQ
              </button>

              <button
                onClick={() =>
                  scrollToSection("safety")
                }
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 transition hover:bg-white/[0.025] hover:text-white"
              >
                Responsible use
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Hero */}
          <section className="border-b border-white/[0.06] px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
            <div className="mx-auto max-w-5xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-xs font-medium text-slate-400">
                <BookOpen
                  size={14}
                  className="text-cyan-300"
                />
                Product documentation
              </div>

              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                Research,
                <span className="block bg-gradient-to-r from-cyan-300 via-white to-slate-400 bg-clip-text text-transparent">
                  without the busywork.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
                Learn how DeepResearch turns complex questions into
                structured, evidence-backed research through autonomous
                search, reasoning, verification, and synthesis.
              </p>

              {/* Search */}
              <div className="mt-10 max-w-2xl">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(
                        event.target.value
                      )
                    }
                    placeholder="Search documentation..."
                    className="h-13 w-full rounded-2xl border border-white/[0.08] bg-white/[0.025] pl-11 pr-5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/30 focus:bg-white/[0.035]"
                  />
                </div>

                {searchQuery && (
                  <div className="mt-3 rounded-2xl border border-white/[0.07] bg-[#0A0F16] p-2">
                    {filteredSections.length > 0 ? (
                      filteredSections.map(
                        (section) => (
                          <button
                            key={section.id}
                            onClick={() => {
                              scrollToSection(
                                section.id
                              );
                              setSearchQuery("");
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.04]"
                          >
                            <section.icon
                              size={16}
                              className="text-cyan-300"
                            />

                            <span>
                              <span className="block text-sm font-medium text-white">
                                {section.title}
                              </span>

                              <span className="block text-xs text-slate-600">
                                {section.description}
                              </span>
                            </span>
                          </button>
                        )
                      )
                    ) : (
                      <p className="px-3 py-4 text-sm text-slate-500">
                        No documentation sections found.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Content */}
          <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10 lg:px-16">
            {/* Overview */}
            <section
              id="overview"
              className="scroll-mt-28 border-b border-white/[0.06] pb-20"
            >
              <SectionHeading
                eyebrow="01"
                icon={BookOpen}
                title="Overview"
                description="A focused research environment built around the entire research process."
              />

              <div className="prose-custom mt-10">
                <p>
                  DeepResearch is designed for questions that require more
                  than a quick search. Instead of returning a collection of
                  disconnected results, the system organizes research into a
                  workflow that moves from discovery to reasoning,
                  verification, and synthesis.
                </p>

                <p>
                  The goal is simple: reduce the amount of manual work
                  required to turn scattered information into something
                  understandable and useful.
                </p>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FeatureCard
                  icon={Search}
                  title="Search"
                  text="Find relevant information across the research process."
                />

                <FeatureCard
                  icon={Zap}
                  title="Reason"
                  text="Connect findings and identify useful relationships."
                />

                <FeatureCard
                  icon={ShieldCheck}
                  title="Verify"
                  text="Keep source and evidence context visible."
                />

                <FeatureCard
                  icon={FileText}
                  title="Synthesize"
                  text="Turn findings into a structured research result."
                />
              </div>
            </section>

            {/* Workflow */}
            <section
              id="workflow"
              className="scroll-mt-28 border-b border-white/[0.06] py-20"
            >
              <SectionHeading
                eyebrow="02"
                icon={Layers3}
                title="How it works"
                description="A research request moves through a series of focused stages."
              />

              <div className="mt-12 space-y-4">
                <WorkflowStep
                  number="01"
                  title="Define the question"
                  description="Start with the question or research objective you want to investigate. A clear question gives the research workflow a useful direction."
                />

                <WorkflowStep
                  number="02"
                  title="Explore information"
                  description="The research process gathers relevant information and builds a broader view of the topic instead of relying on a single result."
                />

                <WorkflowStep
                  number="03"
                  title="Reason across findings"
                  description="Collected information is organized and considered together so individual findings can be connected into a larger picture."
                />

                <WorkflowStep
                  number="04"
                  title="Verify evidence"
                  description="Sources and supporting evidence are kept visible so important conclusions can be evaluated in context."
                />

                <WorkflowStep
                  number="05"
                  title="Synthesize the result"
                  description="The final stage turns the research into a structured report that is easier to read, review, and use."
                />
              </div>
            </section>

            {/* Research */}
            <section
              id="research"
              className="scroll-mt-28 border-b border-white/[0.06] py-20"
            >
              <SectionHeading
                eyebrow="03"
                icon={Search}
                title="Research workflow"
                description="Understand the core stages behind a DeepResearch session."
              />

              <div className="prose-custom mt-10">
                <p>
                  DeepResearch is built around a multi-stage research
                  workflow. Each stage has a different purpose, allowing the
                  system to move beyond simple retrieval.
                </p>

                <h3>Discovery</h3>

                <p>
                  The process begins by identifying information relevant to
                  the question. The objective is to build enough context to
                  understand the topic from multiple useful angles.
                </p>

                <h3>Reasoning</h3>

                <p>
                  Research becomes useful when information can be connected.
                  The reasoning stage helps organize findings and identify
                  relationships between them.
                </p>

                <h3>Verification</h3>

                <p>
                  Evidence should remain connected to its source. DeepResearch
                  surfaces source and evidence information alongside the
                  research result so conclusions can be reviewed.
                </p>

                <h3>Synthesis</h3>

                <p>
                  Once the research has been assembled and evaluated, the
                  findings are transformed into a coherent report rather than
                  leaving the user with a collection of isolated results.
                </p>
              </div>

              <Callout
                icon={ShieldCheck}
                title="Research is not the same as certainty"
              >
                Evidence and verification improve reliability, but they do
                not make every conclusion automatically correct. Treat
                important claims as reviewable research rather than absolute
                truth.
              </Callout>
            </section>

            {/* Sources */}
            <section
              id="sources"
              className="scroll-mt-28 border-b border-white/[0.06] py-20"
            >
              <SectionHeading
                eyebrow="04"
                icon={ShieldCheck}
                title="Sources & evidence"
                description="Keep research conclusions connected to the information behind them."
              />

              <div className="prose-custom mt-10">
                <p>
                  A useful research system should make it possible to
                  understand where information came from. DeepResearch
                  therefore treats sources and evidence as first-class parts
                  of the research experience.
                </p>

                <h3>Sources</h3>

                <p>
                  Research results can include source information such as the
                  title and location of the source. This makes it easier to
                  revisit information used during the research process.
                </p>

                <h3>Evidence</h3>

                <p>
                  Evidence items connect individual claims to supporting
                  material. Relevance and confidence indicators can provide
                  additional context when evaluating research findings.
                </p>
              </div>

              <div className="mt-10 rounded-2xl border border-white/[0.07] bg-[#090E15] p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Evidence structure
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Conceptual representation
                    </p>
                  </div>

                  <ShieldCheck
                    size={18}
                    className="text-cyan-300"
                  />
                </div>

                <CodeBlock>
{`Source
  ├── title
  └── url

Evidence
  ├── claim
  ├── supporting text
  ├── relevance
  └── confidence`}
                </CodeBlock>
              </div>
            </section>

            {/* Reports */}
            <section
              id="reports"
              className="scroll-mt-28 border-b border-white/[0.06] py-20"
            >
              <SectionHeading
                eyebrow="05"
                icon={FileText}
                title="Research reports"
                description="A completed session is transformed into a structured research result."
              />

              <div className="prose-custom mt-10">
                <p>
                  The final report is intended to be the useful output of the
                  research process. Instead of requiring you to reconstruct
                  conclusions from raw search results, DeepResearch presents
                  the research as a coherent result.
                </p>

                <h3>What a research session can contain</h3>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <InfoCard
                  title="Research summary"
                  text="A concise overview of the main findings."
                />

                <InfoCard
                  title="Detailed report"
                  text="A deeper synthesis of the research performed."
                />

                <InfoCard
                  title="Sources"
                  text="The sources associated with the research."
                />

                <InfoCard
                  title="Evidence"
                  text="Supporting claims and relevant evidence."
                />

                <InfoCard
                  title="Research activity"
                  text="A view of the work performed during the session."
                />

                <InfoCard
                  title="Metrics"
                  text="High-level indicators describing the research session."
                />
              </div>

              <Callout
                icon={FileText}
                title="Designed for review"
              >
                Reports are structured so you can read the conclusion while
                still having access to the context behind the research.
              </Callout>
            </section>

            {/* Follow-up */}
            <section
              id="questions"
              className="scroll-mt-28 border-b border-white/[0.06] py-20"
            >
              <SectionHeading
                eyebrow="06"
                icon={CircleHelp}
                title="Follow-up research"
                description="Continue investigating without losing the context of the current conversation."
              />

              <div className="prose-custom mt-10">
                <p>
                  Research rarely ends with one question. DeepResearch allows
                  an existing research conversation to be continued with
                  additional questions.
                </p>

                <p>
                  Instead of treating every question as an isolated task, a
                  follow-up can remain associated with the existing research
                  conversation. This makes it easier to explore a topic,
                  clarify findings, or investigate another angle.
                </p>

                <h3>Example</h3>
              </div>

              <CodeBlock>
{`Question
→ "What are the main approaches to autonomous agents?"

Follow-up
→ "Which approach is most suitable for production systems?"

Follow-up
→ "What are the main trade-offs?"`}
              </CodeBlock>

              <p className="text-sm leading-7 text-slate-500">
                Each question can build on the broader research conversation
                instead of forcing you to restart from scratch.
              </p>
            </section>

            {/* Safety */}
            <section
              id="safety"
              className="scroll-mt-28 border-b border-white/[0.06] py-20"
            >
              <SectionHeading
                eyebrow="07"
                icon={ShieldCheck}
                title="Responsible use"
                description="Use research outputs as informed assistance, not unquestionable authority."
              />

              <div className="prose-custom mt-10">
                <p>
                  DeepResearch is intended to accelerate research and help
                  organize information. It should not replace expert judgment
                  where decisions have significant consequences.
                </p>

                <h3>Review important claims</h3>

                <p>
                  When a conclusion matters, inspect the associated sources
                  and evidence. Different sources can disagree, and research
                  systems can occasionally misunderstand or misinterpret
                  information.
                </p>

                <h3>Protect sensitive information</h3>

                <p>
                  Avoid entering passwords, private credentials, financial
                  secrets, authentication tokens, or other information that
                  should not be processed as part of a research request.
                </p>

                <h3>Use appropriate judgment</h3>

                <p>
                  For legal, medical, financial, security, or other
                  high-impact decisions, use qualified professional guidance
                  where appropriate.
                </p>
              </div>
            </section>

            {/* FAQ */}
            <section
              id="faq"
              className="scroll-mt-28 py-20"
            >
              <SectionHeading
                eyebrow="08"
                icon={CircleHelp}
                title="Frequently asked questions"
                description="Quick answers to common questions about DeepResearch."
              />

              <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.07]">
                {faqs.map((faq, index) => {
                  const open =
                    openFaq === index;

                  return (
                    <div
                      key={faq.question}
                      className="border-b border-white/[0.06] last:border-b-0"
                    >
                      <button
                        onClick={() =>
                          setOpenFaq(
                            open
                              ? null
                              : index
                          )
                        }
                        className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left transition hover:bg-white/[0.025] sm:px-6"
                      >
                        <span className="text-sm font-medium text-white">
                          {faq.question}
                        </span>

                        <ChevronDown
                          size={17}
                          className={`shrink-0 text-slate-600 transition-transform ${
                            open
                              ? "rotate-180 text-cyan-300"
                              : ""
                          }`}
                        />
                      </button>

                      {open && (
                        <div className="px-5 pb-5 sm:px-6">
                          <p className="max-w-3xl text-sm leading-7 text-slate-400">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Final CTA */}
            <section className="pb-12 pt-4">
              <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0A1017] p-8 sm:p-10">
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/[0.06] blur-[100px]" />

                <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
                  <div>
                    <p className="mb-2 text-sm font-medium text-cyan-300">
                      Ready to research?
                    </p>

                    <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      Turn your next question into a research session.
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                      Explore the workspace and see DeepResearch in action.
                    </p>
                  </div>

                  <Link
                    href="/workspace"
                    className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 text-sm font-semibold text-[#05070B] transition hover:bg-cyan-300"
                  >
                    Start Research
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   SUPPORTING COMPONENTS
   ============================================================ */

function SectionHeading({
  eyebrow,
  icon: Icon,
  title,
  description,
}: {
  eyebrow: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <span className="text-[11px] font-semibold tracking-[0.2em] text-cyan-400/70">
          {eyebrow}
        </span>

        <div className="h-px w-8 bg-white/[0.08]" />

        <Icon
          size={15}
          className="text-cyan-300"
        />
      </div>

      <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
        {title}
      </h2>

      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5 transition hover:border-white/[0.12] hover:bg-white/[0.025]">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.05]">
        <Icon
          size={16}
          className="text-cyan-300"
        />
      </div>

      <h3 className="text-sm font-medium text-white">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {text}
      </p>
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex gap-5 rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5 transition hover:border-cyan-400/10 hover:bg-white/[0.025] sm:p-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-xs font-semibold text-cyan-300">
        {number}
      </div>

      <div>
        <h3 className="text-base font-medium text-white">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-7 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5">
      <div className="mb-3 flex items-center gap-2">
        <Check
          size={15}
          className="text-cyan-300"
        />

        <h3 className="text-sm font-medium text-white">
          {title}
        </h3>
      </div>

      <p className="text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}



