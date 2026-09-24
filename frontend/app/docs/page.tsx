"use client";

import Link from "next/link";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  JetBrains_Mono,
  Manrope,
} from "next/font/google";

/* ============================================================
   TYPOGRAPHY

   Both are sourced through Google Fonts, one of the font
   resources from the design-resources repository.
   ============================================================ */

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-docs-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-docs-mono",
});

/* ============================================================
   NAVIGATION
   ============================================================ */

type NavItem = {
  label: string;
  id: string;
  keywords: string[];
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAVIGATION: NavGroup[] = [
  {
    label: "GET STARTED",
    items: [
      {
        label: "Introduction",
        id: "introduction",
        keywords: [
          "overview",
          "introduction",
          "deepresearch",
          "start",
        ],
      },
      {
        label: "Quick start",
        id: "quick-start",
        keywords: [
          "quick",
          "start",
          "begin",
          "research",
        ],
      },
    ],
  },
  {
    label: "PRODUCT",
    items: [
      {
        label: "Conversation",
        id: "conversation",
        keywords: [
          "conversation",
          "chat",
          "questions",
          "follow up",
        ],
      },
      {
        label: "Deep Research",
        id: "deep-research",
        keywords: [
          "deep research",
          "investigation",
          "research mode",
        ],
      },
      {
        label: "Sources & reports",
        id: "sources",
        keywords: [
          "sources",
          "reports",
          "evidence",
          "citations",
        ],
      },
    ],
  },
  {
    label: "RESEARCH ENGINE",
    items: [
      {
        label: "Pipeline",
        id: "pipeline",
        keywords: [
          "pipeline",
          "planner",
          "searcher",
          "extractor",
          "reflection",
          "verifier",
          "synthesizer",
          "writer",
          "agents",
        ],
      },
    ],
  },
  {
    label: "SECURITY",
    items: [
      {
        label: "Data & privacy",
        id: "security",
        keywords: [
          "security",
          "privacy",
          "data",
          "authentication",
        ],
      },
    ],
  },
];

const FLAT_NAVIGATION =
  NAVIGATION.flatMap(
    (group) => group.items
  );

const PIPELINE = [
  {
    number: "01",
    name: "Planner",
    responsibility:
      "Breaks the question into research objectives and evidence requirements.",
  },
  {
    number: "02",
    name: "Searcher",
    responsibility:
      "Finds sources relevant to each research objective.",
  },
  {
    number: "03",
    name: "Extractor",
    responsibility:
      "Pulls useful facts, claims, and context from source material.",
  },
  {
    number: "04",
    name: "Reflection",
    responsibility:
      "Checks the research state for weak coverage, gaps, and contradictions.",
  },
  {
    number: "05",
    name: "Verifier",
    responsibility:
      "Checks whether important claims are supported by the collected evidence.",
  },
  {
    number: "06",
    name: "Synthesizer",
    responsibility:
      "Connects findings across sources into a coherent research state.",
  },
  {
    number: "07",
    name: "Writer",
    responsibility:
      "Turns the final research state into a structured report.",
  },
];

const PAGE_SECTIONS = [
  "introduction",
  "quick-start",
  "conversation",
  "deep-research",
  "pipeline",
  "sources",
  "security",
];

/* ============================================================
   PAGE
   ============================================================ */

export default function DocsPage() {
  const [
    mobileNavigationOpen,
    setMobileNavigationOpen,
  ] = useState(false);

  const [
    activeSection,
    setActiveSection,
  ] = useState(
    "introduction"
  );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    searchFocused,
    setSearchFocused,
  ] = useState(false);

  /* ========================================================
     ACTIVE SECTION
     ======================================================== */

  useEffect(() => {
    const sections =
      PAGE_SECTIONS.map(
        (id) =>
          document.getElementById(
            id
          )
      ).filter(
        (
          section
        ): section is HTMLElement =>
          Boolean(section)
      );

    const observer =
      new IntersectionObserver(
        (entries) => {
          const visible =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              );

          if (
            visible[0]
          ) {
            setActiveSection(
              visible[0]
                .target.id
            );
          }
        },
        {
          rootMargin:
            "-15% 0px -68% 0px",

          threshold: [
            0,
            0.1,
            0.25,
            0.5,
          ],
        }
      );

    sections.forEach(
      (section) =>
        observer.observe(
          section
        )
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  /* ========================================================
     SEARCH
     ======================================================== */

  const searchResults =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return [];
      }

      return FLAT_NAVIGATION.filter(
        (item) => {
          return (
            item.label
              .toLowerCase()
              .includes(
                query
              ) ||
            item.keywords.some(
              (keyword) =>
                keyword.includes(
                  query
                )
            )
          );
        }
      ).slice(0, 6);
    }, [searchQuery]);

  function goToSection(
    id: string
  ) {
    const target =
      document.getElementById(
        id
      );

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setActiveSection(id);

    setSearchQuery("");

    setSearchFocused(false);

    setMobileNavigationOpen(
      false
    );
  }

  function submitSearch(
    event: FormEvent
  ) {
    event.preventDefault();

    if (
      searchResults[0]
    ) {
      goToSection(
        searchResults[0].id
      );
    }
  }

  return (
    <div
      className={`
        ${manrope.variable}
        ${mono.variable}

        min-h-screen
        bg-[#050505]
        text-[#f4f4f5]

        [font-family:var(--font-docs-sans)]
      `}
    >
      {/* ====================================================
          HEADER
          ==================================================== */}

      <header
        className="
          fixed
          inset-x-0
          top-0
          z-50

          h-[68px]

          border-b
          border-white/[0.065]

          bg-[#050505]/95
          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto
            flex
            h-full
            max-w-[1600px]
            items-center
            gap-5

            px-5
            md:px-7
          "
        >
          {/* BRAND */}

          <Link
            href="/"
            className="
              flex
              shrink-0
              items-center
              gap-2.5
            "
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-[#67e8f9]

                shadow-[0_0_14px_rgba(103,232,249,0.4)]
              "
            />

            <span
              className="
                text-[13px]
                font-semibold
                tracking-[-0.025em]
                text-white/90
              "
            >
              DeepResearch AI
            </span>

            <span
              className="
                hidden
                text-[12px]
                text-white/20
                sm:block
              "
            >
              /
            </span>

            <span
              className="
                hidden
                text-[12px]
                text-white/42
                sm:block
              "
            >
              Docs
            </span>
          </Link>

          {/* DESKTOP SEARCH */}

          <form
            onSubmit={
              submitSearch
            }
            className="
              relative
              mx-auto
              hidden
              w-full
              max-w-[480px]
              lg:block
            "
          >
            <div
              className="
                flex
                h-9
                items-center
                gap-2.5

                rounded-lg

                border
                border-white/[0.075]

                bg-white/[0.028]

                px-3

                transition

                focus-within:border-white/[0.15]
                focus-within:bg-white/[0.04]
              "
            >
              <SearchIcon />

              <input
                type="search"
                value={
                  searchQuery
                }
                onChange={(
                  event
                ) =>
                  setSearchQuery(
                    event
                      .target
                      .value
                  )
                }
                onFocus={() =>
                  setSearchFocused(
                    true
                  )
                }
                onBlur={() => {
                  window.setTimeout(
                    () =>
                      setSearchFocused(
                        false
                      ),
                    120
                  );
                }}
                placeholder="Search documentation"
                className="
                  h-full
                  min-w-0
                  flex-1

                  border-0
                  bg-transparent

                  text-[12px]
                  text-white/75

                  outline-none

                  placeholder:text-white/22
                "
              />

              <kbd
                className="
                  rounded
                  border
                  border-white/[0.07]
                  px-1.5
                  py-0.5

                  text-[9px]
                  text-white/22

                  [font-family:var(--font-docs-mono)]
                "
              >
                ↵
              </kbd>
            </div>

            {searchFocused &&
              searchQuery && (
                <SearchResults
                  results={
                    searchResults
                  }
                  onSelect={
                    goToSection
                  }
                />
              )}
          </form>

          {/* HEADER ACTIONS */}

          <div
            className="
              ml-auto
              flex
              shrink-0
              items-center
              gap-3
            "
          >
            <Link
              href="/"
              className="
                hidden
                text-[11px]
                font-medium
                text-white/35

                transition-colors

                hover:text-white/80

                md:block
              "
            >
              Product
            </Link>

            <Link
              href="/workspace"
              className="
                hidden
                h-9
                items-center
                justify-center

                rounded-full

                bg-white

                px-4

                text-[11px]
                font-semibold

                !text-black

                transition

                hover:bg-white/85

                sm:inline-flex
              "
            >
              Open app
            </Link>

            <button
              type="button"
              onClick={() =>
                setMobileNavigationOpen(
                  (
                    current
                  ) =>
                    !current
                )
              }
              aria-label="Open documentation navigation"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center

                rounded-lg

                border
                border-white/[0.075]

                text-white/52

                lg:hidden
              "
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================
          MOBILE NAVIGATION
          ==================================================== */}

      {mobileNavigationOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() =>
              setMobileNavigationOpen(
                false
              )
            }
            className="
              fixed
              inset-0
              z-40

              bg-black/60
              backdrop-blur-sm

              lg:hidden
            "
          />

          <aside
            className="
              fixed
              bottom-0
              left-0
              top-[68px]
              z-50

              w-[290px]

              overflow-y-auto

              border-r
              border-white/[0.07]

              bg-[#080808]

              px-4
              py-5

              lg:hidden
            "
          >
            <MobileSearch
              query={
                searchQuery
              }
              setQuery={
                setSearchQuery
              }
              results={
                searchResults
              }
              onSelect={
                goToSection
              }
            />

            <div className="mt-6">
              <DocsNavigation
                activeSection={
                  activeSection
                }
                onSelect={
                  goToSection
                }
              />
            </div>
          </aside>
        </>
      )}

      {/* ====================================================
          DOCS LAYOUT
          ==================================================== */}

      <div
        className="
          mx-auto
          grid
          max-w-[1600px]

          pt-[68px]

          lg:grid-cols-[248px_minmax(0,1fr)]
          xl:grid-cols-[248px_minmax(0,820px)_200px]
        "
      >
        {/* ==================================================
            LEFT SIDEBAR
            ================================================== */}

        <aside
          className="
            sticky
            top-[68px]

            hidden
            h-[calc(100vh-68px)]

            overflow-y-auto

            border-r
            border-white/[0.06]

            px-5
            py-8

            lg:block
          "
        >
          <DocsNavigation
            activeSection={
              activeSection
            }
            onSelect={
              goToSection
            }
          />

          <div
            className="
              mt-10
              border-t
              border-white/[0.055]
              pt-5
            "
          >
            <p
              className="
                text-[10px]
                leading-5
                text-white/18
              "
            >
              DeepResearch AI
              documentation
            </p>

            <p
              className="
                mt-1
                text-[10px]
                text-white/12
              "
            >
              Product reference
            </p>
          </div>
        </aside>

        {/* ==================================================
            DOCUMENT
            ================================================== */}

        <main
          className="
            min-w-0

            px-6
            pb-28
            pt-16

            sm:px-9

            lg:px-12

            xl:px-14
          "
        >
          {/* =================================================
              INTRODUCTION
              ================================================= */}

          <section
            id="introduction"
            className="
              scroll-mt-28
              pb-20
            "
          >
            <DocMeta>
              GET STARTED
            </DocMeta>

            <h1
              className="
                mt-5

                max-w-[680px]

                text-[38px]
                font-semibold
                leading-[1.08]
                tracking-[-0.045em]

                text-white/95

                sm:text-[46px]
              "
            >
              DeepResearch AI
            </h1>

            <p
              className="
                mt-5

                max-w-[690px]

                text-[15px]
                leading-7
                text-white/47
              "
            >
              DeepResearch AI
              provides two ways
              to work with the
              system: a normal
              conversation
              interface for quick
              questions and a
              research workspace
              for structured,
              source-driven
              investigation.
            </p>

            <div
              className="
                mt-10

                border-y
                border-white/[0.06]

                py-6
              "
            >
              <dl
                className="
                  grid
                  gap-6

                  sm:grid-cols-3
                "
              >
                <Definition
                  label="INTERFACE"
                  value="Conversation + Deep Research"
                />

                <Definition
                  label="RESEARCH MODEL"
                  value="Multi-stage pipeline"
                />

                <Definition
                  label="OUTPUT"
                  value="Evidence-aware report"
                />
              </dl>
            </div>
          </section>

          <Divider />

          {/* =================================================
              QUICK START
              ================================================= */}

          <section
            id="quick-start"
            className="
              scroll-mt-28
              py-20
            "
          >
            <SectionTitle
              label="QUICK START"
              title="Start a research session"
            />

            <p
              className="
                mt-5
                max-w-[690px]

                text-[14px]
                leading-7
                text-white/42
              "
            >
              Use the research
              workspace when the
              question benefits
              from planning,
              multiple sources,
              and a structured
              final result.
            </p>

            <div
              className="
                mt-9
                border-y
                border-white/[0.06]
              "
            >
              <Step
                number="01"
                title="Open Deep Research"
              >
                Go to the research
                workspace from the
                navigation or use
                the button below.
              </Step>

              <Step
                number="02"
                title="Describe the question"
              >
                Give the system the
                problem you want
                investigated. Add
                useful context when
                the scope matters.
              </Step>

              <Step
                number="03"
                title="Run the research"
              >
                The research
                workflow progresses
                through its
                specialized stages
                before producing
                the final result.
              </Step>

              <Step
                number="04"
                title="Inspect the result"
              >
                Review the report
                and the sources
                associated with the
                research.
              </Step>
            </div>

            <Link
              href="/workspace"
              className="
                mt-8
                inline-flex
                h-10
                items-center
                gap-2

                rounded-lg

                border
                border-white/[0.09]

                bg-white/[0.035]

                px-4

                text-[11px]
                font-semibold
                text-white/72

                transition

                hover:border-white/[0.16]
                hover:bg-white/[0.06]
                hover:text-white
              "
            >
              Open Deep Research

              <span
                aria-hidden
                className="
                  text-white/30
                "
              >
                ↗
              </span>
            </Link>
          </section>

          <Divider />

          {/* =================================================
              MODES
              ================================================= */}

          <section
            className="
              py-20
            "
          >
            <DocMeta>
              USING DEEPRESEARCH
            </DocMeta>

            <h2
              className="
                mt-4

                text-[27px]
                font-semibold
                tracking-[-0.035em]

                text-white/90
              "
            >
              Choose the right mode
            </h2>

            <p
              className="
                mt-4
                max-w-[680px]

                text-[14px]
                leading-7
                text-white/40
              "
            >
              Conversation and
              Deep Research solve
              different parts of
              the workflow.
            </p>

            <div
              className="
                mt-10

                grid

                border
                border-white/[0.07]

                md:grid-cols-2
              "
            >
              <article
                id="conversation"
                className="
                  scroll-mt-28

                  p-6

                  md:border-r
                  md:border-white/[0.07]
                "
              >
                <span
                  className="
                    text-[9px]
                    font-semibold
                    tracking-[0.12em]
                    text-[#67e8f9]
                  "
                >
                  CONVERSATION
                </span>

                <h3
                  className="
                    mt-4
                    text-[18px]
                    font-semibold
                    tracking-[-0.025em]
                    text-white/86
                  "
                >
                  Quick thinking
                </h3>

                <p
                  className="
                    mt-3
                    text-[12px]
                    leading-6
                    text-white/35
                  "
                >
                  Use Conversation
                  for explanations,
                  exploration,
                  brainstorming,
                  and natural
                  follow-up
                  questions.
                </p>

                <Link
                  href="/conversation"
                  className="
                    mt-6
                    inline-block
                    text-[11px]
                    font-medium
                    text-white/45

                    transition

                    hover:text-[#67e8f9]
                  "
                >
                  Open conversation
                  →
                </Link>
              </article>

              <article
                id="deep-research"
                className="
                  scroll-mt-28

                  border-t
                  border-white/[0.07]

                  p-6

                  md:border-t-0
                "
              >
                <span
                  className="
                    text-[9px]
                    font-semibold
                    tracking-[0.12em]
                    text-[#67e8f9]
                  "
                >
                  DEEP RESEARCH
                </span>

                <h3
                  className="
                    mt-4
                    text-[18px]
                    font-semibold
                    tracking-[-0.025em]
                    text-white/86
                  "
                >
                  Structured
                  investigation
                </h3>

                <p
                  className="
                    mt-3
                    text-[12px]
                    leading-6
                    text-white/35
                  "
                >
                  Use Deep Research
                  when the question
                  requires planning,
                  web research,
                  evidence analysis,
                  and a structured
                  report.
                </p>

                <Link
                  href="/workspace"
                  className="
                    mt-6
                    inline-block
                    text-[11px]
                    font-medium
                    text-white/45

                    transition

                    hover:text-[#67e8f9]
                  "
                >
                  Open workspace →
                </Link>
              </article>
            </div>
          </section>

          <Divider />

          {/* =================================================
              PIPELINE
              ================================================= */}

          <section
            id="pipeline"
            className="
              scroll-mt-28
              py-20
            "
          >
            <SectionTitle
              label="RESEARCH ENGINE"
              title="Research pipeline"
            />

            <p
              className="
                mt-5
                max-w-[690px]

                text-[14px]
                leading-7
                text-white/40
              "
            >
              Deep Research
              separates the
              investigation into
              specialized stages
              instead of handling
              the entire task as a
              single generation.
            </p>

            <div
              className="
                mt-10
                overflow-hidden

                border-y
                border-white/[0.065]
              "
            >
              {PIPELINE.map(
                (stage) => (
                  <div
                    key={
                      stage.number
                    }
                    className="
                      grid
                      gap-3

                      border-b
                      border-white/[0.055]

                      py-5

                      last:border-b-0

                      sm:grid-cols-[52px_130px_1fr]
                      sm:items-start
                      sm:gap-5
                    "
                  >
                    <span
                      className="
                        text-[9px]
                        text-[#67e8f9]/65

                        [font-family:var(--font-docs-mono)]
                      "
                    >
                      {stage.number}
                    </span>

                    <strong
                      className="
                        text-[11px]
                        font-semibold
                        text-white/72
                      "
                    >
                      {stage.name}
                    </strong>

                    <p
                      className="
                        max-w-[500px]

                        text-[12px]
                        leading-6
                        text-white/32
                      "
                    >
                      {
                        stage.responsibility
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </section>

          <Divider />

          {/* =================================================
              SOURCES
              ================================================= */}

          <section
            id="sources"
            className="
              scroll-mt-28
              py-20
            "
          >
            <SectionTitle
              label="EVIDENCE"
              title="Sources and reports"
            />

            <p
              className="
                mt-5
                max-w-[680px]

                text-[14px]
                leading-7
                text-white/40
              "
            >
              Research output is
              most useful when the
              evidence behind it
              remains visible.
              DeepResearch keeps
              sources alongside the
              research result so
              they can be inspected
              independently.
            </p>

            <div
              className="
                mt-10
                divide-y
                divide-white/[0.055]

                border-y
                border-white/[0.065]
              "
            >
              <ReferenceRow
                title="Source"
                description="Material discovered and used during the research process."
              />

              <ReferenceRow
                title="Finding"
                description="A useful claim, fact, or conclusion extracted from the available evidence."
              />

              <ReferenceRow
                title="Report"
                description="The final structured synthesis produced from the completed research state."
              />
            </div>

            <div
              className="
                mt-8

                border-l
                border-[#67e8f9]/30

                pl-5
              "
            >
              <p
                className="
                  text-[11px]
                  font-semibold
                  text-white/58
                "
              >
                Evidence-first
              </p>

              <p
                className="
                  mt-2
                  max-w-[630px]

                  text-[12px]
                  leading-6
                  text-white/30
                "
              >
                A polished report
                should not hide the
                material used to
                produce it. Sources
                remain a separate
                part of the research
                workspace.
              </p>
            </div>
          </section>

          <Divider />

          {/* =================================================
              SECURITY
              ================================================= */}

          <section
            id="security"
            className="
              scroll-mt-28
              py-20
            "
          >
            <SectionTitle
              label="SECURITY"
              title="Data and privacy"
            />

            <p
              className="
                mt-5
                max-w-[680px]

                text-[14px]
                leading-7
                text-white/40
              "
            >
              Product
              documentation should
              describe the public
              behavior of the
              system without
              exposing private
              credentials or
              sensitive
              configuration.
            </p>

            <div
              className="
                mt-10

                grid
                gap-x-10
                gap-y-8

                sm:grid-cols-2
              "
            >
              <SimpleList
                heading="Documented"
                items={[
                  "Product behavior",
                  "User-facing workflows",
                  "Research stages",
                  "Public architecture concepts",
                ]}
              />

              <SimpleList
                heading="Not documented"
                items={[
                  "API credentials",
                  "Authentication secrets",
                  "Private configuration",
                  "User-specific information",
                ]}
              />
            </div>
          </section>

          {/* =================================================
              BOTTOM NAV
              ================================================= */}

          <div
            className="
              mt-8

              flex
              flex-col
              justify-between
              gap-5

              border-t
              border-white/[0.06]

              pt-8

              sm:flex-row
              sm:items-center
            "
          >
            <div>
              <p
                className="
                  text-[9px]
                  tracking-[0.12em]
                  text-white/18
                "
              >
                DEEPRESEARCH AI
              </p>

              <p
                className="
                  mt-2
                  text-[11px]
                  text-white/32
                "
              >
                Product
                documentation
              </p>
            </div>

            <Link
              href="/workspace"
              className="
                text-[11px]
                font-medium
                text-white/42

                transition

                hover:text-[#67e8f9]
              "
            >
              Continue to
              Deep Research →
            </Link>
          </div>
        </main>

        {/* ==================================================
            RIGHT TABLE OF CONTENTS
            ================================================== */}

        <aside
          className="
            sticky
            top-[68px]

            hidden
            h-[calc(100vh-68px)]

            py-14
            pr-6

            xl:block
          "
        >
          <p
            className="
              text-[9px]
              font-semibold
              tracking-[0.12em]
              text-white/20
            "
          >
            ON THIS PAGE
          </p>

          <div
            className="
              mt-5
              space-y-1
            "
          >
            {FLAT_NAVIGATION.map(
              (item) => {
                const active =
                  activeSection ===
                  item.id;

                return (
                  <button
                    key={
                      item.id
                    }
                    type="button"
                    onClick={() =>
                      goToSection(
                        item.id
                      )
                    }
                    className={`
                      block
                      w-full

                      py-1.5

                      text-left
                      text-[10px]

                      transition-colors

                      ${
                        active
                          ? "text-[#67e8f9]"
                          : "text-white/25 hover:text-white/55"
                      }
                    `}
                  >
                    {
                      item.label
                    }
                  </button>
                );
              }
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
   NAVIGATION COMPONENTS
   ============================================================ */

function DocsNavigation({
  activeSection,
  onSelect,
}: {
  activeSection: string;
  onSelect: (
    id: string
  ) => void;
}) {
  return (
    <nav>
      {NAVIGATION.map(
        (group) => (
          <div
            key={
              group.label
            }
            className="
              mb-8
              last:mb-0
            "
          >
            <p
              className="
                mb-3
                px-2

                text-[8px]
                font-semibold
                tracking-[0.14em]
                text-white/18
              "
            >
              {group.label}
            </p>

            <div className="space-y-0.5">
              {group.items.map(
                (item) => {
                  const active =
                    activeSection ===
                    item.id;

                  return (
                    <button
                      key={
                        item.id
                      }
                      type="button"
                      onClick={() =>
                        onSelect(
                          item.id
                        )
                      }
                      className={`
                        relative

                        flex
                        w-full
                        items-center

                        rounded-md

                        px-2
                        py-2

                        text-left
                        text-[11px]

                        transition-colors

                        ${
                          active
                            ? "bg-white/[0.045] text-white/85"
                            : "text-white/34 hover:bg-white/[0.025] hover:text-white/65"
                        }
                      `}
                    >
                      {active && (
                        <span
                          className="
                            absolute
                            -left-5

                            h-4
                            w-px

                            bg-[#67e8f9]
                          "
                        />
                      )}

                      {item.label}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )
      )}
    </nav>
  );
}

/* ============================================================
   SEARCH
   ============================================================ */

function SearchResults({
  results,
  onSelect,
}: {
  results: NavItem[];
  onSelect: (
    id: string
  ) => void;
}) {
  return (
    <div
      className="
        absolute
        left-0
        right-0
        top-[44px]

        z-50

        overflow-hidden

        rounded-lg

        border
        border-white/[0.08]

        bg-[#0a0a0b]

        p-1.5

        shadow-[0_20px_70px_rgba(0,0,0,0.65)]
      "
    >
      {results.length >
      0 ? (
        results.map(
          (result) => (
            <button
              key={
                result.id
              }
              type="button"
              onMouseDown={(
                event
              ) => {
                event.preventDefault();

                onSelect(
                  result.id
                );
              }}
              className="
                flex
                w-full
                items-center
                justify-between

                rounded-md

                px-3
                py-2.5

                text-left

                transition

                hover:bg-white/[0.045]
              "
            >
              <span
                className="
                  text-[11px]
                  text-white/58
                "
              >
                {result.label}
              </span>

              <span
                className="
                  text-[9px]
                  text-white/15
                "
              >
                ↵
              </span>
            </button>
          )
        )
      ) : (
        <p
          className="
            px-3
            py-3

            text-[10px]
            text-white/25
          "
        >
          No matching
          documentation.
        </p>
      )}
    </div>
  );
}

function MobileSearch({
  query,
  setQuery,
  results,
  onSelect,
}: {
  query: string;
  setQuery: (
    value: string
  ) => void;
  results: NavItem[];
  onSelect: (
    id: string
  ) => void;
}) {
  return (
    <div>
      <div
        className="
          flex
          h-10
          items-center
          gap-2

          rounded-lg

          border
          border-white/[0.075]

          bg-white/[0.025]

          px-3
        "
      >
        <SearchIcon />

        <input
          type="search"
          value={query}
          onChange={(
            event
          ) =>
            setQuery(
              event.target.value
            )
          }
          placeholder="Search docs"
          className="
            min-w-0
            flex-1

            bg-transparent

            text-[11px]
            text-white/65

            outline-none

            placeholder:text-white/20
          "
        />
      </div>

      {query && (
        <div
          className="
            mt-2
            rounded-lg
            border
            border-white/[0.06]
            p-1
          "
        >
          {results.map(
            (result) => (
              <button
                key={
                  result.id
                }
                type="button"
                onClick={() =>
                  onSelect(
                    result.id
                  )
                }
                className="
                  block
                  w-full

                  rounded-md

                  px-3
                  py-2

                  text-left
                  text-[10px]
                  text-white/40

                  hover:bg-white/[0.04]
                  hover:text-white/70
                "
              >
                {result.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CONTENT HELPERS
   ============================================================ */

function DocMeta({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p
      className="
        text-[9px]
        font-semibold
        tracking-[0.14em]
        text-[#67e8f9]
      "
    >
      {children}
    </p>
  );
}

function SectionTitle({
  label,
  title,
}: {
  label: string;
  title: string;
}) {
  return (
    <>
      <DocMeta>
        {label}
      </DocMeta>

      <h2
        className="
          mt-4

          text-[27px]
          font-semibold
          tracking-[-0.035em]

          text-white/90

          sm:text-[30px]
        "
      >
        {title}
      </h2>
    </>
  );
}

function Divider() {
  return (
    <div
      className="
        h-px
        bg-white/[0.06]
      "
    />
  );
}

function Definition({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt
        className="
          text-[8px]
          font-semibold
          tracking-[0.12em]
          text-white/18
        "
      >
        {label}
      </dt>

      <dd
        className="
          mt-2
          text-[11px]
          text-white/50
        "
      >
        {value}
      </dd>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children:
    React.ReactNode;
}) {
  return (
    <div
      className="
        grid
        gap-3

        border-b
        border-white/[0.055]

        py-5

        last:border-0

        sm:grid-cols-[48px_170px_1fr]
        sm:gap-5
      "
    >
      <span
        className="
          text-[9px]
          text-[#67e8f9]/60

          [font-family:var(--font-docs-mono)]
        "
      >
        {number}
      </span>

      <strong
        className="
          text-[11px]
          font-semibold
          text-white/68
        "
      >
        {title}
      </strong>

      <p
        className="
          max-w-[440px]

          text-[12px]
          leading-6
          text-white/30
        "
      >
        {children}
      </p>
    </div>
  );
}

function ReferenceRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        grid
        gap-3

        py-5

        sm:grid-cols-[160px_1fr]
        sm:gap-8
      "
    >
      <strong
        className="
          text-[11px]
          font-semibold
          text-white/65
        "
      >
        {title}
      </strong>

      <p
        className="
          max-w-[500px]

          text-[12px]
          leading-6
          text-white/31
        "
      >
        {description}
      </p>
    </div>
  );
}

function SimpleList({
  heading,
  items,
}: {
  heading: string;
  items: string[];
}) {
  return (
    <div>
      <h3
        className="
          text-[11px]
          font-semibold
          text-white/62
        "
      >
        {heading}
      </h3>

      <ul
        className="
          mt-4
          space-y-3
        "
      >
        {items.map(
          (item) => (
            <li
              key={item}
              className="
                flex
                items-start
                gap-3

                text-[11px]
                leading-5
                text-white/30
              "
            >
              <span
                className="
                  mt-[8px]

                  h-1
                  w-1
                  shrink-0

                  rounded-full

                  bg-[#67e8f9]/60
                "
              />

              {item}
            </li>
          )
        )}
      </ul>
    </div>
  );
}

/* ============================================================
   SMALL FEATHER-LIKE UI ICONS

   Kept intentionally minimal so Docs does not load another
   large icon package just for two utility controls.
   ============================================================ */

function SearchIcon() {
  return (
    <span
      aria-hidden
      className="
        relative
        block
        h-3.5
        w-3.5
        shrink-0
      "
    >
      <span
        className="
          absolute
          left-0
          top-0

          h-[10px]
          w-[10px]

          rounded-full

          border
          border-white/28
        "
      />

      <span
        className="
          absolute
          bottom-[1px]
          right-0

          h-px
          w-[5px]

          rotate-45

          bg-white/28
        "
      />
    </span>
  );
}

function MenuIcon() {
  return (
    <span
      aria-hidden
      className="
        flex
        h-4
        w-4
        flex-col
        justify-center
        gap-[4px]
      "
    >
      <span
        className="
          block
          h-px
          w-full
          bg-current
        "
      />

      <span
        className="
          block
          h-px
          w-full
          bg-current
        "
      />
    </span>
  );
}

