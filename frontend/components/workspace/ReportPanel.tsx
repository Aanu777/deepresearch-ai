"use client";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clipboard,
  Download,
  FileText,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useResearch,
} from "../context/ResearchContext";

import {
  Badge,
  IconButton,
  Spinner,
} from "@/components/ui";

import {
  submitResearchFeedback,
  type ResearchFeedbackReason,
} from "@/lib/research";

const RESEARCH_FEEDBACK_REASONS: Array<{
  value: ResearchFeedbackReason;
  label: string;
}> = [
  {
    value: "incorrect",
    label: "Incorrect",
  },
  {
    value: "incomplete",
    label: "Incomplete",
  },
  {
    value: "bad_sources",
    label: "Bad sources",
  },
  {
    value: "outdated",
    label: "Outdated",
  },
  {
    value: "too_verbose",
    label: "Too verbose",
  },
  {
    value: "too_brief",
    label: "Too brief",
  },
  {
    value: "formatting",
    label: "Formatting",
  },
  {
    value: "other",
    label: "Other",
  },
];


export default function ReportPanel() {
  const {
    job,
  } =
    useResearch();

  const [
    copied,
    setCopied,
  ] =
    useState(false);

  const [
    feedbackRating,
    setFeedbackRating,
  ] =
    useState<
      "up" | "down" | null
    >(
      null
    );

  const [
    feedbackOpen,
    setFeedbackOpen,
  ] =
    useState(false);

  const [
    feedbackReason,
    setFeedbackReason,
  ] =
    useState<
      ResearchFeedbackReason | ""
    >(
      ""
    );

  const [
    feedbackCorrection,
    setFeedbackCorrection,
  ] =
    useState(
      ""
    );

  const [
    feedbackSubmitting,
    setFeedbackSubmitting,
  ] =
    useState(false);

  const [
    feedbackError,
    setFeedbackError,
  ] =
    useState<
      string | null
    >(
      null
    );

  const report =
    job?.report ?? "";

  const status =
    job?.status ?? "idle";

  useEffect(
    () => {
      setFeedbackRating(
        null
      );

      setFeedbackOpen(
        false
      );

      setFeedbackReason(
        ""
      );

      setFeedbackCorrection(
        ""
      );

      setFeedbackError(
        null
      );
    },
    [
      job?.job_id,
    ]
  );

  async function submitPositiveFeedback() {
    if (
      !job?.job_id ||
      feedbackSubmitting
    ) {
      return;
    }

    setFeedbackSubmitting(
      true
    );

    setFeedbackError(
      null
    );

    try {
      await submitResearchFeedback(
        job.job_id,
        {
          rating:
            "up",
        }
      );

      setFeedbackRating(
        "up"
      );

      setFeedbackOpen(
        false
      );

      setFeedbackReason(
        ""
      );

      setFeedbackCorrection(
        ""
      );

    } catch (
      error
    ) {
      setFeedbackError(
        error instanceof Error
          ? error.message
          : "Feedback could not be saved."
      );

    } finally {
      setFeedbackSubmitting(
        false
      );
    }
  }

  function openNegativeFeedback() {
    if (
      feedbackSubmitting
    ) {
      return;
    }

    setFeedbackError(
      null
    );

    setFeedbackOpen(
      true
    );
  }

  function cancelNegativeFeedback() {
    if (
      feedbackSubmitting
    ) {
      return;
    }

    setFeedbackOpen(
      false
    );

    setFeedbackError(
      null
    );
  }

  async function submitNegativeFeedback() {
    if (
      !job?.job_id ||
      feedbackSubmitting
    ) {
      return;
    }

    setFeedbackSubmitting(
      true
    );

    setFeedbackError(
      null
    );

    try {
      const trimmedCorrection =
        feedbackCorrection
        .trim();

      await submitResearchFeedback(
        job.job_id,
        {
          rating:
            "down",

          ...(feedbackReason
            ? {
                reason:
                  feedbackReason,
              }
            : {}),

          ...(trimmedCorrection
            ? {
                correction:
                  trimmedCorrection,
              }
            : {}),
        }
      );

      setFeedbackRating(
        "down"
      );

      setFeedbackOpen(
        false
      );

    } catch (
      error
    ) {
      setFeedbackError(
        error instanceof Error
          ? error.message
          : "Feedback could not be saved."
      );

    } finally {
      setFeedbackSubmitting(
        false
      );
    }
  }

  // ==========================================================
  // COPY
  // ==========================================================

  async function copyReport() {
    if (!report) {
      return;
    }

    await navigator.clipboard.writeText(
      report
    );

    setCopied(
      true
    );

    setTimeout(
      () =>
        setCopied(
          false
        ),
      1800
    );
  }

  // ==========================================================
  // DOWNLOAD
  // ==========================================================

  function downloadReport() {
    if (!report) {
      return;
    }

    const blob =
      new Blob(
        [report],
        {
          type:
            "text/plain;charset=utf-8",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      "deepresearch-report.txt";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );
  }

  // ==========================================================
  // IDLE
  // ==========================================================

  if (
    !job &&
    status === "idle"
  ) {
    return (
      <section className="w-full border-t border-white/[0.08]">
        <div className="flex min-h-[240px] items-center justify-center">
          <div className="max-w-md px-6 text-center">
            <FileText
              size={20}
              strokeWidth={1.5}
              className="mx-auto mb-4 text-white/20"
            />

            <p className="text-sm font-medium text-white/60">
              Your research report will appear here
            </p>

            <p className="mt-2 text-xs leading-5 text-white/25">
              Start a research task above and the finished answer
              will appear in this space.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================================
  // RUNNING
  // ==========================================================

  if (
    status === "running" ||
    status === "queued" ||
    status === "processing"
  ) {
    return (
      <section className="w-full border-t border-white/[0.08]">
        <div className="py-8">
          <div className="flex items-center gap-3">
            <Spinner
              size={16}
              className="text-cyan-400"
            />

            <div>
              <p className="text-sm font-medium text-white/70">
                Researching
              </p>

              <p className="mt-1 text-xs text-white/25">
                Gathering and analyzing information...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================================
  // FAILED
  // ==========================================================

  if (
    status ===
    "failed"
  ) {
    return (
      <section className="w-full border-t border-white/[0.08]">
        <div className="py-8">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div>
              <p className="text-sm font-medium text-white/70">
                Research could not be completed
              </p>

              <p className="mt-1 text-xs leading-5 text-white/25">
                Something went wrong while processing this research
                request.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================================
  // REPORT
  // ==========================================================

  return (
    <section className="w-full border-t border-white/[0.08]">
      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-white/[0.06] py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <FileText
            size={16}
            className="shrink-0 text-white/30"
          />

          <span className="truncate text-sm font-medium text-white/65">
            Research report
          </span>

          {report && (
            <Badge
              variant="neutral"
              className="hidden sm:inline-flex"
            >
              {getWordCount(
                report
              )}{" "}
              words
            </Badge>
          )}
        </div>

        {report && (
          <div className="flex items-center gap-1">
            <IconButton
              type="button"
              size="sm"
              onClick={
                copyReport
              }
              aria-label="Copy report"
              title={
                copied
                  ? "Copied"
                  : "Copy report"
              }
            >
              {copied ? (
                <Check
                  size={14}
                />
              ) : (
                <Clipboard
                  size={14}
                />
              )}
            </IconButton>

            <IconButton
              type="button"
              size="sm"
              onClick={
                downloadReport
              }
              aria-label="Download report"
              title="Download report"
            >
              <Download
                size={14}
              />
            </IconButton>

            <IconButton
              type="button"
              size="sm"
              disabled={
                feedbackSubmitting
              }
              onClick={() => {
                void submitPositiveFeedback();
              }}
              aria-label="Good research report"
              title="Good research report"
              className={
                feedbackRating ===
                "up"
                  ? "bg-white/[0.08] text-white/85"
                  : undefined
              }
            >
              <ThumbsUp
                size={14}
              />
            </IconButton>

            <IconButton
              type="button"
              size="sm"
              disabled={
                feedbackSubmitting
              }
              onClick={
                openNegativeFeedback
              }
              aria-label="Bad research report"
              title="Bad research report"
              className={
                feedbackRating ===
                "down"
                  ? "bg-white/[0.08] text-white/85"
                  : undefined
              }
            >
              <ThumbsDown
                size={14}
              />
            </IconButton>
          </div>
        )}
      </div>

      {report &&
        feedbackOpen && (
        <div
          className="
            border-b
            border-white/[0.06]
            py-4
          "
        >
          <div
            className="
              max-w-2xl
              rounded-2xl
              border
              border-white/[0.08]
              bg-white/[0.025]
              p-4
            "
          >
            <p
              className="
                text-xs
                font-medium
                text-white/65
              "
            >
              What should improve?
            </p>

            <div
              className="
                mt-2
                flex
                flex-wrap
                gap-1.5
              "
            >
              {RESEARCH_FEEDBACK_REASONS.map(
                (
                  reason
                ) => (
                  <button
                    key={
                      reason.value
                    }
                    type="button"
                    onClick={() => {
                      setFeedbackReason(
                        reason.value
                      );
                    }}
                    className={`
                      rounded-full
                      border
                      px-2.5
                      py-1.5
                      text-[11px]
                      transition

                      ${
                        feedbackReason ===
                        reason.value
                          ? "border-white/[0.16] bg-white/[0.10] text-white/80"
                          : "border-white/[0.07] bg-white/[0.025] text-white/38 hover:bg-white/[0.05] hover:text-white/65"
                      }
                    `}
                  >
                    {
                      reason.label
                    }
                  </button>
                )
              )}
            </div>

            <textarea
              value={
                feedbackCorrection
              }
              onChange={(
                event
              ) => {
                setFeedbackCorrection(
                  event.target.value
                );
              }}
              maxLength={
                4000
              }
              rows={3}
              placeholder="What should future research do differently? (optional)"
              className="
                mt-3
                w-full
                resize-y
                rounded-xl
                border
                border-white/[0.08]
                bg-black/20
                px-3
                py-2.5
                text-xs
                leading-5
                text-white/75
                outline-none
                placeholder:text-white/25
                focus:border-white/[0.14]
              "
            />

            {feedbackError && (
              <p
                className="
                  mt-2
                  text-[11px]
                  text-red-300/80
                "
              >
                {feedbackError}
              </p>
            )}

            <div
              className="
                mt-3
                flex
                items-center
                justify-end
                gap-2
              "
            >
              <button
                type="button"
                disabled={
                  feedbackSubmitting
                }
                onClick={
                  cancelNegativeFeedback
                }
                className="
                  rounded-lg
                  px-3
                  py-1.5
                  text-xs
                  text-white/38
                  transition
                  hover:bg-white/[0.05]
                  hover:text-white/65
                  disabled:opacity-40
                "
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  feedbackSubmitting
                }
                onClick={() => {
                  void submitNegativeFeedback();
                }}
                className="
                  rounded-lg
                  border
                  border-white/[0.10]
                  bg-white/[0.08]
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-white/75
                  transition
                  hover:bg-white/[0.12]
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {feedbackSubmitting
                  ? "Saving..."
                  : "Submit feedback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!feedbackOpen &&
        feedbackError && (
        <p
          className="
            border-b
            border-white/[0.06]
            py-3
            text-[11px]
            text-red-300/75
          "
        >
          {feedbackError}
        </p>
      )}

      {/* BODY */}

      {!report ? (
        <div className="py-10">
          <p className="text-sm text-white/25">
            No report was generated.
          </p>
        </div>
      ) : (
        <article className="max-w-3xl py-8 sm:py-10">
          <ReportContent
            content={
              report
            }
          />
        </article>
      )}

      {/* COMPLETION */}

      {report && (
        <div className="flex items-center gap-2 border-t border-white/[0.06] py-4 text-[11px] text-white/25">
          <CheckCircle2
            size={13}
            className="text-emerald-400/70"
          />

          <span>
            Research completed
          </span>
        </div>
      )}
    </section>
  );
}

// ============================================================
// REPORT CONTENT
// ============================================================

function ReportContent({
  content,
}: {
  content: string;
}) {
  const blocks =
    content
      .split(
        /\n\s*\n/
      )
      .map(
        (
          block
        ) =>
          block.trim()
      )
      .filter(
        Boolean
      );

  return (
    <div className="space-y-7">
      {blocks.map(
        (
          block,
          index
        ) => {
          const lines =
            block
              .split(
                "\n"
              )
              .map(
                (
                  line
                ) =>
                  line.trim()
              )
              .filter(
                Boolean
              );

          const firstLine =
            lines[0];

          // ====================================================
          // HEADING
          // ====================================================

          if (
            /^#{1,3}\s/.test(
              firstLine
            )
          ) {
            const heading =
              firstLine.replace(
                /^#{1,3}\s+/,
                ""
              );

            return (
              <div key={index}>
                <h2
                  className="
                    text-lg
                    font-semibold
                    tracking-[-0.02em]
                    text-white/95
                    sm:text-xl
                  "
                >
                  {heading}
                </h2>

                {lines
                  .slice(
                    1
                  )
                  .map(
                    (
                      line,
                      lineIndex
                    ) => (
                      <p
                        key={
                          lineIndex
                        }
                        className="
                          mt-3
                          text-sm
                          leading-7
                          text-white/55
                        "
                      >
                        {formatInlineMarkdown(
                          line
                        )}
                      </p>
                    )
                  )}
              </div>
            );
          }

          // ====================================================
          // BULLETS
          // ====================================================

          if (
            lines.every(
              (
                line
              ) =>
                /^[-*•]\s+/.test(
                  line
                )
            )
          ) {
            return (
              <ul
                key={index}
                className="space-y-2.5 pl-5"
              >
                {lines.map(
                  (
                    line,
                    lineIndex
                  ) => (
                    <li
                      key={
                        lineIndex
                      }
                      className="
                        list-disc
                        pl-1
                        text-sm
                        leading-7
                        text-white/55
                        marker:text-white/25
                      "
                    >
                      {formatInlineMarkdown(
                        line.replace(
                          /^[-*•]\s+/,
                          ""
                        )
                      )}
                    </li>
                  )
                )}
              </ul>
            );
          }

          // ====================================================
          // NUMBERED
          // ====================================================

          if (
            lines.every(
              (
                line
              ) =>
                /^\d+\.\s+/.test(
                  line
                )
            )
          ) {
            return (
              <ol
                key={index}
                className="space-y-2.5 pl-6"
              >
                {lines.map(
                  (
                    line,
                    lineIndex
                  ) => (
                    <li
                      key={
                        lineIndex
                      }
                      className="
                        list-decimal
                        pl-1
                        text-sm
                        leading-7
                        text-white/55
                        marker:text-white/30
                      "
                    >
                      {formatInlineMarkdown(
                        line.replace(
                          /^\d+\.\s+/,
                          ""
                        )
                      )}
                    </li>
                  )
                )}
              </ol>
            );
          }

          // ====================================================
          // PARAGRAPH
          // ====================================================

          return (
            <p
              key={index}
              className="
                text-[15px]
                leading-7
                text-white/68
              "
            >
              {formatInlineMarkdown(
                block.replace(
                  /\n/g,
                  " "
                )
              )}
            </p>
          );
        }
      )}
    </div>
  );
}

// ============================================================
// INLINE MARKDOWN
// ============================================================

function formatInlineMarkdown(
  text: string
) {
  const parts =
    text.split(
      /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g
    );

  return parts.map(
    (
      part,
      index
    ) => {
      if (
        part.startsWith(
          "**"
        ) &&
        part.endsWith(
          "**"
        )
      ) {
        return (
          <strong
            key={
              index
            }
            className="font-semibold text-white/90"
          >
            {part.slice(
              2,
              -2
            )}
          </strong>
        );
      }

      if (
        part.startsWith(
          "*"
        ) &&
        part.endsWith(
          "*"
        )
      ) {
        return (
          <em
            key={
              index
            }
            className="text-white/65"
          >
            {part.slice(
              1,
              -1
            )}
          </em>
        );
      }

      if (
        part.startsWith(
          "`"
        ) &&
        part.endsWith(
          "`"
        )
      ) {
        return (
          <code
            key={
              index
            }
            className="
              rounded-md
              border
              border-white/[0.06]
              bg-white/[0.05]
              px-1.5
              py-0.5
              font-mono
              text-[12px]
              text-white/80
            "
          >
            {part.slice(
              1,
              -1
            )}
          </code>
        );
      }

      return (
        <span key={index}>
          {part}
        </span>
      );
    }
  );
}

// ============================================================
// WORD COUNT
// ============================================================

function getWordCount(
  text: string
) {
  return text
    .trim()
    .split(
      /\s+/
    )
    .filter(
      Boolean
    ).length;
}