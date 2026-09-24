"use client";

import {
  motion,
} from "framer-motion";

import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Globe2,
  Search,
  Sparkles,
} from "lucide-react";

import Link from "next/link";

const stages = [
  {
    name: "Planning",
    active: false,
  },
  {
    name: "Searching",
    active: false,
  },
  {
    name: "Extracting",
    active: false,
  },
  {
    name: "Synthesizing",
    active: true,
  },
];

export default function Hero() {
  return (
    <section
      className="
        relative
        overflow-hidden
        border-b
        border-white/[0.06]
        bg-[#050505]
        pb-24
        pt-32
        sm:pb-28
        sm:pt-36
        lg:pb-32
      "
    >
      {/* BACKGROUND */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
        "
      >
        <div
          className="
            absolute
            left-1/2
            top-[-320px]
            h-[640px]
            w-[900px]
            -translate-x-1/2
            rounded-full
            bg-cyan-400/[0.045]
            blur-[150px]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.018]
            [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
            [background-size:56px_56px]
          "
        />

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-40
            bg-gradient-to-t
            from-[#050505]
            to-transparent
          "
        />
      </div>

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1200px]
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* HERO COPY */}

        <div
          className="
            mx-auto
            max-w-4xl
            text-center
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
            }}
            className="
              mx-auto
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-white/[0.08]
              bg-white/[0.025]
              px-3
              py-1.5
              text-xs
              font-medium
              text-white/45
            "
          >
            <Sparkles
              size={13}
              className="text-cyan-300"
            />

            Autonomous research, grounded in sources
          </motion.div>

          <motion.h1
            initial={{
              opacity: 0,
              y: 16,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.55,
              delay: 0.08,
            }}
            className="
              mx-auto
              mt-7
              max-w-4xl
              text-[42px]
              font-semibold
              leading-[1.04]
              tracking-[-0.055em]
              text-white
              sm:text-6xl
              lg:text-[76px]
            "
          >
            Research beyond
            <span
              className="
                block
                text-white/38
              "
            >
              a single answer.
            </span>
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.55,
              delay: 0.16,
            }}
            className="
              mx-auto
              mt-6
              max-w-2xl
              text-[15px]
              leading-7
              text-white/38
              sm:text-base
            "
          >
            DeepResearch searches the web, analyzes evidence,
            reflects on findings, and turns complex questions into
            structured reports with traceable sources.
          </motion.p>

          {/* ACTIONS */}

          <motion.div
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.55,
              delay: 0.24,
            }}
            className="
              mt-8
              flex
              flex-col
              items-center
              justify-center
              gap-3
              sm:flex-row
            "
          >
            <Link
              href="/workspace"
              className="
                inline-flex
                h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-white
                px-5
                text-sm
                font-semibold
                !text-black
                transition-colors
                hover:bg-white/85
                sm:w-auto
              "
            >
              Start researching

              <ArrowRight
                size={15}
              />
            </Link>

            <Link
              href="/conversation"
              className="
                inline-flex
                h-11
                w-full
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.09]
                bg-white/[0.025]
                px-5
                text-sm
                font-medium
                text-white/60
                transition-colors
                hover:bg-white/[0.05]
                hover:text-white
                sm:w-auto
              "
            >
              Open conversation
            </Link>
          </motion.div>
        </div>

        {/* PRODUCT PREVIEW */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
            scale: 0.985,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.7,
            delay: 0.35,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="
            relative
            mx-auto
            mt-16
            max-w-5xl
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -inset-8
              bg-cyan-400/[0.025]
              blur-3xl
            "
          />

          <div
            className="
              relative
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.09]
              bg-[#0d0d0d]
              shadow-[0_32px_90px_rgba(0,0,0,0.45)]
            "
          >
            {/* PREVIEW HEADER */}

            <div
              className="
                flex
                h-12
                items-center
                justify-between
                border-b
                border-white/[0.06]
                px-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-cyan-400
                  "
                />

                <span
                  className="
                    text-xs
                    font-medium
                    text-white/55
                  "
                >
                  Deep Research
                </span>
              </div>

              <span
                className="
                  text-[10px]
                  text-white/20
                "
              >
                Live workflow preview
              </span>
            </div>

            <div
              className="
                grid
                lg:grid-cols-[1fr_280px]
              "
            >
              {/* REPORT */}

              <div
                className="
                  min-w-0
                  p-5
                  sm:p-7
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-[11px]
                    text-white/25
                  "
                >
                  <Search
                    size={13}
                  />

                  Research query
                </div>

                <p
                  className="
                    mt-3
                    max-w-xl
                    text-base
                    font-medium
                    leading-7
                    text-white/85
                  "
                >
                  How are autonomous AI agents changing software
                  research workflows?
                </p>

                <div
                  className="
                    mt-8
                    border-t
                    border-white/[0.06]
                    pt-6
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <FileText
                      size={15}
                      className="text-white/30"
                    />

                    <span
                      className="
                        text-xs
                        font-medium
                        text-white/55
                      "
                    >
                      Research report
                    </span>
                  </div>

                  <div
                    className="
                      mt-5
                      space-y-4
                    "
                  >
                    <PreviewLine width="88%" />
                    <PreviewLine width="96%" />
                    <PreviewLine width="82%" />

                    <div
                      className="
                        pt-2
                        text-sm
                        font-semibold
                        text-white/75
                      "
                    >
                      Key findings
                    </div>

                    <PreviewLine width="94%" />
                    <PreviewLine width="76%" />
                  </div>

                  <div
                    className="
                      mt-7
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    <SourceChip>
                      <Globe2
                        size={12}
                      />
                      12 sources
                    </SourceChip>

                    <SourceChip>
                      <CheckCircle2
                        size={12}
                      />
                      Evidence linked
                    </SourceChip>
                  </div>
                </div>
              </div>

              {/* WORKFLOW */}

              <div
                className="
                  border-t
                  border-white/[0.06]
                  bg-[#101010]
                  p-5
                  lg:border-l
                  lg:border-t-0
                "
              >
                <p
                  className="
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-white/25
                  "
                >
                  Research pipeline
                </p>

                <div
                  className="
                    mt-5
                    space-y-2
                  "
                >
                  {stages.map(
                    (
                      stage,
                      index
                    ) => (
                      <div
                        key={
                          stage.name
                        }
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-white/[0.06]
                          bg-white/[0.02]
                          px-3
                          py-3
                        "
                      >
                        <div
                          className={`
                            flex
                            h-6
                            w-6
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            text-[10px]
                            font-medium
                            ${
                              stage.active
                                ? "bg-cyan-400/[0.10] text-cyan-300"
                                : "bg-white/[0.04] text-white/25"
                            }
                          `}
                        >
                          {index + 1}
                        </div>

                        <span
                          className={`
                            text-xs
                            ${
                              stage.active
                                ? "text-white/75"
                                : "text-white/35"
                            }
                          `}
                        >
                          {stage.name}
                        </span>

                        {stage.active && (
                          <span
                            className="
                              ml-auto
                              h-1.5
                              w-1.5
                              animate-pulse
                              rounded-full
                              bg-cyan-400
                            "
                          />
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* TRUST ROW */}

        <div
          className="
            mx-auto
            mt-8
            flex
            max-w-3xl
            flex-wrap
            items-center
            justify-center
            gap-x-7
            gap-y-2
            text-[11px]
            text-white/22
          "
        >
          <span>Live web research</span>
          <span>•</span>
          <span>PDF analysis</span>
          <span>•</span>
          <span>Source-backed reports</span>
          <span>•</span>
          <span>Multi-step reasoning</span>
        </div>
      </div>
    </section>
  );
}

function PreviewLine({
  width,
}: {
  width: string;
}) {
  return (
    <div
      className="
        h-2
        rounded-full
        bg-white/[0.055]
      "
      style={{
        width,
      }}
    />
  );
}

function SourceChip({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span
      className="
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        border-white/[0.06]
        bg-white/[0.025]
        px-2.5
        py-1.5
        text-[10px]
        text-white/30
      "
    >
      {children}
    </span>
  );
}