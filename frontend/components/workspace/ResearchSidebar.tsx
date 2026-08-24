"use client";

import {
  FileText,
  MessageSquare,
  Plus,
  Search,
} from "lucide-react";

import { useResearch } from "@/components/context/ResearchContext";

export default function ResearchSidebar() {
  const {
    job,
    chats,
    activeChatId,
    historyLoading,
    selectChat,
    newChat,
  } = useResearch();

  return (
    <aside className="flex h-screen w-[280px] shrink-0 flex-col border-r border-white/10 bg-[#080B11]">
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="border-b border-white/10 p-4">
        <div className="mb-5 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10">
            <FileText
              size={18}
              className="text-cyan-400"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Deep Research
            </p>

            <p className="text-xs text-slate-500">
              AI research workspace
            </p>
          </div>
        </div>

        {/* ================================================== */}
        {/* NEW CHAT */}
        {/* ================================================== */}

        <button
          type="button"
          onClick={newChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/15 hover:text-cyan-200"
        >
          <Plus size={17} />

          New Research
        </button>

        {/* ================================================== */}
        {/* SEARCH */}
        {/* ================================================== */}

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
          <Search
            size={16}
            className="shrink-0 text-slate-600"
          />

          <input
            type="text"
            placeholder="Search research..."
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 outline-none"
          />
        </div>
      </div>

      {/* ================================================== */}
      {/* HISTORY */}
      {/* ================================================== */}

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-3 flex items-center justify-between px-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Recent Research
          </p>

          {historyLoading && (
            <div className="h-3 w-3 animate-spin rounded-full border border-slate-600 border-t-cyan-400" />
          )}
        </div>

        {chats.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <MessageSquare
              size={22}
              className="mx-auto mb-3 text-slate-700"
            />

            <p className="text-sm text-slate-600">
              No previous research
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-700">
              Start your first research
              session and it will appear
              here.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => {
              const isActive =
                chat.job_id ===
                activeChatId;

              const title =
                chat.query?.trim() ||
                chat.pdf_filename ||
                "Untitled Research";

              return (
                <button
                  key={chat.job_id}
                  type="button"
                  onClick={() =>
                    selectChat(
                      chat.job_id
                    )
                  }
                  className={`group w-full rounded-xl px-3 py-3 text-left transition ${
                    isActive
                      ? "border border-cyan-400/10 bg-cyan-400/10"
                      : "border border-transparent hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? "bg-cyan-400/10"
                          : "bg-white/[0.03]"
                      }`}
                    >
                      <MessageSquare
                        size={14}
                        className={
                          isActive
                            ? "text-cyan-400"
                            : "text-slate-600"
                        }
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm ${
                          isActive
                            ? "font-medium text-white"
                            : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      >
                        {title}
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`text-[10px] ${
                            chat.status ===
                            "completed"
                              ? "text-emerald-500"
                              : chat.status ===
                                  "failed"
                                ? "text-red-400"
                                : "text-cyan-500"
                          }`}
                        >
                          {chat.status}
                        </span>

                        {chat.pdf_filename && (
                          <span className="truncate text-[10px] text-slate-700">
                            PDF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* FOOTER */}
      {/* ================================================== */}

      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
          <p className="text-xs text-slate-600">
            DeepResearch AI
          </p>

          <p className="mt-1 text-[11px] text-slate-700">
            Your research sessions
          </p>
        </div>
      </div>
    </aside>
  );
}