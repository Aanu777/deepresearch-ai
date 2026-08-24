"use client";

import {
  useRef,
  useState,
} from "react";

import {
  ArrowUp,
  Loader2,
  Paperclip,
  Sparkles,
  X,
  FileText,
} from "lucide-react";

import {
  useResearch,
} from "@/components/context/ResearchContext";

import TemplatePicker from "./TemplatePicker";

export default function PromptBox() {
  const [prompt, setPrompt] =
    useState("");

  const [pdfFile, setPdfFile] =
    useState<File | null>(null);

  const [templatesOpen, setTemplatesOpen] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const {
    createJob,
    loading,
  } = useResearch();

  // ============================================================
  // PDF SELECTION
  // ============================================================

  function handleAttachPDF() {
    if (loading) {
      return;
    }

    fileInputRef.current?.click();
  }

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    // ----------------------------------------------------------
    // Only allow PDF files.
    // ----------------------------------------------------------

    if (
      file.type !==
        "application/pdf" &&
      !file.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      alert(
        "Please select a PDF file."
      );

      e.target.value = "";

      return;
    }

    setPdfFile(file);

    // ----------------------------------------------------------
    // Allow selecting the same file again later.
    // ----------------------------------------------------------

    e.target.value = "";
  }

  function removePDF() {
    setPdfFile(null);
  }

  // ============================================================
  // TEMPLATE SELECTION
  // ============================================================

  function openTemplates() {
    if (loading) {
      return;
    }

    setTemplatesOpen(true);
  }

  function closeTemplates() {
    setTemplatesOpen(false);
  }

  function handleTemplateSelect(
    templatePrompt: string
  ) {
    setPrompt(templatePrompt);

    setTemplatesOpen(false);
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  async function handleSubmit() {
    const trimmed =
      prompt.trim();

    // ----------------------------------------------------------
    // No PDF + empty prompt -> reject
    // ----------------------------------------------------------

    if (
      !pdfFile &&
      trimmed.length === 0
    ) {
      alert(
        "Please enter a research question or attach a PDF."
      );

      return;
    }

    // ----------------------------------------------------------
    // PDF + empty prompt is allowed.
    // PDF + prompt is allowed.
    // Short prompts are intentionally allowed.
    // ----------------------------------------------------------

    try {
      await createJob(
        trimmed,
        pdfFile ?? undefined
      );
    } catch (err) {
      console.error(err);

      alert(
        "Failed to start research."
      );
    }
  }

  // ============================================================
  // KEYBOARD
  // ============================================================

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      e.key === "Enter" &&
      e.ctrlKey
    ) {
      e.preventDefault();

      handleSubmit();
    }
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <>
      <section>
        <div className="mx-auto max-w-5xl">
          <div
            className="
              overflow-hidden
              rounded-[32px]
              border
              border-cyan-500/30
              bg-[#0B1118]
              shadow-[0_20px_80px_rgba(0,0,0,.45)]
              transition-all
              duration-300
              focus-within:border-cyan-400
            "
          >
            {/* ================================================== */}
            {/* PROMPT */}
            {/* ================================================== */}

            <textarea
              rows={8}
              value={prompt}
              onChange={(e) =>
                setPrompt(
                  e.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              disabled={loading}
              placeholder="Ask anything... Research a topic, compare technologies, analyze a company, summarize scientific papers..."
              className="
                min-h-[230px]
                w-full
                resize-none
                bg-transparent
                px-8
                pt-8
                text-lg
                text-white
                outline-none
                placeholder:text-slate-500
                disabled:cursor-not-allowed
                disabled:opacity-70
              "
            />

            {/* ================================================== */}
            {/* ATTACHED PDF */}
            {/* ================================================== */}

            {pdfFile && (
              <div
                className="
                  mx-6
                  mb-4
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  border-cyan-400/20
                  bg-cyan-400/5
                  px-4
                  py-3
                "
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-cyan-400/10
                    "
                  >
                    <FileText
                      size={18}
                      className="text-cyan-400"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {pdfFile.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {(
                        pdfFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    removePDF
                  }
                  disabled={loading}
                  className="
                    ml-3
                    rounded-lg
                    p-2
                    text-slate-500
                    transition
                    hover:bg-white/5
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                  aria-label="Remove PDF"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {/* ================================================== */}
            {/* CONTROLS */}
            {/* ================================================== */}

            <div
              className="
                flex
                flex-col
                gap-4
                border-t
                border-white/10
                px-6
                py-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="flex items-center gap-3">
                {/* Hidden file input */}

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={
                    handleFileChange
                  }
                  className="hidden"
                />

                {/* ================================================= */}
                {/* ATTACH PDF */}
                {/* ================================================= */}

                <button
                  type="button"
                  onClick={
                    handleAttachPDF
                  }
                  disabled={
                    loading
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-white/10
                    px-4
                    py-2
                    text-sm
                    text-slate-300
                    transition
                    hover:border-cyan-400/40
                    hover:bg-white/5
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <Paperclip
                    size={16}
                  />

                  {pdfFile
                    ? "Change PDF"
                    : "Attach PDF"}
                </button>

                {/* ================================================= */}
                {/* TEMPLATES */}
                {/* ================================================= */}

                <button
                  type="button"
                  onClick={
                    openTemplates
                  }
                  disabled={
                    loading
                  }
                  className="
                    group
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-white/10
                    px-4
                    py-2
                    text-sm
                    text-slate-300
                    transition
                    hover:border-cyan-400/40
                    hover:bg-white/5
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <Sparkles
                    size={16}
                    className="
                      text-slate-500
                      transition
                      group-hover:text-cyan-400
                    "
                  />

                  Templates
                </button>
              </div>

              {/* ================================================= */}
              {/* SUBMIT */}
              {/* ================================================= */}

              <div className="flex items-center justify-between gap-5 sm:justify-end">
                <span className="text-xs text-slate-600 sm:text-sm">
                  Ctrl + Enter
                </span>

                <button
                  type="button"
                  onClick={
                    handleSubmit
                  }
                  disabled={
                    loading
                  }
                  className="
                    flex
                    h-12
                    min-w-[180px]
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-cyan-400
                    px-6
                    font-semibold
                    text-black
                    transition-all
                    duration-300
                    hover:scale-[1.02]
                    hover:bg-cyan-300
                    hover:shadow-[0_0_35px_rgba(34,211,238,0.18)]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    disabled:hover:scale-100
                  "
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Researching...
                    </>
                  ) : (
                    <>
                      Deep Research

                      <ArrowUp
                        size={18}
                      />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* TEMPLATE PICKER */}
      {/* ======================================================== */}

      <TemplatePicker
        open={
          templatesOpen
        }
        onClose={
          closeTemplates
        }
        onSelect={
          handleTemplateSelect
        }
      />
    </>
  );
}