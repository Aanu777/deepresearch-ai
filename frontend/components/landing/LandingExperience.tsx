"use client";

import Link from "next/link";

import {
  type ReactNode,
  useEffect,
  useRef,
} from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "./LandingExperience.module.css";

/* ============================================================
   ASSETS
   ============================================================ */

const CORE_IMAGE =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3IuPm94x35T3Pr6R7fJtC0Ac1Vy/hf_20260905_124238_8314b31e-f461-4f3c-bd35-2b7c69e132c3.png";

const EVIDENCE_IMAGE =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3IuPm94x35T3Pr6R7fJtC0Ac1Vy/hf_20260905_181930_3773f7ea-5bad-4069-b90e-5e4fcb349014.png";

const CTA_IMAGE =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3IuPm94x35T3Pr6R7fJtC0Ac1Vy/hf_20260905_181930_93405630-aae9-4423-8277-433b81a279f2.png";

/* ============================================================
   DATA
   ============================================================ */

const agents = [
  {
    number: "01",
    name: "Planner",
    title:
      "Turn the question into a research plan.",
    description:
      "The system decomposes the request into objectives, sub-questions, and evidence targets before it opens a source.",
    signal:
      "Research objectives created",
  },

  {
    number: "02",
    name: "Searcher",
    title:
      "Search beyond the model.",
    description:
      "Live sources are discovered against the plan instead of relying on a single pass through static model memory.",
    signal:
      "Live source search active",
  },

  {
    number: "03",
    name: "Extractor",
    title:
      "Pull out only what matters.",
    description:
      "Claims, facts, context, and useful evidence are extracted from collected source material and normalized for analysis.",
    signal:
      "Evidence extraction active",
  },

  {
    number: "04",
    name: "Reflection",
    title:
      "Challenge the research state.",
    description:
      "The system looks for weak coverage, contradictions, unanswered angles, and places where another search pass is needed.",
    signal:
      "Coverage gaps detected",
  },

  {
    number: "05",
    name: "Verifier",
    title:
      "Make the claims earn their place.",
    description:
      "Important statements are checked against the underlying evidence before they are allowed into the final synthesis.",
    signal:
      "Claim verification running",
  },

  {
    number: "06",
    name: "Synthesizer",
    title:
      "Connect evidence across sources.",
    description:
      "Separate findings are reconciled into one coherent research state instead of being stacked as disconnected summaries.",
    signal:
      "Cross-source synthesis active",
  },

  {
    number: "07",
    name: "Writer",
    title:
      "Turn research into something usable.",
    description:
      "The verified synthesis becomes a structured report built for reading, auditing, exporting, and continuing with follow-up questions.",
    signal:
      "Final report assembling",
  },
];

const sources = [
  {
    id: "SOURCE 01",
    title: "Research paper",
    description:
      "Primary evidence mapped directly to a report claim.",
    tag: "VERIFIED",
  },

  {
    id: "SOURCE 02",
    title: "Technical documentation",
    description:
      "Implementation details checked against the synthesized explanation.",
    tag: "CHECKED",
  },

  {
    id: "SOURCE 03",
    title: "Independent analysis",
    description:
      "A second perspective used to challenge or confirm the first source.",
    tag: "VERIFIED",
  },
];

/* ============================================================
   COMPONENT
   ============================================================ */

export default function LandingExperience() {
  const rootRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(() => {
    gsap.registerPlugin(
      ScrollTrigger
    );

    const root =
      rootRef.current;

    if (!root) {
      return;
    }

    const mm =
      gsap.matchMedia();

    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const context =
          gsap.context(() => {
            const core =
              root.querySelector<HTMLElement>(
                "[data-core]"
              );

            const agentPanels =
              gsap.utils.toArray<HTMLElement>(
                "[data-agent-panel]",
                root
              );

            const agentDots =
              gsap.utils.toArray<HTMLElement>(
                "[data-agent-dot]",
                root
              );

            /* ==================================================
               HERO ENTRANCE
               ================================================== */

            const heroReveal =
              root.querySelector<HTMLElement>(
                "[data-hero-reveal]"
              );

            if (heroReveal) {
              gsap.fromTo(
                heroReveal.children,
                {
                  opacity: 0,
                  y: 22,
                },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.75,
                  stagger: 0.065,
                  ease: "power3.out",
                }
              );
            }

            /* ==================================================
               AGENT INITIAL STATE
               ================================================== */

            agentPanels.forEach(
              (
                panel,
                index
              ) => {
                gsap.set(
                  panel,
                  {
                    autoAlpha:
                      index === 0
                        ? 1
                        : 0,

                    y:
                      index === 0
                        ? 0
                        : 24,
                  }
                );
              }
            );

            agentDots.forEach(
              (
                dot,
                index
              ) => {
                gsap.set(
                  dot,
                  {
                    opacity:
                      index === 0
                        ? 1
                        : 0.2,

                    scale:
                      index === 0
                        ? 1.25
                        : 1,
                  }
                );
              }
            );

            /* ==================================================
               SINGLE SCRUBBED TIMELINE

               This is now the ONLY complex scrubbed timeline
               on the whole landing page.
               ================================================== */

            if (
              agentPanels.length >
              0
            ) {
              const timeline =
                gsap.timeline({
                  scrollTrigger: {
                    trigger:
                      "#agents",

                    start:
                      "top top",

                    end:
                      "bottom bottom",

                    scrub: 0.3,

                    invalidateOnRefresh:
                      true,
                  },
                });

              timeline.to(
                {},
                {
                  duration: 0.45,
                }
              );

              for (
                let index = 1;
                index <
                agentPanels.length;
                index += 1
              ) {
                const previous =
                  agentPanels[
                    index - 1
                  ];

                const current =
                  agentPanels[
                    index
                  ];

                timeline.to(
                  previous,
                  {
                    autoAlpha: 0,
                    y: -18,
                    duration: 0.2,
                    ease: "power1.in",
                  }
                );

                timeline.fromTo(
                  current,
                  {
                    autoAlpha: 0,
                    y: 24,
                  },
                  {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.26,
                    ease: "power1.out",
                  },
                  "<0.03"
                );

                timeline.to(
                  agentDots[
                    index - 1
                  ],
                  {
                    opacity: 0.2,
                    scale: 1,
                    duration: 0.16,
                  },
                  "<"
                );

                timeline.to(
                  agentDots[index],
                  {
                    opacity: 1,
                    scale: 1.25,
                    duration: 0.16,
                  },
                  "<"
                );

                if (core) {
                  timeline.to(
                    core,
                    {
                      scale:
                        index % 2 ===
                        0
                          ? 1.012
                          : 0.988,

                      duration: 0.28,

                      ease: "none",
                    },
                    "<"
                  );
                }

                timeline.to(
                  {},
                  {
                    duration: 0.48,
                  }
                );
              }
            }

            /* ==================================================
               CORE VISIBILITY

               Non-scrubbed.
               No transform fights.
               ================================================== */

            if (core) {
              ScrollTrigger.create({
                trigger:
                  "#evidence",

                start:
                  "top 82%",

                onEnter: () => {
                  gsap.to(
                    core,
                    {
                      opacity: 0,
                      duration: 0.28,
                      overwrite: true,
                    }
                  );
                },

                onLeaveBack: () => {
                  gsap.to(
                    core,
                    {
                      opacity: 1,
                      duration: 0.28,
                      overwrite: true,
                    }
                  );
                },
              });
            }

            requestAnimationFrame(
              () => {
                ScrollTrigger.refresh();
              }
            );
          }, root);

        return () => {
          context.revert();
        };
      }
    );

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={styles.root}
    >
      <div
        className={
          styles.backgroundGrid
        }
        aria-hidden="true"
      />

      {/* ====================================================
          PERSISTENT CORE
          ==================================================== */}

      <div
        className={styles.core}
        data-core
        aria-hidden="true"
      >
        <img
          src={CORE_IMAGE}
          alt=""
          width={2752}
          height={1536}
          draggable={false}
          decoding="async"
          fetchPriority="high"
        />
      </div>

      {/* ====================================================
          HERO
          ==================================================== */}

      <section
        id="hero"
        className={styles.hero}
      >
        <div
          className={
            styles.heroShade
          }
        />

        <div
          className={styles.container}
        >
          <div
            className={
              styles.heroCopy
            }
            data-hero-reveal
          >
            <Eyebrow>
              DEEP RESEARCH,
              ORCHESTRATED
            </Eyebrow>

            <h1
              className={
                styles.heroTitle
              }
            >
              <span>
                Research that
              </span>

              <span>
                thinks in systems.
              </span>
            </h1>

            <p
              className={
                styles.heroDescription
              }
            >
              DeepResearch AI
              plans, searches,
              extracts, reflects,
              verifies, and
              synthesizes evidence
              into reports you can
              actually trust.
            </p>

            <div
              className={
                styles.heroActions
              }
            >
              <PrimaryCta>
                Start a deep research
              </PrimaryCta>

              <a
                href="#thesis"
                className={
                  styles.secondaryCta
                }
              >
                Follow the research

                <span>
                  ↓
                </span>
              </a>
            </div>

            <div
              className={
                styles.heroPipeline
              }
            >
              <span>
                PLANNER
              </span>

              <i />

              <span>
                SEARCHER
              </span>

              <i />

              <span>
                EXTRACTOR
              </span>

              <i />

              <span>
                REFLECTION
              </span>

              <i />

              <span>
                VERIFIER
              </span>

              <i />

              <span>
                SYNTHESIZER
              </span>

              <i />

              <span>
                WRITER
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          THESIS
          ==================================================== */}

      <section
        id="thesis"
        className={styles.thesis}
      >
        <div
          className={
            styles.thesisShade
          }
        />

        <div
          className={styles.container}
        >
          <div
            className={
              styles.thesisCopy
            }
          >
            <Eyebrow>
              01 / THE DIFFERENCE
            </Eyebrow>

            <h2>
              Most AI gives you an
              answer.

              <span>
                DeepResearch builds
                a case.
              </span>
            </h2>

            <p>
              Plan the work.
              Gather evidence.
              Challenge weak
              claims. Verify what
              survives. Then
              synthesize.
            </p>

            <div
              className={
                styles.principles
              }
            >
              <Principle
                title="PLAN BEFORE SEARCH"
                text="Decompose the question before sources are opened."
              />

              <Principle
                title="VERIFY BEFORE CLAIM"
                text="Check support, relevance, and conflicts before synthesis."
              />

              <Principle
                title="SYNTHESIZE, DON'T SUMMARIZE"
                text="Connect findings instead of stacking snippets."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          AGENTS
          ==================================================== */}

      <section
        id="agents"
        className={styles.agents}
      >
        <div
          className={
            styles.agentSticky
          }
        >
          <div
            className={
              styles.agentShade
            }
          />

          <div
            className={
              styles.agentHeader
            }
          >
            <Eyebrow>
              02 / THE RESEARCH
              ENGINE
            </Eyebrow>

            <p>
              One question. Seven
              specialized agents.
            </p>
          </div>

          <div
            className={
              styles.agentStage
            }
          >
            {agents.map(
              (
                agent
              ) => (
                <article
                  key={
                    agent.number
                  }
                  className={
                    styles.agentPanel
                  }
                  data-agent-panel
                >
                  <div
                    className={
                      styles.agentMeta
                    }
                  >
                    <span>
                      {
                        agent.number
                      }
                    </span>

                    <i />

                    <span>
                      {agent.name.toUpperCase()}
                    </span>
                  </div>

                  <h2>
                    {
                      agent.title
                    }
                  </h2>

                  <p>
                    {
                      agent.description
                    }
                  </p>

                  <div
                    className={
                      styles.signal
                    }
                  >
                    <b />

                    {
                      agent.signal
                    }
                  </div>
                </article>
              )
            )}
          </div>

          <div
            className={
              styles.agentRail
            }
          >
            <div
              className={
                styles.railLine
              }
            />

            {agents.map(
              (
                agent
              ) => (
                <div
                  key={
                    agent.number
                  }
                  className={
                    styles.railStep
                  }
                >
                  <span
                    data-agent-dot
                  />

                  <small>
                    {
                      agent.number
                    }
                  </small>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ====================================================
          EVIDENCE
          ==================================================== */}

      <section
        id="evidence"
        className={styles.evidence}
      >
        <div
          className={
            styles.evidenceArt
          }
          aria-hidden="true"
        >
          <img
            src={EVIDENCE_IMAGE}
            alt=""
            width={2752}
            height={1536}
            draggable={false}
            decoding="async"
          />
        </div>

        <div
          className={
            styles.evidenceShade
          }
        />

        <div
          className={styles.container}
        >
          <div
            className={
              styles.evidenceContent
            }
          >
            <div
              className={
                styles.evidenceHeader
              }
            >
              <Eyebrow>
                03 / EVIDENCE, NOT
                VIBES
              </Eyebrow>

              <h2>
                Sources stay attached
                <br />
                to the claims they
                support.
              </h2>

              <p>
                Evidence stays
                inspectable
                throughout the
                research process,
                so every important
                claim retains its
                supporting context.
              </p>
            </div>

            <div
              className={
                styles.sourceStack
              }
            >
              {sources.map(
                (
                  source
                ) => (
                  <article
                    key={
                      source.id
                    }
                    className={
                      styles.sourceCard
                    }
                  >
                    <span
                      className={
                        styles.sourceId
                      }
                    >
                      {
                        source.id
                      }
                    </span>

                    <h3>
                      {
                        source.title
                      }
                    </h3>

                    <p>
                      {
                        source.description
                      }
                    </p>

                    <span
                      className={
                        styles.sourceTag
                      }
                    >
                      {
                        source.tag
                      }
                    </span>
                  </article>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          REPORT
          ==================================================== */}

      <section
        id="report"
        className={styles.report}
      >
        <div
          className={styles.container}
        >
          <div
            className={
              styles.reportContent
            }
          >
            <div
              className={
                styles.reportHeader
              }
            >
              <Eyebrow>
                04 / THE OUTPUT
              </Eyebrow>

              <h2>
                From a messy
                question
                <br />
                to a report with
                structure.
              </h2>
            </div>

            <div
              className={
                styles.reportGrid
              }
            >
              <article
                className={
                  styles.reportCard
                }
              >
                <h3>
                  The State of
                  AI-Assisted
                  Research
                </h3>

                <small>
                  DEEP RESEARCH
                  REPORT · 12
                  SOURCES · VERIFIED
                  SYNTHESIS
                </small>

                <div
                  className={
                    styles.reportBody
                  }
                >
                  <strong>
                    EXECUTIVE
                    SUMMARY
                  </strong>

                  <p>
                    AI-assisted
                    research is
                    shifting from
                    single-pass
                    answer generation
                    toward
                    orchestrated
                    systems that
                    separate planning,
                    retrieval,
                    verification, and
                    synthesis.
                  </p>

                  <strong
                    className={
                      styles.cyan
                    }
                  >
                    KEY FINDINGS
                  </strong>

                  <ul>
                    <li>
                      01 — Planning
                      improves research
                      coverage before
                      retrieval begins.
                    </li>

                    <li>
                      02 — Verification
                      reduces
                      unsupported
                      synthesis and
                      source drift.
                    </li>

                    <li>
                      03 — Source-linked
                      writing makes the
                      result easier to
                      audit.
                    </li>
                  </ul>
                </div>
              </article>

              <aside
                className={
                  styles.reportAside
                }
              >
                <h3>
                  Made to be used,
                  <br />
                  not admired.
                </h3>

                <ul>
                  <li>
                    ↗ Export a
                    professional
                    report
                  </li>

                  <li>
                    ↗ Inspect every
                    source
                  </li>

                  <li>
                    ↗ Continue with
                    follow-up questions
                  </li>

                  <li>
                    ↗ Copy findings
                    into your workflow
                  </li>
                </ul>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          CTA
          ==================================================== */}

      <section
        id="cta"
        className={styles.cta}
      >
        <div
          className={
            styles.ctaArt
          }
          aria-hidden="true"
        >
          <img
            src={CTA_IMAGE}
            alt=""
            width={2752}
            height={1536}
            draggable={false}
            decoding="async"
          />
        </div>

        <div
          className={
            styles.ctaShade
          }
        />

        <div
          className={styles.container}
        >
          <div
            className={
              styles.ctaContent
            }
          >
            <Eyebrow>
              05 / READY WHEN THE
              QUESTION MATTERS
            </Eyebrow>

            <h2>
              Stop asking AI for
              <br />
              quick answers.
            </h2>

            <p>
              Give it a question
              worth researching.
            </p>

            <PrimaryCta>
              Start researching
            </PrimaryCta>

            <small>
              Conversation for
              quick thinking.
              Deep Research when
              you need evidence.
            </small>
          </div>
        </div>
      </section>

      {/* ====================================================
          FOOTER
          ==================================================== */}

      <footer
        className={styles.footer}
      >
        <div
          className={
            styles.footerInner
          }
        >
          <div>
            <h3>
              DeepResearch AI
            </h3>

            <p>
              Research that thinks
              in systems.
              <br />
              Built for questions
              that deserve evidence.
            </p>
          </div>

          <div
            className={
              styles.footerColumns
            }
          >
            <FooterColumn
              title="PRODUCT"
              items={[
                [
                  "Conversation",
                  "/conversation",
                ],
                [
                  "Deep Research",
                  "/workspace",
                ],
              ]}
            />

            <FooterColumn
              title="RESOURCES"
              items={[
                [
                  "Docs",
                  "/docs",
                ],
                [
                  "Research stack",
                  "#agents",
                ],
              ]}
            />

            <FooterColumn
              title="ACCOUNT"
              items={[
                [
                  "Sign in",
                  "/login",
                ],
                [
                  "Create account",
                  "/signup",
                ],
              ]}
            />
          </div>
        </div>

        <small
          className={
            styles.copyright
          }
        >
          © 2026 DeepResearch AI ·
          Designed for
          evidence-first research
        </small>
      </footer>
    </div>
  );
}

/* ============================================================
   HELPERS
   ============================================================ */

function Eyebrow({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p
      className={styles.eyebrow}
    >
      {children}
    </p>
  );
}

function PrimaryCta({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Link
      href="/workspace"
      className={
        styles.primaryCta
      }
    >
      {children}

      <span>
        ↗
      </span>
    </Link>
  );
}

function Principle({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <article
      className={
        styles.principle
      }
    >
      <strong>
        {title}
      </strong>

      <p>
        {text}
      </p>
    </article>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;

  items: [
    string,
    string,
  ][];
}) {
  return (
    <div>
      <strong>
        {title}
      </strong>

      {items.map(
        ([
          label,
          href,
        ]) => (
          <Link
            key={label}
            href={href}
          >
            {label}
          </Link>
        )
      )}
    </div>
  );
}