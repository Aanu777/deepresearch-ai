"use client";

import {
  ArrowUpRight,
  ExternalLink,
  Globe,
  Link2,
  ShieldCheck,
} from "lucide-react";

import { useResearch } from "../context/ResearchContext";

export default function SourcesPanel() {
  const { job } = useResearch();

  const sources = job?.sources ?? [];
  const isRunning = job?.status === "running";

  return (
    <section
      className="
        relative
        flex
        h-full
        min-h-[520px]
        w-full
        flex-col
        overflow-hidden
        rounded-[24px]
        border
        border-white/[0.07]
        bg-[#090F16]
        shadow-[0_24px_80px_rgba(0,0,0,0.28)]
      "
    >
      {/* ====================================================== */}
      {/* AMBIENT GLOW */}
      {/* ====================================================== */}

      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan-400/[0.035] blur-[90px]" />

      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-blue-500/[0.02] blur-[90px]" />

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="relative border-b border-white/[0.06] px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left */}

          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-cyan-400/[0.12]
                bg-cyan-400/[0.06]
              "
            >
              <Globe
                size={18}
                strokeWidth={1.8}
                className="text-cyan-400"
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-white">
                Sources
              </h2>

              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
                Research evidence
              </p>
            </div>
          </div>

          {/* Count */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
              rounded-full
              border
              border-white/[0.07]
              bg-white/[0.025]
              px-3
              py-2
            "
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isRunning
                  ? "animate-pulse bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.65)]"
                  : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]"
              }`}
            />

            <span className="text-[10px] font-medium text-white/45">
              {sources.length}
            </span>

            <span className="hidden text-[10px] text-white/20 sm:inline">
              {sources.length === 1 ? "source" : "sources"}
            </span>
          </div>
        </div>

        {/* Status */}

        <div className="mt-4 flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isRunning
                ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]"
                : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
            }`}
          />

          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
            {isRunning
              ? "Discovering evidence"
              : sources.length > 0
              ? "Verified references"
              : "Waiting for research"}
          </span>
        </div>
      </div>

      {/* ====================================================== */}
      {/* SOURCE CONTENT */}
      {/* ====================================================== */}

      <div className="relative min-h-0 flex-1 p-4">
        {sources.length === 0 ? (
          <EmptySourcesState isRunning={isRunning} />
        ) : (
          <div className="h-full space-y-2.5 overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.12)_transparent] [scrollbar-width:thin]">
            {sources.map((source, index) => {
              const title =
                source.title ||
                source.domain ||
                source.url ||
                `Source ${index + 1}`;

              const domain =
                source.domain || getDomain(source.url);

              return (
                <SourceCard
                  key={`${source.url ?? title}-${index}`}
                  index={index}
                  title={title}
                  domain={domain}
                  snippet={source.snippet}
                  url={source.url}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ====================================================== */}
      {/* FOOTER */}
      {/* ====================================================== */}

      <div className="relative border-t border-white/[0.06] px-5 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck
              size={12}
              className="shrink-0 text-emerald-400/70"
            />

            <span className="truncate text-[10px] text-white/25">
              Sources are used as research evidence
            </span>
          </div>

          {sources.length > 0 && (
            <span className="shrink-0 text-[10px] font-medium text-cyan-400/45">
              {sources.length} verified
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/* SOURCE CARD */
/* ============================================================ */

function SourceCard({
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
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-[18px]
        border
        border-white/[0.065]
        bg-[#0D141C]
        px-4
        py-3.5
        transition-all
        duration-300
        hover:border-cyan-400/[0.16]
        hover:bg-[#101923]
        hover:shadow-[0_12px_35px_rgba(0,0,0,0.22)]
      "
    >
      {/* Hover glow */}

      <div
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-24
          w-24
          rounded-full
          bg-cyan-400/0
          blur-3xl
          transition-all
          duration-500
          group-hover:bg-cyan-400/[0.06]
        "
      />

      <div className="relative">
        {/* ================================================== */}
        {/* TOP ROW */}
        {/* ================================================== */}

        <div className="flex items-start gap-3">
          {/* Source icon */}

          <div
            className="
              relative
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-emerald-400/[0.10]
              bg-emerald-400/[0.055]
            "
          >
            <ShieldCheck
              size={16}
              strokeWidth={1.8}
              className="text-emerald-400/90"
            />

            {/* Verified dot */}

            <span
              className="
                absolute
                -bottom-0.5
                -right-0.5
                h-2
                w-2
                rounded-full
                border
                border-[#0D141C]
                bg-emerald-400
                shadow-[0_0_8px_rgba(52,211,153,0.65)]
              "
            />
          </div>

          {/* Main information */}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3
                  title={title}
                  className="
                    truncate
                    text-[12px]
                    font-semibold
                    leading-5
                    text-white/80
                    transition-colors
                    duration-200
                    group-hover:text-white
                  "
                >
                  {title}
                </h3>

                {domain && (
                  <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                    <Link2
                      size={9}
                      className="shrink-0 text-white/20"
                    />

                    <p
                      title={domain}
                      className="
                        truncate
                        text-[10px]
                        leading-4
                        text-white/25
                        transition-colors
                        duration-200
                        group-hover:text-white/35
                      "
                    >
                      {domain}
                    </p>
                  </div>
                )}
              </div>

              {/* Number */}

              <span className="shrink-0 pt-0.5 text-[9px] font-medium tabular-nums text-white/15">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Open */}

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${title}`}
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-transparent
                text-white/20
                transition-all
                duration-200
                hover:border-white/[0.07]
                hover:bg-white/[0.05]
                hover:text-cyan-400
              "
            >
              <ArrowUpRight
                size={13}
                className="
                  transition-transform
                  duration-200
                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5
                "
              />
            </a>
          )}
        </div>

        {/* ================================================== */}
        {/* SNIPPET */}
        {/* ================================================== */}

        {snippet && (
          <div className="mt-3 border-t border-white/[0.045] pt-3">
            <p
              title={snippet}
              className="
                line-clamp-2
                text-[10px]
                leading-[1.7]
                text-white/30
                transition-colors
                duration-200
                group-hover:text-white/40
              "
            >
              {snippet}
            </p>
          </div>
        )}

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.6)]" />

            <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-emerald-400/55">
              Reference
            </span>
          </div>

          {url && (
            <div className="flex items-center gap-1 text-[9px] text-white/15 transition-colors duration-200 group-hover:text-white/30">
              <ExternalLink size={9} />

              <span>Open source</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/* ============================================================ */
/* EMPTY STATE */
/* ============================================================ */

function EmptySourcesState({
  isRunning,
}: {
  isRunning: boolean;
}) {
  return (
    <div
      className="
        relative
        flex
        h-full
        min-h-[380px]
        flex-col
        items-center
        justify-center
        overflow-hidden
        rounded-[20px]
        border
        border-white/[0.05]
        bg-white/[0.012]
        px-6
        text-center
      "
    >
      {/* Ambient glow */}

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/[0.035] blur-3xl" />

      <div className="relative">
        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            border
            border-white/[0.07]
            bg-white/[0.025]
          "
        >
          <Globe
            size={23}
            strokeWidth={1.5}
            className={`${
              isRunning
                ? "animate-pulse text-cyan-400/60"
                : "text-white/20"
            }`}
          />
        </div>

        <p className="mt-5 text-xs font-semibold text-white/55">
          {isRunning
            ? "Discovering sources"
            : "No sources yet"}
        </p>

        <p className="mx-auto mt-2 max-w-[220px] text-[10px] leading-5 text-white/25">
          {isRunning
            ? "DeepResearch is searching for relevant evidence. Sources will appear here as they are discovered."
            : "Start a research task to discover relevant sources and supporting evidence."}
        </p>

        {isRunning && (
          <div className="mx-auto mt-5 flex items-center justify-center gap-1.5">
            <span
              className="
                h-1
                w-1
                animate-pulse
                rounded-full
                bg-cyan-400
              "
            />

            <span
              className="
                h-1
                w-1
                animate-pulse
                rounded-full
                bg-cyan-400
                [animation-delay:150ms]
              "
            />

            <span
              className="
                h-1
                w-1
                animate-pulse
                rounded-full
                bg-cyan-400
                [animation-delay:300ms]
              "
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================ */
/* DOMAIN HELPER */
/* ============================================================ */

function getDomain(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    return new URL(url)
      .hostname
      .replace(/^www\./, "");
  } catch {
    return undefined;
  }
}