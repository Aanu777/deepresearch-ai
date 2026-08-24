"use client";

import WorkspaceHeader from "./WorkspaceHeader";
import PromptBox from "./PromptBox";
import ActivityPanel from "./ActivityPanel";
import SourcesPanel from "./SourcesPanel";
import ReportPanel from "./ReportPanel";
import ThinkingPanel from "./ThinkingPanel";
import AICore from "../core/AICore";

export default function Workspace() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070B] text-white">

      {/* ====================================================== */}
      {/* AMBIENT WORKSPACE BACKGROUND */}
      {/* ====================================================== */}

      <div className="pointer-events-none absolute inset-0">

        {/* Main center glow */}

        <div
          className="
            absolute
            left-1/2
            top-[180px]
            h-[700px]
            w-[900px]
            -translate-x-1/2
            rounded-full
            bg-cyan-500/[0.025]
            blur-[160px]
          "
        />

        {/* Left atmospheric glow */}

        <div
          className="
            absolute
            -left-40
            top-[500px]
            h-[500px]
            w-[500px]
            rounded-full
            bg-blue-500/[0.018]
            blur-[150px]
          "
        />

        {/* Right atmospheric glow */}

        <div
          className="
            absolute
            -right-40
            top-[700px]
            h-[500px]
            w-[500px]
            rounded-full
            bg-cyan-400/[0.018]
            blur-[150px]
          "
        />

        {/* Subtle grid */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.018]
            [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
            [background-size:72px_72px]
          "
        />

        {/* Bottom fade */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-64
            bg-gradient-to-t
            from-[#05070B]
            to-transparent
          "
        />

      </div>


      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="relative z-50">
        <WorkspaceHeader />
      </div>


      {/* ====================================================== */}
      {/* WORKSPACE */}
      {/* ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1600px]
          px-4
          py-6
          sm:px-6
          sm:py-8
          xl:px-8
        "
      >

        {/* ================================================== */}
        {/* RESEARCH INPUT */}
        {/* ================================================== */}

        <section className="relative">

          {/* Section label */}

          <div className="mb-4 flex items-center gap-3 px-1">

            <div className="h-px w-6 bg-cyan-400/60" />

            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.25em]
                text-cyan-400/70
              "
            >
              Research Command
            </span>

          </div>

          <PromptBox />

        </section>


        {/* ================================================== */}
        {/* LIVE RESEARCH ENVIRONMENT */}
        {/* ================================================== */}

        <section className="mt-10">

          {/* Section header */}

          <div
            className="
              mb-5
              flex
              flex-col
              gap-2
              px-1
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >

            <div>

              <div className="flex items-center gap-3">

                <div className="h-px w-6 bg-cyan-400/60" />

                <span
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.25em]
                    text-cyan-400/70
                  "
                >
                  Research Environment
                </span>

              </div>

              <h2 className="mt-2 text-lg font-semibold tracking-tight text-white">
                Intelligence workspace
              </h2>

            </div>

            <p className="text-xs text-slate-600">
              Autonomous multi-agent research pipeline
            </p>

          </div>


          {/* ================================================== */}
          {/* THREE COLUMN WORKSPACE */}
          {/* ================================================== */}

          <div
            className="
              grid
              gap-5
              lg:grid-cols-[minmax(260px,320px)_minmax(440px,1fr)_minmax(260px,320px)]
              xl:gap-6
            "
          >

            {/* ================================================= */}
            {/* LEFT COLUMN */}
            {/* ================================================= */}

            <div className="flex min-w-0 flex-col gap-5">

              <div className="relative">

                {/* Column accent */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -left-px
                    top-6
                    h-10
                    w-px
                    bg-gradient-to-b
                    from-cyan-400
                    to-transparent
                  "
                />

                <ActivityPanel />

              </div>

              <ThinkingPanel />

            </div>


            {/* ================================================= */}
            {/* CENTER COLUMN */}
            {/* ================================================= */}

            <div className="min-w-0">

              <div className="relative">

                {/* Center glow */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -inset-4
                    rounded-[36px]
                    bg-cyan-400/[0.018]
                    blur-2xl
                  "
                />

                <div className="relative">

                  <AICore />

                </div>

              </div>

            </div>


            {/* ================================================= */}
            {/* RIGHT COLUMN */}
            {/* ================================================= */}

            <div className="min-w-0">

              <div className="relative">

                {/* Column accent */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-px
                    top-6
                    h-10
                    w-px
                    bg-gradient-to-b
                    from-cyan-400
                    to-transparent
                  "
                />

                <SourcesPanel />

              </div>

            </div>

          </div>

        </section>


        {/* ================================================== */}
        {/* REPORT */}
        {/* ================================================== */}

        <section className="mt-10">

          <div
            className="
              mb-5
              flex
              items-center
              gap-3
              px-1
            "
          >

            <div className="h-px w-6 bg-cyan-400/60" />

            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.25em]
                text-cyan-400/70
              "
            >
              Intelligence Output
            </span>

          </div>

          <ReportPanel />

        </section>


        {/* ================================================== */}
        {/* BOTTOM SPACE */}
        {/* ================================================== */}

        <div className="h-16" />

      </div>

    </main>
  );
}
