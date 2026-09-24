"use client";

import WorkspaceHeader from "./WorkspaceHeader";
import PromptBox from "./PromptBox";
import ReportPanel from "./ReportPanel";
import SourcesPanel from "./SourcesPanel";

export default function Workspace() {
  return (
    <main className="min-h-screen bg-[var(--dr-bg)] text-white">
      <WorkspaceHeader />

      <div
        className="
          mx-auto
          w-full
          max-w-[1000px]
          px-4
          pb-20
          pt-8
          sm:px-6
          sm:pt-10
          lg:px-8
        "
      >
        {/* RESEARCH INPUT */}

        <section id="research-input">
          <div className="mb-5">
            <p className="text-xs font-medium text-white/40">
              Deep Research
            </p>

            <h1
              className="
                mt-2
                max-w-3xl
                text-2xl
                font-semibold
                tracking-[-0.03em]
                text-white
                sm:text-3xl
              "
            >
              What would you like to research?
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-white/40
              "
            >
              Investigate a topic, compare ideas, analyze evidence,
              or attach a PDF for deeper research.
            </p>
          </div>

          <PromptBox />
        </section>

        {/* REPORT */}

        <section
          id="research-report"
          className="mt-12 scroll-mt-24"
        >
          <ReportPanel />
        </section>

        {/* SOURCES */}

        <section
          id="research-sources"
          className="mt-10 scroll-mt-24"
        >
          <SourcesPanel />
        </section>
      </div>
    </main>
  );
}