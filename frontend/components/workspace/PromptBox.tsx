"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowUp,
  FileText,
  Loader2,
  Paperclip,
  Sparkles,
  Square,
  X,
} from "lucide-react";

import {
  useResearch,
} from "@/components/context/ResearchContext";

import {
  useRouter,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/client";

import TemplatePicker from "./TemplatePicker";

export default function PromptBox() {
  const router =
    useRouter();

  const supabase =
    createClient();

  const [
    prompt,
    setPrompt,
  ] = useState("");

  const [
    pdfFile,
    setPdfFile,
  ] = useState<File | null>(
    null
  );

  const [
    templatesOpen,
    setTemplatesOpen,
  ] = useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  const {
    job,
    createJob,
    cancelJob,
    loading,
    cancelling,
  } = useResearch();

  // ==========================================================
  // JOB STATE
  // ==========================================================

  const status =
    (
      job?.status ||
      ""
    ).toLowerCase();

  const researchRunning =
    status === "running" ||
    status === "queued";

  // ==========================================================
  // AUTO RESIZE
  // ==========================================================

  useEffect(() => {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height =
      "auto";

    textarea.style.height =
      `${Math.min(
        Math.max(
          textarea.scrollHeight,
          80
        ),
        220
      )}px`;
  }, [prompt]);

  // ==========================================================
  // PDF
  // ==========================================================

  function handleAttachPDF() {
    if (
      loading ||
      researchRunning
    ) {
      return;
    }

    fileInputRef.current?.click();
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

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

      event.target.value = "";

      return;
    }

    setPdfFile(file);

    event.target.value = "";
  }

  function removePDF() {
    if (
      loading ||
      researchRunning
    ) {
      return;
    }

    setPdfFile(null);
  }

  // ==========================================================
  // TEMPLATE
  // ==========================================================

  function handleTemplateSelect(
    templatePrompt: string
  ) {
    setPrompt(
      templatePrompt
    );

    setTemplatesOpen(false);

    requestAnimationFrame(
      () => {
        textareaRef.current?.focus();
      }
    );
  }

  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function handleSubmit() {
    const trimmed =
      prompt.trim();

    if (
      loading ||
      researchRunning ||
      (
        !pdfFile &&
        !trimmed
      )
    ) {
      return;
    }

    const {
      data: {
        session,
      },
    } =
      await supabase.auth.getSession();

    if (!session) {
      router.push(
        "/login"
      );

      return;
    }

    try {
      await createJob(
        trimmed,
        pdfFile
      );

      setPrompt("");
      setPdfFile(null);

    } catch (error) {
      console.error(
        "Failed to start research:",
        error
      );

      alert(
        "Failed to start research."
      );
    }
  }

  // ==========================================================
  // CANCEL
  // ==========================================================

  async function handleCancel() {
    if (
      !researchRunning ||
      cancelling
    ) {
      return;
    }

    try {
      await cancelJob();

    } catch (error) {
      console.error(
        "Failed to cancel research:",
        error
      );

      alert(
        "Failed to cancel research."
      );
    }
  }

  // ==========================================================
  // KEYBOARD
  // ==========================================================

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key ===
        "Enter" &&
      event.ctrlKey
    ) {
      event.preventDefault();

      void handleSubmit();
    }
  }

  // ==========================================================
  // BUTTON STATE
  // ==========================================================

  const canSubmit =
    !loading &&
    !researchRunning &&
    (
      prompt.trim().length >
        0 ||
      Boolean(pdfFile)
    );

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <div
        className="
          overflow-hidden

          rounded-[26px]

          border
          border-white/[0.09]

          bg-[#191919]

          shadow-[0_10px_35px_rgba(0,0,0,0.20)]

          transition-colors

          focus-within:border-white/[0.15]
        "
      >
        {/* ====================================================
            TEXTAREA
        ==================================================== */}

        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(
            event
          ) =>
            setPrompt(
              event.target.value
            )
          }
          onKeyDown={
            handleKeyDown
          }
          disabled={
            loading ||
            researchRunning
          }
          rows={2}
          placeholder={
            researchRunning
              ? "Research is currently running..."
              : "Ask a research question..."
          }
          className="
            block

            min-h-[80px]
            w-full

            resize-none
            overflow-y-auto

            appearance-none

            !border-0
            !border-transparent
            !border-b-0

            bg-transparent

            px-5
            pb-3
            pt-4

            text-[15px]
            leading-6
            text-white

            !outline-none
            outline-none

            !ring-0
            ring-0

            !shadow-none
            shadow-none

            placeholder:text-white/30

            focus:!border-0
            focus:!border-transparent
            focus:!border-b-0

            focus:!outline-none
            focus:!ring-0
            focus:!shadow-none

            focus-visible:!border-0
            focus-visible:!border-transparent
            focus-visible:!border-b-0

            focus-visible:!outline-none
            focus-visible:!ring-0
            focus-visible:!shadow-none

            disabled:cursor-not-allowed
            disabled:opacity-60
          "
          style={{
            maxHeight:
              "220px",

            border:
              "none",

            borderBottom:
              "none",

            outline:
              "none",

            boxShadow:
              "none",

            WebkitAppearance:
              "none",

            appearance:
              "none",
          }}
        />

        {/* ====================================================
            PDF
        ==================================================== */}

        {pdfFile && (
          <div
            className="
              mx-3
              mb-2

              flex
              max-w-md
              items-center
              gap-3

              rounded-xl

              border
              border-white/[0.08]

              bg-white/[0.035]

              px-3
              py-2.5
            "
          >
            <div
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center

                rounded-lg

                bg-white/[0.05]
              "
            >
              <FileText
                size={15}
                className="
                  text-white/50
                "
              />
            </div>

            <div
              className="
                min-w-0
                flex-1
              "
            >
              <p
                className="
                  truncate

                  text-xs
                  font-medium
                  text-white/70
                "
              >
                {pdfFile.name}
              </p>

              <p
                className="
                  mt-0.5

                  text-[10px]
                  text-white/25
                "
              >
                {(
                  pdfFile.size /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                MB
              </p>
            </div>

            <button
              type="button"
              onClick={
                removePDF
              }
              disabled={
                loading ||
                researchRunning
              }
              aria-label="Remove PDF"
              className="
                flex
                h-7
                w-7
                items-center
                justify-center

                rounded-lg

                border-0
                bg-transparent

                text-white/30

                !outline-none

                transition-colors

                hover:bg-white/[0.06]
                hover:text-white/70

                focus:!outline-none
                focus-visible:!outline-none
                focus-visible:!ring-0

                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <X
                size={14}
              />
            </button>
          </div>
        )}

        {/* ====================================================
            CONTROLS
        ==================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-3

            px-3
            pb-3
          "
        >
          {/* ==================================================
              LEFT
          ================================================== */}

          <div
            className="
              flex
              items-center
              gap-1
            "
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={
                handleFileChange
              }
              className="hidden"
            />

            <button
              type="button"
              onClick={
                handleAttachPDF
              }
              disabled={
                loading ||
                researchRunning
              }
              title="Attach PDF"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center

                rounded-full

                border-0
                bg-transparent

                text-white/50

                !outline-none

                transition-colors

                hover:bg-white/[0.07]
                hover:text-white

                focus:!outline-none
                focus-visible:!outline-none
                focus-visible:!ring-0

                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              <Paperclip
                size={18}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                setTemplatesOpen(
                  true
                )
              }
              disabled={
                loading ||
                researchRunning
              }
              title="Research templates"
              className="
                flex
                h-9
                items-center
                gap-2

                rounded-full

                border-0
                bg-transparent

                px-3

                text-xs
                font-medium
                text-white/45

                !outline-none

                transition-colors

                hover:bg-white/[0.07]
                hover:text-white/80

                focus:!outline-none
                focus-visible:!outline-none
                focus-visible:!ring-0

                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              <Sparkles
                size={16}
              />

              <span
                className="
                  hidden
                  sm:inline
                "
              >
                Templates
              </span>
            </button>
          </div>

          {/* ==================================================
              RIGHT
          ================================================== */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            {researchRunning ? (
              <>
                <div
                  className="
                    hidden
                    items-center
                    gap-2

                    text-[11px]
                    text-white/30

                    sm:flex
                  "
                >
                  <Loader2
                    size={13}
                    className="
                      animate-spin
                    "
                  />

                  <span>
                    Researching
                  </span>
                </div>

                <button
                  type="button"
                  onClick={
                    handleCancel
                  }
                  disabled={
                    cancelling
                  }
                  title="Cancel research"
                  className="
                    flex
                    h-9
                    items-center
                    gap-2

                    rounded-full

                    border
                    border-white/[0.10]

                    bg-transparent

                    px-3.5

                    text-xs
                    font-medium
                    text-white/55

                    !outline-none

                    transition-colors

                    hover:border-red-400/20
                    hover:bg-red-400/[0.05]
                    hover:text-red-300

                    focus:!outline-none
                    focus-visible:!outline-none
                    focus-visible:!ring-0

                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  {cancelling ? (
                    <Loader2
                      size={13}
                      className="
                        animate-spin
                      "
                    />
                  ) : (
                    <Square
                      size={11}
                      fill="currentColor"
                    />
                  )}

                  <span>
                    {cancelling
                      ? "Cancelling"
                      : "Cancel"}
                  </span>
                </button>
              </>
            ) : (
              <>
                <span
                  className="
                    hidden

                    text-[10px]
                    text-white/20

                    sm:inline
                  "
                >
                  Ctrl + Enter
                </span>

                <button
                  type="button"
                  onClick={() => {
                    void handleSubmit();
                  }}
                  disabled={
                    !canSubmit
                  }
                  aria-label="Start research"
                  title="Start research"
                  className={`
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center

                    rounded-full

                    border-0

                    !outline-none

                    transition-colors

                    focus:!outline-none
                    focus-visible:!outline-none
                    focus-visible:!ring-0

                    ${
                      canSubmit
                        ? "bg-white text-black hover:bg-white/85"
                        : "bg-white/[0.08] text-white/20"
                    }

                    disabled:cursor-not-allowed
                  `}
                >
                  {loading ? (
                    <Loader2
                      size={17}
                      className="
                        animate-spin
                      "
                    />
                  ) : (
                    <ArrowUp
                      size={18}
                      strokeWidth={2.4}
                    />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================
          STATUS TEXT
      ====================================================== */}

      {researchRunning && (
        <div
          className="
            mt-2

            flex
            items-center
            justify-between

            px-1

            text-[10px]
            text-white/25
          "
        >
          <span>
            {job?.current_step
              ? `Current stage: ${job.current_step}`
              : "Research in progress"}
          </span>

          {typeof job?.progress ===
            "number" && (
            <span
              className="
                tabular-nums
              "
            >
              {Math.round(
                job.progress
              )}
              %
            </span>
          )}
        </div>
      )}

      {/* ======================================================
          TEMPLATE PICKER
      ====================================================== */}

      <TemplatePicker
        open={
          templatesOpen
        }
        onClose={() =>
          setTemplatesOpen(
            false
          )
        }
        onSelect={
          handleTemplateSelect
        }
      />
    </>
  );
}