"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import {
  ArrowUp,
  File,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mic,
  Paperclip,
  Square,
  X,
} from "lucide-react";

import {
  useConversation,
  type ConversationActivity,
} from "@/components/context/ConversationContext";


/* ============================================================
   TYPES
   ============================================================ */

type ComposerMode =
  | "chat"
  | "image";


type PendingAttachment = {
  id: string;

  file: File;

  kind:
    | "image"
    | "file";

  previewUrl:
    string | null;
};


/* ============================================================
   LIMITS
   ============================================================ */

const MAX_ATTACHMENTS =
  4;

const MAX_FILE_SIZE =
  15 *
  1024 *
  1024;

const MIN_TEXTAREA_HEIGHT =
  24;

const MAX_TEXTAREA_HEIGHT =
  160;


/* ============================================================
   COMPONENT
   ============================================================ */

export default function ConversationComposer() {

  /* ==========================================================
     LOCAL STATE
     ========================================================== */

  const [
    message,
    setMessage,
  ] =
    useState(
      ""
    );


  const [
    mode,
    setMode,
  ] =
    useState<ComposerMode>(
      "chat"
    );


  const [
    attachments,
    setAttachments,
  ] =
    useState<
      PendingAttachment[]
    >(
      []
    );


  const [
    recording,
    setRecording,
  ] =
    useState(
      false
    );


  /* ==========================================================
     REFS
     ========================================================== */

  const textareaRef =
    useRef<
      HTMLTextAreaElement | null
    >(
      null
    );


  const fileInputRef =
    useRef<
      HTMLInputElement | null
    >(
      null
    );


  const mediaRecorderRef =
    useRef<
      MediaRecorder | null
    >(
      null
    );


  const mediaStreamRef =
    useRef<
      MediaStream | null
    >(
      null
    );


  const audioChunksRef =
    useRef<
      Blob[]
    >(
      []
    );


  const cancelRecordingRef =
    useRef(
      false
    );


  const attachmentsRef =
    useRef<
      PendingAttachment[]
    >(
      []
    );


  /* ==========================================================
     CONTEXT
     ========================================================== */

  const {
    sendMessage,

    sendMessageWithAttachments,

    transcribeAudio,

    generateImage,

    sending,

    activity,

    error,

    selectedImageForEdit,

    clearImageEdit,

    setActivity,

    setConversationError,

    clearConversationError,
  } =
    useConversation();


  /* ==========================================================
     KEEP ATTACHMENT REF UPDATED
     ========================================================== */

  useEffect(
    () => {

      attachmentsRef.current =
        attachments;

    },
    [
      attachments,
    ]
  );


  /* ==========================================================
     IMAGE SELECTED FROM CHAT
     ========================================================== */

  useEffect(
    () => {

      if (
        !selectedImageForEdit
      ) {
        return;
      }


      setMode(
        "image"
      );


      clearAttachments();


      requestAnimationFrame(
        () => {

          textareaRef
            .current
            ?.focus();

        }
      );

    },
    [
      selectedImageForEdit
        ?.message_id,
    ]
  );


  /* ==========================================================
     CLEANUP
     ========================================================== */

  useEffect(
    () => {

      return () => {

        try {

          if (
            mediaRecorderRef
              .current
              ?.state ===
            "recording"
          ) {

            cancelRecordingRef.current =
              true;


            mediaRecorderRef
              .current
              .stop();
          }

        } catch {
          // Ignore cleanup errors.
        }


        stopMediaStream();


        attachmentsRef
          .current
          .forEach(
            (
              attachment
            ) => {

              if (
                attachment
                  .previewUrl
              ) {

                URL.revokeObjectURL(
                  attachment
                    .previewUrl
                );
              }
            }
          );
      };
    },
    []
  );


  /* ==========================================================
     TEXTAREA AUTO-GROW
     ========================================================== */

  useEffect(
    () => {

      resizeComposerTextarea();

    },
    [
      message,
    ]
  );


  /* ==========================================================
     DERIVED
     ========================================================== */

  const trimmed =
    message.trim();


  const imageMode =
    mode ===
    "image";


  const editingImage =
    imageMode &&
    Boolean(
      selectedImageForEdit
    );


  const transcribing =
    activity ===
    "transcribing";


  const generatingImage =
    activity ===
    "generating_image";


  const composerBusy =
    sending ||
    activity ===
      "generating" ||
    activity ===
      "retrying" ||
    transcribing ||
    generatingImage;


  const hasChatContent =
    Boolean(
      trimmed
    ) ||
    attachments.length >
      0;


  const canSubmit =
    !composerBusy &&
    !recording &&
    (
      imageMode
        ? Boolean(
            trimmed
          )
        : hasChatContent
    );


  /* ==========================================================
     TEXTAREA RESIZE
     ========================================================== */

  function resizeComposerTextarea() {

    const textarea =
      textareaRef.current;


    if (
      !textarea
    ) {
      return;
    }


    textarea.style.height =
      "0px";


    const nextHeight =
      Math.min(
        Math.max(
          textarea.scrollHeight,
          MIN_TEXTAREA_HEIGHT
        ),
        MAX_TEXTAREA_HEIGHT
      );


    textarea.style.height =
      `${nextHeight}px`;
  }


  function resetComposerTextarea() {

    const textarea =
      textareaRef.current;


    if (
      !textarea
    ) {
      return;
    }


    textarea.style.height =
      `${MIN_TEXTAREA_HEIGHT}px`;
  }


  /* ==========================================================
     SUBMIT
     ========================================================== */

  async function handleSubmit() {

    if (
      !canSubmit
    ) {
      return;
    }


    clearConversationError();


    /* ========================================================
       IMAGE GENERATION / EDIT
       ======================================================== */

    if (
      imageMode
    ) {

      const prompt =
        trimmed;


      const sourceMessageId =
        selectedImageForEdit
          ?.message_id ??
        null;


      setMessage(
        ""
      );


      resetComposerTextarea();


      try {

        await generateImage(
          prompt,
          sourceMessageId
        );


        requestAnimationFrame(
          () => {

            textareaRef
              .current
              ?.focus();

          }
        );

      } catch (
        caught
      ) {

        console.error(
          sourceMessageId
            ? "Image editing failed:"
            : "Image generation failed:",
          caught
        );


        setMessage(
          prompt
        );


        requestAnimationFrame(
          () => {

            resizeComposerTextarea();


            textareaRef
              .current
              ?.focus();

          }
        );
      }


      return;
    }


    /* ========================================================
       NORMAL CHAT
       ======================================================== */

    const draft =
      message;


    const files =
      attachments.map(
        (
          attachment
        ) =>
          attachment.file
      );


    setMessage(
      ""
    );


    resetComposerTextarea();


    try {

      if (
        files.length >
        0
      ) {

        await sendMessageWithAttachments(
          draft,
          files
        );


        clearAttachments();

      } else {

        await sendMessage(
          draft
        );
      }

    } catch (
      caught
    ) {

      console.error(
        "Failed to send message:",
        caught
      );


      setMessage(
        draft
      );


      requestAnimationFrame(
        () => {

          resizeComposerTextarea();


          textareaRef
            .current
            ?.focus();

        }
      );
    }
  }


  /* ==========================================================
     KEYBOARD
     ========================================================== */

  function handleKeyDown(
    event:
      KeyboardEvent<HTMLTextAreaElement>
  ) {

    if (
      event.key ===
        "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent
        .isComposing
    ) {

      event.preventDefault();


      void handleSubmit();
    }
  }


  /* ==========================================================
     IMAGE MODE
     ========================================================== */

  function toggleImageMode() {

    if (
      composerBusy ||
      recording
    ) {
      return;
    }


    if (
      imageMode
    ) {

      clearImageEdit();


      setMode(
        "chat"
      );


      clearConversationError();


      requestAnimationFrame(
        () => {

          textareaRef
            .current
            ?.focus();

        }
      );


      return;
    }


    if (
      attachments.length >
      0
    ) {

      setConversationError(
        "Remove attachments before switching to image generation."
      );


      return;
    }


    clearConversationError();


    clearImageEdit();


    setMode(
      "image"
    );


    requestAnimationFrame(
      () => {

        textareaRef
          .current
          ?.focus();

      }
    );
  }


  /* ==========================================================
     REMOVE IMAGE REFERENCE
     ========================================================== */

  function removeImageReference() {

    if (
      composerBusy
    ) {
      return;
    }


    clearImageEdit();


    clearConversationError();


    requestAnimationFrame(
      () => {

        textareaRef
          .current
          ?.focus();

      }
    );
  }


  /* ==========================================================
     ATTACHMENTS
     ========================================================== */

  function openFilePicker() {

    if (
      composerBusy ||
      recording ||
      imageMode
    ) {
      return;
    }


    clearConversationError();


    fileInputRef
      .current
      ?.click();
  }


  function handleFiles(
    event:
      ChangeEvent<HTMLInputElement>
  ) {

    const incoming =
      Array.from(
        event.target.files ??
          []
      );


    event.target.value =
      "";


    if (
      incoming.length ===
      0
    ) {
      return;
    }


    clearConversationError();


    const available =
      MAX_ATTACHMENTS -
      attachments.length;


    if (
      available <=
      0
    ) {

      setConversationError(
        `You can attach up to ${MAX_ATTACHMENTS} files.`
      );


      return;
    }


    const selected =
      incoming.slice(
        0,
        available
      );


    const oversized =
      selected.find(
        (
          file
        ) =>
          file.size >
          MAX_FILE_SIZE
      );


    if (
      oversized
    ) {

      setConversationError(
        `${oversized.name} exceeds the 15 MB limit.`
      );


      return;
    }


    if (
      !selected.every(
        isSupportedFile
      )
    ) {

      setConversationError(
        "Supported attachments are PDF, TXT, Markdown, DOCX, PNG, JPG, JPEG, and WebP."
      );


      return;
    }


    const additions =
      selected.map(
        (
          file
        ):
          PendingAttachment => {

          const image =
            file.type
              .startsWith(
                "image/"
              );


          return {
            id:
              createLocalId(),

            file,

            kind:
              image
                ? "image"
                : "file",

            previewUrl:
              image
                ? URL.createObjectURL(
                    file
                  )
                : null,
          };
        }
      );


    setAttachments(
      (
        previous
      ) => [
        ...previous,
        ...additions,
      ]
    );
  }


  function removeAttachment(
    id:
      string
  ) {

    setAttachments(
      (
        previous
      ) => {

        const target =
          previous.find(
            (
              attachment
            ) =>
              attachment.id ===
              id
          );


        if (
          target
            ?.previewUrl
        ) {

          URL.revokeObjectURL(
            target.previewUrl
          );
        }


        return (
          previous.filter(
            (
              attachment
            ) =>
              attachment.id !==
              id
          )
        );
      }
    );


    clearConversationError();
  }


  function clearAttachments() {

    attachmentsRef
      .current
      .forEach(
        (
          attachment
        ) => {

          if (
            attachment
              .previewUrl
          ) {

            URL.revokeObjectURL(
              attachment
                .previewUrl
            );
          }
        }
      );


    attachmentsRef.current =
      [];


    setAttachments(
      []
    );
  }


  /* ==========================================================
     MICROPHONE
     ========================================================== */

  async function handleMicrophone() {

    if (
      composerBusy
    ) {
      return;
    }


    if (
      recording
    ) {

      stopRecording(
        true
      );


      return;
    }


    await startRecording();
  }


  async function startRecording() {

    clearConversationError();


    if (
      !navigator
        .mediaDevices
        ?.getUserMedia
    ) {

      setConversationError(
        "Microphone recording is not supported by this browser."
      );


      return;
    }


    if (
      typeof MediaRecorder ===
      "undefined"
    ) {

      setConversationError(
        "Audio recording is not supported by this browser."
      );


      return;
    }


    try {

      const stream =
        await navigator
          .mediaDevices
          .getUserMedia({
            audio:
              true,
          });


      mediaStreamRef.current =
        stream;


      audioChunksRef.current =
        [];


      cancelRecordingRef.current =
        false;


      const mimeType =
        getPreferredAudioMimeType();


      const recorder =
        mimeType
          ? new MediaRecorder(
              stream,
              {
                mimeType,
              }
            )
          : new MediaRecorder(
              stream
            );


      mediaRecorderRef.current =
        recorder;


      recorder.ondataavailable =
        (
          event
        ) => {

          if (
            event.data.size >
            0
          ) {

            audioChunksRef
              .current
              .push(
                event.data
              );
          }
        };


      recorder.onerror =
        () => {

          cancelRecordingRef.current =
            true;


          setRecording(
            false
          );


          stopMediaStream();


          mediaRecorderRef.current =
            null;


          setConversationError(
            "Microphone recording failed."
          );
        };


      recorder.onstop =
        async () => {

          const cancelled =
            cancelRecordingRef
              .current;


          const chunks =
            [
              ...audioChunksRef
                .current,
            ];


          audioChunksRef.current =
            [];


          const recordedType =
            recorder.mimeType ||
            mimeType ||
            "audio/webm";


          mediaRecorderRef.current =
            null;


          stopMediaStream();


          setRecording(
            false
          );


          if (
            cancelled
          ) {

            setActivity(
              "idle"
            );


            return;
          }


          const audioBlob =
            new Blob(
              chunks,
              {
                type:
                  recordedType,
              }
            );


          if (
            audioBlob.size ===
            0
          ) {

            setConversationError(
              "No audio was recorded."
            );


            return;
          }


          try {

            const transcript =
              await transcribeAudio(
                audioBlob,
                getRecordingFilename(
                  recordedType
                )
              );


            if (
              transcript.trim()
            ) {

              setMessage(
                (
                  previous
                ) => {

                  const clean =
                    previous
                      .trimEnd();


                  return (
                    clean
                      ? `${clean} ${transcript.trim()}`
                      : transcript.trim()
                  );
                }
              );
            }


            requestAnimationFrame(
              () => {

                textareaRef
                  .current
                  ?.focus();

              }
            );

          } catch (
            caught
          ) {

            console.error(
              "Transcription failed:",
              caught
            );
          }
        };


      recorder.start(
        250
      );


      setRecording(
        true
      );


      setActivity(
        "recording"
      );

    } catch (
      caught
    ) {

      console.error(
        "Microphone permission failed:",
        caught
      );


      stopMediaStream();


      setRecording(
        false
      );


      setConversationError(
        getMicrophoneError(
          caught
        )
      );
    }
  }


  /* ==========================================================
     STOP RECORDING
     ========================================================== */

  function stopRecording(
    transcribe:
      boolean
  ) {

    const recorder =
      mediaRecorderRef
        .current;


    if (
      !recorder
    ) {
      return;
    }


    cancelRecordingRef.current =
      !transcribe;


    if (
      transcribe
    ) {

      setActivity(
        "transcribing"
      );

    } else {

      setActivity(
        "idle"
      );
    }


    if (
      recorder.state !==
      "inactive"
    ) {

      recorder.stop();
    }
  }


  /* ==========================================================
     STOP STREAM
     ========================================================== */

  function stopMediaStream() {

    mediaStreamRef
      .current
      ?.getTracks()
      .forEach(
        (
          track
        ) => {

          track.stop();
        }
      );


    mediaStreamRef.current =
      null;
  }


  /* ==========================================================
     PRESENTATION
     ========================================================== */

  const status =
    getActivityLabel(
      activity
    );


  const placeholder =
    imageMode
      ? editingImage
        ? "Describe what you want to change"
        : "Describe an image"
      : recording
        ? "Listening..."
        : transcribing
          ? "Transcribing..."
          : attachments.length >
              0
            ? "Ask anything about these files"
            : "Ask anything";


  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div
      className="
        w-full

        bg-gradient-to-t
        from-[#050505]
        via-[#050505]
        to-transparent

        px-3
        pb-3
        pt-2

        sm:px-5
        sm:pb-4
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[820px]
        "
      >

        {/* ===================================================
            COMPOSER SHELL
            =================================================== */}

        <div
          className={`
            rounded-[28px]

            border

            bg-[#1f1f1f]

            shadow-[0_8px_30px_rgba(0,0,0,0.22)]

            transition-colors
            duration-150

            ${
              recording
                ? "border-red-400/20"
                : "border-white/[0.10] focus-within:border-white/[0.16]"
            }
          `}
        >

          {/* =================================================
              IMAGE EDIT REFERENCE
              ================================================= */}

          {imageMode &&
            selectedImageForEdit &&
            selectedImageForEdit.image_url && (
            <div
              className="
                px-3
                pt-3
              "
            >
              <div
                className="
                  flex
                  max-w-[320px]
                  items-center
                  gap-2.5

                  rounded-2xl

                  border
                  border-white/[0.08]

                  bg-white/[0.045]

                  p-2
                "
              >
                <div
                  className="
                    h-10
                    w-10
                    shrink-0

                    overflow-hidden

                    rounded-xl

                    bg-black
                  "
                >
                  <img
                    src={
                      selectedImageForEdit
                        .image_url
                    }
                    alt="Image being edited"
                    className="
                      h-full
                      w-full
                      object-cover
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
                      text-[11px]
                      font-medium
                      text-white/80
                    "
                  >
                    Editing image
                  </p>

                  <p
                    className="
                      mt-0.5
                      truncate

                      text-[10px]
                      text-white/35
                    "
                  >
                    {selectedImageForEdit
                      .image_prompt ||
                      "Generated image"}
                  </p>
                </div>


                <button
                  type="button"
                  onClick={
                    removeImageReference
                  }
                  disabled={
                    composerBusy
                  }
                  aria-label="Remove image reference"
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center

                    rounded-full

                    text-white/35

                    transition-colors

                    hover:bg-white/[0.07]
                    hover:text-white/80

                    focus:outline-none
                    focus-visible:outline-none
                    focus-visible:ring-0

                    disabled:opacity-30
                  "
                >
                  <X
                    size={13}
                    strokeWidth={1.8}
                  />
                </button>
              </div>
            </div>
          )}


          {/* =================================================
              RECORDING BAR
              ================================================= */}

          {recording && (
            <div
              className="
                flex
                items-center
                justify-between

                px-4
                pt-3
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    h-2
                    w-2

                    animate-pulse

                    rounded-full

                    bg-red-400
                  "
                />

                <span
                  className="
                    text-[11px]
                    font-medium
                    text-white/55
                  "
                >
                  Listening
                </span>
              </div>


              <div
                className="
                  flex
                  items-center
                  gap-1
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    stopRecording(
                      false
                    )
                  }
                  className="
                    rounded-full

                    px-2.5
                    py-1.5

                    text-[10px]
                    text-white/35

                    hover:bg-white/[0.05]
                    hover:text-white/70
                  "
                >
                  Cancel
                </button>


                <button
                  type="button"
                  onClick={() =>
                    stopRecording(
                      true
                    )
                  }
                  className="
                    flex
                    h-7
                    items-center
                    gap-1.5

                    rounded-full

                    bg-white/[0.08]

                    px-2.5

                    text-[10px]
                    text-white/70

                    hover:bg-white/[0.12]
                  "
                >
                  <Square
                    size={9}
                    fill="currentColor"
                  />

                  Done
                </button>
              </div>
            </div>
          )}


          {/* =================================================
              ATTACHMENTS
              ================================================= */}

          {attachments.length >
            0 && (
            <div
              className="
                flex
                gap-2

                overflow-x-auto

                px-3
                pt-3
              "
            >
              {attachments.map(
                (
                  attachment
                ) => (
                  <AttachmentPreview
                    key={
                      attachment.id
                    }
                    attachment={
                      attachment
                    }
                    onRemove={() =>
                      removeAttachment(
                        attachment.id
                      )
                    }
                  />
                )
              )}
            </div>
          )}


          {/* =================================================
              INPUT
              ================================================= */}

          <div
            className="
              px-4
              pb-1
              pt-3.5

              sm:px-[18px]
            "
          >
            <textarea
              ref={
                textareaRef
              }
              value={
                message
              }
              rows={1}
              onChange={(
                event
              ) => {

                setMessage(
                  event.target.value
                );


                if (
                  error
                ) {

                  clearConversationError();
                }
              }}
              onKeyDown={
                handleKeyDown
              }
              disabled={
                composerBusy ||
                recording
              }
              placeholder={
                placeholder
              }
              aria-label={
                imageMode
                  ? editingImage
                    ? "Describe image changes"
                    : "Describe an image"
                  : "Message DeepResearch AI"
              }
              className="
                block

                min-h-[24px]
                max-h-[160px]
                w-full

                resize-none
                overflow-y-auto

                border-0
                bg-transparent

                p-0

                text-[16px]
                leading-6
                text-[#f4f4f4]

                !outline-none
                !ring-0
                !shadow-none

                placeholder:text-white/30

                focus:!outline-none
                focus:!ring-0
                focus:!shadow-none

                focus-visible:!outline-none
                focus-visible:!ring-0

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              style={{
                height:
                  `${MIN_TEXTAREA_HEIGHT}px`,

                outline:
                  "none",

                boxShadow:
                  "none",
              }}
            />
          </div>


          {/* =================================================
              BOTTOM TOOLBAR
              ================================================= */}

          <div
            className="
              flex
              min-h-[48px]
              items-center
              justify-between
              gap-3

              px-2.5
              pb-2.5
            "
          >
            <div
              className="
                flex
                min-w-0
                items-center
                gap-1
              "
            >

              {/* =============================================
                  FILE INPUT
                  ============================================= */}

              <input
                ref={
                  fileInputRef
                }
                type="file"
                multiple
                accept=".pdf,.txt,.md,.markdown,.docx,image/png,image/jpeg,image/webp"
                onChange={
                  handleFiles
                }
                className="hidden"
              />


              {/* =============================================
                  ATTACH
                  ============================================= */}

              <ComposerIconButton
                label="Attach files"
                disabled={
                  composerBusy ||
                  recording ||
                  imageMode ||
                  attachments.length >=
                    MAX_ATTACHMENTS
                }
                onClick={
                  openFilePicker
                }
              >
                <Paperclip
                  size={18}
                  strokeWidth={1.7}
                />
              </ComposerIconButton>


              {/* =============================================
                  MIC
                  ============================================= */}

              <ComposerIconButton
                label={
                  recording
                    ? "Stop recording"
                    : "Use microphone"
                }
                disabled={
                  composerBusy &&
                  !recording
                }
                active={
                  recording
                }
                danger={
                  recording
                }
                onClick={
                  handleMicrophone
                }
              >
                <Mic
                  size={18}
                  strokeWidth={1.7}
                />
              </ComposerIconButton>


              {/* =============================================
                  IMAGE MODE
                  ============================================= */}

              <button
                type="button"
                title={
                  imageMode
                    ? "Exit image mode"
                    : "Create image"
                }
                aria-pressed={
                  imageMode
                }
                disabled={
                  composerBusy ||
                  recording
                }
                onClick={
                  toggleImageMode
                }
                className={`
                  flex
                  h-9
                  items-center
                  gap-1.5

                  rounded-full

                  px-2.5

                  text-[12px]
                  font-medium

                  transition-colors

                  focus:outline-none
                  focus-visible:outline-none
                  focus-visible:ring-0

                  disabled:cursor-not-allowed
                  disabled:opacity-30

                  ${
                    imageMode
                      ? "bg-white/[0.10] text-white"
                      : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                  }
                `}
              >
                <ImageIcon
                  size={17}
                  strokeWidth={1.7}
                />

                <span>
                  Image
                </span>


                {imageMode && (
                  <X
                    size={12}
                    strokeWidth={1.8}
                    className="
                      ml-0.5
                      text-white/45
                    "
                  />
                )}
              </button>
            </div>


            {/* ===============================================
                SEND BUTTON
                =============================================== */}

            <button
              type="button"
              onClick={() => {
                void handleSubmit();
              }}
              disabled={
                !canSubmit
              }
              aria-label={
                imageMode
                  ? editingImage
                    ? "Edit image"
                    : "Generate image"
                  : "Send message"
              }
              className={`
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center

                rounded-full

                border-0

                !outline-none

                transition-all
                duration-150

                focus:!outline-none
                focus-visible:!outline-none
                focus-visible:!ring-0

                ${
                  canSubmit
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-white/[0.08] text-white/25"
                }

                disabled:cursor-not-allowed
              `}
            >
              {composerBusy ? (
                <Loader2
                  size={17}
                  strokeWidth={1.8}
                  className="
                    animate-spin
                  "
                />
              ) : (
                <ArrowUp
                  size={18}
                  strokeWidth={2}
                />
              )}
            </button>
          </div>
        </div>


        {/* ===================================================
            FOOTER / STATUS
            =================================================== */}

        <div
          className="
            mt-1.5

            flex
            min-h-[16px]
            items-center
            justify-between
            gap-3

            px-2
          "
        >
          <div
            className="
              min-w-0
              flex-1
            "
          >
            {error ? (
              <button
                type="button"
                onClick={
                  clearConversationError
                }
                className="
                  flex
                  max-w-full
                  items-center
                  gap-1.5

                  text-left
                  text-[10px]
                  text-red-300/70
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    shrink-0

                    rounded-full

                    bg-red-400
                  "
                />

                <span
                  className="
                    truncate
                  "
                >
                  {error}
                </span>
              </button>

            ) : status ? (
              <div
                className="
                  flex
                  items-center
                  gap-1.5

                  text-[10px]
                  text-white/30
                "
              >
                <span
                  className={`
                    h-1.5
                    w-1.5

                    rounded-full

                    ${
                      activity ===
                      "recording"
                        ? "bg-red-400"
                        : "animate-pulse bg-white/50"
                    }
                  `}
                />

                {status}
              </div>

            ) : (
              <p
                className="
                  hidden

                  text-[10px]
                  text-white/20

                  sm:block
                "
              >
                Enter to send · Shift + Enter for new line
              </p>
            )}
          </div>


          <p
            className="
              hidden
              shrink-0

              text-[10px]
              text-white/20

              md:block
            "
          >
            DeepResearch can make mistakes.
          </p>
        </div>
      </div>
    </div>
  );
}


/* ============================================================
   ICON BUTTON
   ============================================================ */

function ComposerIconButton({
  children,
  label,
  disabled = false,
  active = false,
  danger = false,
  onClick,
}: {
  children:
    ReactNode;

  label:
    string;

  disabled?:
    boolean;

  active?:
    boolean;

  danger?:
    boolean;

  onClick:
    () => void;
}) {

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center

        rounded-full

        border-0

        !outline-none

        transition-colors

        focus:!outline-none
        focus-visible:!outline-none
        focus-visible:!ring-0

        disabled:cursor-not-allowed
        disabled:opacity-30

        ${
          danger &&
          active
            ? "bg-red-400/[0.12] text-red-300"
            : active
              ? "bg-white/[0.10] text-white"
              : "text-white/55 hover:bg-white/[0.06] hover:text-white"
        }
      `}
    >
      {children}
    </button>
  );
}


/* ============================================================
   ATTACHMENT PREVIEW
   ============================================================ */

function AttachmentPreview({
  attachment,
  onRemove,
}: {
  attachment:
    PendingAttachment;

  onRemove:
    () => void;
}) {

  const {
    file,
    previewUrl,
    kind,
  } =
    attachment;


  return (
    <div
      className="
        group
        relative

        flex
        h-[52px]
        max-w-[220px]
        shrink-0
        items-center
        gap-2.5

        rounded-2xl

        border
        border-white/[0.08]

        bg-white/[0.045]

        p-1.5
        pr-8
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center

          overflow-hidden

          rounded-xl

          bg-white/[0.05]

          text-white/35
        "
      >
        {kind ===
          "image" &&
        previewUrl ? (
          <img
            src={
              previewUrl
            }
            alt=""
            className="
              h-full
              w-full
              object-cover
            "
          />

        ) : file.name
            .toLowerCase()
            .endsWith(
              ".pdf"
            ) ? (
          <FileText
            size={17}
            strokeWidth={1.6}
          />

        ) : (
          <File
            size={17}
            strokeWidth={1.6}
          />
        )}
      </div>


      <div
        className="
          min-w-0
        "
      >
        <p
          className="
            truncate

            text-[11px]
            font-medium
            text-white/70
          "
        >
          {file.name}
        </p>

        <p
          className="
            mt-0.5

            text-[9px]
            text-white/30
          "
        >
          {formatBytes(
            file.size
          )}
        </p>
      </div>


      <button
        type="button"
        onClick={
          onRemove
        }
        aria-label={`Remove ${file.name}`}
        className="
          absolute
          right-1.5
          top-1.5

          flex
          h-6
          w-6
          items-center
          justify-center

          rounded-full

          bg-black/35

          text-white/40

          transition

          hover:bg-black/55
          hover:text-white

          focus:outline-none
          focus-visible:outline-none
          focus-visible:ring-0
        "
      >
        <X
          size={12}
          strokeWidth={1.8}
        />
      </button>
    </div>
  );
}


/* ============================================================
   ACTIVITY LABEL
   ============================================================ */

function getActivityLabel(
  activity:
    ConversationActivity
) {

  switch (
    activity
  ) {

    case "sending":

      return (
        "Sending…"
      );


    case "generating":

      return (
        "Thinking…"
      );


    case "recording":

      return (
        "Listening…"
      );


    case "transcribing":

      return (
        "Transcribing…"
      );


    case "generating_image":

      return (
        "Creating image…"
      );


    case "playing":

      return (
        "Playing…"
      );


    case "retrying":

      return (
        "Regenerating…"
      );


    default:

      return null;
  }
}


/* ============================================================
   SUPPORTED FILES
   ============================================================ */

function isSupportedFile(
  file:
    File
) {

  const name =
    file.name
      .toLowerCase();


  return [
    ".pdf",
    ".txt",
    ".md",
    ".markdown",
    ".docx",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
  ].some(
    (
      extension
    ) =>
      name.endsWith(
        extension
      )
  );
}


/* ============================================================
   FILE SIZE
   ============================================================ */

function formatBytes(
  bytes:
    number
) {

  if (
    bytes <
    1024
  ) {

    return (
      `${bytes} B`
    );
  }


  if (
    bytes <
    1024 *
      1024
  ) {

    return (
      `${(
        bytes /
        1024
      ).toFixed(
        1
      )} KB`
    );
  }


  return (
    `${(
      bytes /
      (
        1024 *
        1024
      )
    ).toFixed(
      1
    )} MB`
  );
}


/* ============================================================
   LOCAL ID
   ============================================================ */

function createLocalId() {

  if (
    typeof crypto !==
      "undefined" &&
    "randomUUID" in
      crypto
  ) {

    return (
      crypto.randomUUID()
    );
  }


  return (
    `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`
  );
}


/* ============================================================
   AUDIO MIME
   ============================================================ */

function getPreferredAudioMimeType() {

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];


  for (
    const candidate
    of candidates
  ) {

    if (
      MediaRecorder
        .isTypeSupported(
          candidate
        )
    ) {

      return candidate;
    }
  }


  return "";
}


/* ============================================================
   AUDIO FILE NAME
   ============================================================ */

function getRecordingFilename(
  mimeType:
    string
) {

  const lowered =
    mimeType
      .toLowerCase();


  if (
    lowered.includes(
      "ogg"
    )
  ) {

    return (
      "conversation-recording.ogg"
    );
  }


  if (
    lowered.includes(
      "mp4"
    )
  ) {

    return (
      "conversation-recording.m4a"
    );
  }


  if (
    lowered.includes(
      "wav"
    )
  ) {

    return (
      "conversation-recording.wav"
    );
  }


  return (
    "conversation-recording.webm"
  );
}


/* ============================================================
   MICROPHONE ERROR
   ============================================================ */

function getMicrophoneError(
  error:
    unknown
) {

  if (
    error instanceof
      DOMException
  ) {

    if (
      error.name ===
      "NotAllowedError"
    ) {

      return (
        "Microphone permission was denied."
      );
    }


    if (
      error.name ===
      "NotFoundError"
    ) {

      return (
        "No microphone was detected."
      );
    }


    if (
      error.name ===
      "NotReadableError"
    ) {

      return (
        "The microphone is already in use."
      );
    }
  }


  return (
    "The microphone could not be started."
  );
}