"use client";

import {
  ChevronDown,
  ExternalLink,
  Globe,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useResearch,
} from "../context/ResearchContext";

import {
  Badge,
  IconButton,
  Surface,
} from "@/components/ui";

export default function SourcesPanel() {
  const {
    job,
  } =
    useResearch();

  const sources =
    job?.sources ??
    [];

  const [
    expanded,
    setExpanded,
  ] =
    useState(false);

  const visibleSources =
    expanded
      ? sources
      : sources.slice(
          0,
          5
        );

  return (
    <section className="w-full border-t border-white/[0.08]">
      {/* HEADER */}

      <div className="flex items-center justify-between py-5">
        <div className="flex items-center gap-3">
          <Globe
            size={17}
            className="text-white/35"
          />

          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white/75">
                Sources
              </p>

              <Badge variant="neutral">
                {sources.length}
              </Badge>
            </div>

            <p className="mt-0.5 text-xs text-white/25">
              Evidence consulted during research
            </p>
          </div>
        </div>
      </div>

      {/* SOURCES */}

      {sources.length ===
      0 ? (
        <div className="pb-7">
          <Surface
            variant="subtle"
            className="
              rounded-xl
              px-4
              py-4
            "
          >
            <p className="text-xs text-white/25">
              Sources will appear here after research begins.
            </p>
          </Surface>
        </div>
      ) : (
        <Surface
          variant="subtle"
          className="
            overflow-hidden
            rounded-xl
            p-0
          "
        >
          {visibleSources.map(
            (
              source,
              index
            ) => {
              const title =
                source.title ||
                source.domain ||
                source.url ||
                `Source ${
                  index +
                  1
                }`;

              const domain =
                source.domain ||
                getDomain(
                  source.url
                );

              return (
                <SourceRow
                  key={`${
                    source.url ??
                    title
                  }-${index}`}
                  index={
                    index
                  }
                  title={
                    title
                  }
                  domain={
                    domain
                  }
                  snippet={
                    source.snippet
                  }
                  url={
                    source.url
                  }
                />
              );
            }
          )}
        </Surface>
      )}

      {/* SHOW MORE */}

      {sources.length >
        5 && (
        <button
          type="button"
          onClick={() =>
            setExpanded(
              (
                value
              ) =>
                !value
            )
          }
          className="
            mt-3
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            py-3
            text-xs
            font-medium
            text-white/30
            transition-colors
            duration-150
            hover:bg-white/[0.03]
            hover:text-white/70
          "
        >
          {expanded
            ? "Show fewer sources"
            : `Show all ${sources.length} sources`}

          <ChevronDown
            size={14}
            className={`
              transition-transform
              duration-200
              ${
                expanded
                  ? "rotate-180"
                  : ""
              }
            `}
          />
        </button>
      )}

      <div className="h-5" />
    </section>
  );
}

// ============================================================
// SOURCE ROW
// ============================================================

function SourceRow({
  index,
  title,
  domain,
  snippet,
  url,
}: {
  index: number;

  title: string;

  domain?: string;

  snippet?: string;

  url?: string;
}) {
  return (
    <div
      className="
        group
        border-b
        border-white/[0.06]
        px-4
        py-4
        transition-colors
        duration-150
        last:border-b-0
        hover:bg-white/[0.025]
        sm:px-5
      "
    >
      <div className="flex items-start gap-3">
        {/* NUMBER */}

        <span
          className="
            mt-0.5
            w-5
            shrink-0
            text-[10px]
            tabular-nums
            text-white/20
          "
        >
          {index + 1}.
        </span>

        {/* CONTENT */}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                title={
                  title
                }
                className="
                  truncate
                  text-sm
                  font-medium
                  text-white/65
                  transition-colors
                  duration-150
                  group-hover:text-white/90
                "
              >
                {title}
              </p>

              {domain && (
                <p
                  title={
                    domain
                  }
                  className="
                    mt-1
                    truncate
                    text-[11px]
                    text-white/25
                  "
                >
                  {domain}
                </p>
              )}
            </div>

            {url && (
              <IconButton
                aschild={undefined}
              />
            )}
          </div>

          {snippet && (
            <p
              title={
                snippet
              }
              className="
                mt-2
                line-clamp-2
                text-xs
                leading-5
                text-white/35
              "
            >
              {snippet}
            </p>
          )}

          {url && (
            <div className="mt-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${title}`}
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-lg
                  px-2
                  py-1
                  text-[11px]
                  text-white/30
                  transition-colors
                  duration-150
                  hover:bg-white/[0.05]
                  hover:text-cyan-300
                "
              >
                Open source

                <ExternalLink
                  size={12}
                />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DOMAIN
// ============================================================

function getDomain(
  url?: string
) {
  if (!url) {
    return undefined;
  }

  try {
    return new URL(
      url
    )
      .hostname
      .replace(
        /^www\./,
        ""
      );
  } catch {
    return undefined;
  }
}