"use client";

import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  FileSearch,
  FlaskConical,
  Globe2,
  Lightbulb,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type ResearchTemplate = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: React.ElementType;
  category: string;
};

const TEMPLATES: ResearchTemplate[] = [
  {
    id: "deep-research",
    title: "Deep Research",
    description:
      "Investigate a topic comprehensively with multiple perspectives and evidence.",
    prompt:
      "Conduct a comprehensive deep research investigation into [TOPIC]. Cover the key concepts, major developments, important evidence, competing perspectives, and practical implications. Identify the most important findings and support them with reliable sources.",
    icon: Sparkles,
    category: "General",
  },
  {
    id: "market-research",
    title: "Market Research",
    description:
      "Understand markets, competitors, trends, customers, and opportunities.",
    prompt:
      "Conduct detailed market research on [MARKET OR INDUSTRY]. Analyze the current market landscape, major competitors, emerging trends, customer needs, pricing, opportunities, risks, and future outlook. Support important claims with reliable sources.",
    icon: BarChart3,
    category: "Business",
  },
  {
    id: "company-analysis",
    title: "Company Analysis",
    description:
      "Build a structured analysis of a company and its competitive position.",
    prompt:
      "Analyze [COMPANY] in depth. Examine its products or services, business model, market position, competitors, recent developments, strengths, weaknesses, opportunities, risks, and future prospects. Use reliable and recent sources.",
    icon: BriefcaseBusiness,
    category: "Business",
  },
  {
    id: "technology",
    title: "Technology Research",
    description:
      "Explore technologies, architectures, tools, and technical trends.",
    prompt:
      "Research [TECHNOLOGY OR TECHNICAL TOPIC] in depth. Explain how it works, its architecture and key components, major implementations, advantages, limitations, alternatives, current developments, and likely future direction. Use authoritative technical sources where possible.",
    icon: FlaskConical,
    category: "Technology",
  },
  {
    id: "compare",
    title: "Compare & Decide",
    description:
      "Compare multiple options and determine which is best for your needs.",
    prompt:
      "Compare [OPTION A] and [OPTION B]. Evaluate their features, performance, cost, advantages, disadvantages, limitations, use cases, and long-term considerations. Use current evidence and conclude with a clear recommendation based on the available evidence.",
    icon: Search,
    category: "Decision",
  },
  {
    id: "academic",
    title: "Academic Research",
    description:
      "Explore a topic using evidence, research findings, and academic sources.",
    prompt:
      "Conduct an academic-style research investigation into [TOPIC]. Identify the major research findings, important studies, competing viewpoints, areas of agreement and disagreement, limitations in the evidence, and unresolved questions. Prioritize credible academic and primary sources.",
    icon: FileSearch,
    category: "Academic",
  },
  {
    id: "current-events",
    title: "Current Events",
    description:
      "Investigate a recent event and understand what happened and why.",
    prompt:
      "Investigate the recent developments surrounding [EVENT OR TOPIC]. Establish what happened, the relevant timeline, key people or organizations involved, contributing factors, current status, competing accounts, and likely implications. Prioritize recent and reliable sources.",
    icon: Globe2,
    category: "Current",
  },
  {
    id: "problem-solving",
    title: "Problem Investigation",
    description:
      "Break down a difficult problem and investigate possible solutions.",
    prompt:
      "Investigate the problem of [PROBLEM]. Identify its root causes, existing approaches, evidence about what works and what does not, major constraints, possible solutions, trade-offs, and practical recommendations. Support the conclusions with reliable evidence.",
    icon: Lightbulb,
    category: "Analysis",
  },
];

type TemplatePickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (template: ResearchTemplate) => void;
};

export default function TemplatePicker({
  open,
  onClose,
  onSelect,
}: TemplatePickerProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(TEMPLATES.map((template) => template.category))
      ),
    ],
    []
  );

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return TEMPLATES.filter((template) => {
      const matchesCategory =
        category === "All" ||
        template.category === category;

      const matchesSearch =
        !normalizedSearch ||
        template.title.toLowerCase().includes(normalizedSearch) ||
        template.description
          .toLowerCase()
          .includes(normalizedSearch) ||
        template.category
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setCategory("All");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  function handleSelect(template: ResearchTemplate) {
    onSelect(template);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Research templates"
    >
      {/* Backdrop */}

      <button
        type="button"
        aria-label="Close templates"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}

      <div
        className="
          relative z-10 flex w-full max-w-4xl
          max-h-[min(720px,calc(100vh-32px))]
          flex-col overflow-hidden
          rounded-[28px]
          border border-white/[0.09]
          bg-[#090E14]
          shadow-[0_40px_140px_rgba(0,0,0,0.65)]
        "
      >
        {/* Header */}

        <div className="border-b border-white/[0.06] px-5 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/[0.07]">
                  <Sparkles
                    size={17}
                    className="text-cyan-400"
                  />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Research templates
                  </h2>

                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Start with a proven research workflow.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                flex h-8 w-8 shrink-0 items-center
                justify-center rounded-lg
                text-slate-600
                transition
                hover:bg-white/[0.05]
                hover:text-white
              "
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search */}

          <div className="relative mt-5">
            <Search
              size={15}
              className="
                pointer-events-none absolute
                left-3.5 top-1/2
                -translate-y-1/2
                text-slate-600
              "
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search templates..."
              autoFocus
              className="
                h-11 w-full rounded-xl
                border border-white/[0.07]
                bg-white/[0.025]
                pl-10 pr-4
                text-xs text-white
                outline-none
                placeholder:text-slate-700
                transition
                focus:border-cyan-400/25
                focus:bg-white/[0.035]
              "
            />
          </div>

          {/* Categories */}

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => {
              const active = category === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setCategory(item)
                  }
                  className={`
                    shrink-0 rounded-lg
                    px-3 py-1.5
                    text-[10px] font-medium
                    transition
                    ${
                      active
                        ? "bg-cyan-400/10 text-cyan-300"
                        : "text-slate-600 hover:bg-white/[0.04] hover:text-slate-300"
                    }
                  `}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Template list */}

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {filteredTemplates.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredTemplates.map(
                (template) => {
                  const Icon = template.icon;

                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() =>
                        handleSelect(template)
                      }
                      className="
                        group relative
                        rounded-2xl
                        border border-white/[0.06]
                        bg-white/[0.018]
                        p-4
                        text-left
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:border-cyan-400/20
                        hover:bg-cyan-400/[0.025]
                        hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]
                      "
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="
                            flex h-9 w-9 shrink-0
                            items-center justify-center
                            rounded-xl
                            border border-cyan-400/[0.08]
                            bg-cyan-400/[0.045]
                          "
                        >
                          <Icon
                            size={16}
                            className="text-cyan-400"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-xs font-semibold text-slate-200 transition group-hover:text-white">
                              {template.title}
                            </h3>

                            <ChevronRight
                              size={14}
                              className="
                                shrink-0
                                text-slate-700
                                transition-all
                                group-hover:translate-x-0.5
                                group-hover:text-cyan-400
                              "
                            />
                          </div>

                          <p className="mt-1.5 text-[10px] leading-5 text-slate-600">
                            {template.description}
                          </p>

                          <div className="mt-3 flex items-center justify-between">
                            <span className="rounded-md bg-white/[0.035] px-2 py-1 text-[9px] text-slate-600">
                              {template.category}
                            </span>

                            <span className="text-[9px] font-medium text-cyan-400/0 transition group-hover:text-cyan-400/70">
                              Use template
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.03]">
                <Search
                  size={18}
                  className="text-slate-700"
                />
              </div>

              <p className="mt-4 text-sm font-medium text-slate-400">
                No templates found
              </p>

              <p className="mt-1 max-w-xs text-xs leading-5 text-slate-700">
                Try another search or choose a different
                category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                className="mt-4 text-xs text-cyan-400 hover:text-cyan-300"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}

        <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.012] px-5 py-3.5 sm:px-6">
          <p className="text-[10px] text-slate-700">
            Templates are starting points. You can edit the
            research question before running it.
          </p>

          <div className="hidden items-center gap-1.5 text-[10px] text-slate-700 sm:flex">
            <span>ESC</span>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}