"use client";

import {
  Database,
  Download,
  FileJson,
  FlaskConical,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  clearTrainingDataset,
  deleteTrainingExample,
  exportTrainingDataset,
  getTrainingOverview,
  type TrainingOverview,
} from "@/lib/training";


function downloadText(
  filename: string,
  content: string,
  type:
    string =
      "application/json"
) {
  const blob =
    new Blob(
      [
        content,
      ],
      {
        type,
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const anchor =
    document.createElement(
      "a"
    );

  anchor.href =
    url;

  anchor.download =
    filename;

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  window.setTimeout(
    () => {
      URL.revokeObjectURL(
        url
      );
    },
    0
  );
}


function shortText(
  value: string,
  max = 220
) {
  const text =
    value.trim();

  if (
    text.length <= max
  ) {
    return text;
  }

  return (
    text.slice(
      0,
      max
    )
    + "…"
  );
}


export default function TrainingWorkspace() {
  const [
    overview,
    setOverview,
  ] =
    useState<
      TrainingOverview | null
    >(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null
    );

  const [
    exporting,
    setExporting,
  ] =
    useState<
      "sft"
      | "preference"
      | null
    >(
      null
    );

  const [
    clearing,
    setClearing,
  ] =
    useState(false);

  const [
    busyId,
    setBusyId,
  ] =
    useState<
      string | null
    >(
      null
    );


  const loadOverview =
    useCallback(
      async () => {
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          setOverview(
            await getTrainingOverview()
          );

        } catch (
          caught
        ) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Unable to load training data."
          );

        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );


  useEffect(
    () => {
      void loadOverview();
    },
    [
      loadOverview,
    ]
  );


  async function exportDataset(
    format:
      | "sft"
      | "preference"
  ) {
    setExporting(
      format
    );

    setError(
      null
    );

    try {
      const result =
        await exportTrainingDataset(
          format
        );

      const stamp =
        new Date()
        .toISOString()
        .slice(
          0,
          10
        );

      downloadText(
        `deepresearch-${format}-train-${stamp}.jsonl`,
        result.train_jsonl,
        "application/x-ndjson"
      );

      if (
        result
        .validation_jsonl
      ) {
        downloadText(
          `deepresearch-${format}-validation-${stamp}.jsonl`,
          result.validation_jsonl,
          "application/x-ndjson"
        );
      }

      downloadText(
        `deepresearch-${format}-manifest-${stamp}.json`,
        JSON.stringify(
          result.manifest,
          null,
          2
        )
        + "\n"
      );

    } catch (
      caught
    ) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to export training data."
      );

    } finally {
      setExporting(
        null
      );
    }
  }


  async function removeExample(
    exampleId: string
  ) {
    setBusyId(
      exampleId
    );

    setError(
      null
    );

    try {
      await deleteTrainingExample(
        exampleId
      );

      setOverview(
        (
          previous
        ) => {
          if (!previous) {
            return previous;
          }

          const sample =
            previous.samples.find(
              (
                item
              ) =>
                item.id ===
                exampleId
            );

          return {
            ...previous,

            total_examples:
              Math.max(
                0,
                previous
                .total_examples
                - 1
              ),

            conversation_examples:
              sample?.source_type ===
              "conversation"
                ? Math.max(
                    0,
                    previous
                    .conversation_examples
                    - 1
                  )
                : previous
                  .conversation_examples,

            research_examples:
              sample?.source_type ===
              "research"
                ? Math.max(
                    0,
                    previous
                    .research_examples
                    - 1
                  )
                : previous
                  .research_examples,

            samples:
              previous
              .samples
              .filter(
                (
                  item
                ) =>
                  item.id !==
                  exampleId
              ),
          };
        }
      );

      void loadOverview();

    } catch (
      caught
    ) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to delete training example."
      );

    } finally {
      setBusyId(
        null
      );
    }
  }


  async function clearAll() {
    if (
      !overview
      || overview
      .total_examples ===
      0
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Clear every private training example? This does not delete your conversations, research jobs, or memories."
      );

    if (!confirmed) {
      return;
    }

    setClearing(
      true
    );

    setError(
      null
    );

    try {
      await clearTrainingDataset();

      await loadOverview();

    } catch (
      caught
    ) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to clear training data."
      );

    } finally {
      setClearing(
        false
      );
    }
  }


  const total =
    overview
    ?.total_examples ??
    0;


  return (
    <div className="min-h-[100dvh] bg-[#050505]">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pt-10">
        <header className="mb-8 flex flex-col gap-5 border-b border-white/[0.07] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-white/35">
              <Database
                size={14}
              />

              Controlled training data
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Private training dataset
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
              Only corrections you explicitly opt into are stored here. The pipeline redacts obvious secrets and direct identifiers, deduplicates examples, and creates deterministic training and validation splits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                void loadOverview();
              }}
              disabled={
                loading
              }
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-xs font-medium text-white/65 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
            >
              <RefreshCw
                size={14}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                void clearAll();
              }}
              disabled={
                clearing ||
                total === 0
              }
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-3 text-xs font-medium text-red-200/70 transition hover:bg-red-400/[0.10] hover:text-red-100 disabled:opacity-35"
            >
              <Trash2
                size={14}
              />

              {clearing
                ? "Clearing..."
                : "Clear dataset"}
            </button>
          </div>
        </header>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Total"
            value={
              total
            }
          />

          <StatCard
            label="Conversation"
            value={
              overview
              ?.conversation_examples ??
              0
            }
          />

          <StatCard
            label="Research"
            value={
              overview
              ?.research_examples ??
              0
            }
          />

          <StatCard
            label="Avg quality"
            value={
              overview
                ? `${Math.round(
                    overview
                    .average_quality
                    * 100
                  )}%`
                : "—"
            }
          />

          <StatCard
            label="Redactions"
            value={
              overview
              ?.redactions ??
              0
            }
          />
        </div>

        <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="flex items-start gap-3 rounded-2xl border border-cyan-300/[0.10] bg-cyan-300/[0.035] p-4">
            <ShieldCheck
              size={17}
              className="mt-0.5 shrink-0 text-cyan-200/60"
            />

            <p className="text-xs leading-5 text-white/40">
              This dataset is account-scoped with database row-level security. Training capture is off by default on every feedback form. Export never uploads data to a model provider by itself.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ExportButton
              label={
                exporting ===
                "sft"
                  ? "Exporting..."
                  : "Export SFT"
              }
              disabled={
                Boolean(
                  exporting
                ) ||
                total === 0
              }
              onClick={() => {
                void exportDataset(
                  "sft"
                );
              }}
            />

            <ExportButton
              label={
                exporting ===
                "preference"
                  ? "Exporting..."
                  : "Export preference"
              }
              disabled={
                Boolean(
                  exporting
                ) ||
                total === 0
              }
              onClick={() => {
                void exportDataset(
                  "preference"
                );
              }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-200/80">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map(
              (
                item
              ) => (
                <div
                  key={
                    item
                  }
                  className="h-40 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]"
                />
              )
            )}
          </div>

        ) : !overview ||
          overview
          .total_examples ===
          0 ? (
          <div className="flex min-h-[340px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.015] px-6 text-center">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035]">
              <FileJson
                size={19}
                className="text-white/45"
              />
            </div>

            <h2 className="text-sm font-medium text-white/75">
              No opted-in training examples yet
            </h2>

            <p className="mt-2 max-w-lg text-xs leading-5 text-white/35">
              Give an assistant or research report a thumbs-down, write the corrected answer, then explicitly enable private training capture before submitting the feedback.
            </p>
          </div>

        ) : (
          <div className="grid gap-3">
            {
              overview
              .samples
              .map(
                (
                  sample
                ) => (
                  <article
                    key={
                      sample.id
                    }
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white/45">
                            {
                              sample
                              .source_type ===
                              "research"
                                ? (
                                  <FlaskConical
                                    size={11}
                                  />
                                )
                                : (
                                  <MessageCircle
                                    size={11}
                                  />
                                )
                            }

                            {
                              sample
                              .source_type
                            }
                          </span>

                          <span className="text-[10px] text-white/25">
                            quality
                            {" "}
                            {
                              Math.round(
                                Number(
                                  sample
                                  .quality_score
                                )
                                * 100
                              )
                            }%
                          </span>

                          <span className="text-[10px] text-white/25">
                            redactions
                            {" "}
                            {
                              sample
                              .redaction_count
                            }
                          </span>

                          {
                            sample
                            .feedback_reason && (
                              <span className="text-[10px] text-white/25">
                                {
                                  sample
                                  .feedback_reason
                                  .replaceAll(
                                    "_",
                                    " "
                                  )
                                }
                              </span>
                            )
                          }
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div>
                            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
                              Prompt
                            </p>

                            <p className="whitespace-pre-wrap text-xs leading-5 text-white/55">
                              {
                                shortText(
                                  sample.prompt
                                )
                              }
                            </p>
                          </div>

                          <div>
                            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
                              Corrected target
                            </p>

                            <p className="whitespace-pre-wrap text-xs leading-5 text-white/70">
                              {
                                shortText(
                                  sample
                                  .target_response
                                )
                              }
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 text-[10px] text-white/20">
                          Added
                          {" "}
                          {
                            new Date(
                              sample
                              .created_at
                            )
                            .toLocaleDateString()
                          }
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label="Delete training example"
                        title="Delete training example"
                        disabled={
                          busyId ===
                          sample.id
                        }
                        onClick={() => {
                          void removeExample(
                            sample.id
                          );
                        }}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/25 transition hover:bg-red-400/[0.07] hover:text-red-200/80 disabled:opacity-25"
                      >
                        <Trash2
                          size={14}
                        />
                      </button>
                    </div>
                  </article>
                )
              )
            }
          </div>
        )}
      </div>
    </div>
  );
}


function StatCard({
  label,
  value,
}: {
  label: string;
  value:
    string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-white/80">
        {value}
      </p>
    </div>
  );
}


function ExportButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={
        disabled
      }
      onClick={
        onClick
      }
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3.5 text-xs font-medium text-white/65 transition hover:bg-white/[0.09] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
    >
      <Download
        size={14}
      />

      {label}
    </button>
  );
}
