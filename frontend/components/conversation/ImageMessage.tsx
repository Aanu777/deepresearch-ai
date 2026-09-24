"use client";

import {
  useEffect,
  useState,
  type MouseEvent,
} from "react";

import {
  Check,
  Download,
  Expand,
  Pencil,
  X,
} from "lucide-react";

import {
  useConversation,
} from "@/components/context/ConversationContext";

import type {
  ConversationMessage,
} from "@/lib/conversation";


/* ============================================================
   PROPS
   ============================================================ */

type ImageMessageProps = {
  message:
    ConversationMessage;
};


/* ============================================================
   COMPONENT
   ============================================================ */

export default function ImageMessage({
  message,
}: ImageMessageProps) {

  const [
    viewerOpen,
    setViewerOpen,
  ] =
    useState(
      false
    );

  const {
    selectedImageForEdit,
    selectImageForEdit,
  } =
    useConversation();


  /* ==========================================================
     VALIDATION
     ========================================================== */

  const imageUrl =
    message.image_url;

  if (
    !imageUrl
  ) {
    return null;
  }


  /* ==========================================================
     DERIVED
     ========================================================== */

  const selected =
    selectedImageForEdit
      ?.message_id ===
    message.message_id;

  const edited =
    message.image_operation ===
    "edit";

  const prompt =
    message.image_prompt
      ?.trim() ??
    "";


  /* ==========================================================
     EDIT
     ========================================================== */

  function handleEdit(
    event?:
      MouseEvent<HTMLButtonElement>
  ) {
    event?.stopPropagation();

    selectImageForEdit(
      message
    );
  }


  /* ==========================================================
     DOWNLOAD
     ========================================================== */

  function handleDownload(
    event:
      MouseEvent<HTMLAnchorElement>
  ) {
    event.stopPropagation();
  }


  /* ==========================================================
     FULLSCREEN
     ========================================================== */

  function openViewer() {
    setViewerOpen(
      true
    );
  }


  function closeViewer() {
    setViewerOpen(
      false
    );
  }


  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <>
      <div
        className="
          w-full
          max-w-[680px]
        "
      >
        {/* ==================================================
            IMAGE
            ================================================== */}

        <div
          className={`
            group
            relative

            overflow-hidden

            rounded-[22px]

            border

            bg-[#0c0c0c]

            transition-all
            duration-200

            ${
              selected
                ? "border-cyan-300/35 shadow-[0_0_0_1px_rgba(103,232,249,0.06),0_22px_60px_rgba(0,0,0,0.32)]"
                : "border-white/[0.08] shadow-[0_22px_55px_rgba(0,0,0,0.22)]"
            }
          `}
        >
          {/* =================================================
              IMAGE BUTTON
              ================================================= */}

          <button
            type="button"
            onClick={
              openViewer
            }
            className="
              relative

              block
              w-full

              cursor-zoom-in

              overflow-hidden

              bg-[#0b0b0b]

              text-left
            "
            aria-label="Open image fullscreen"
          >
            <img
              src={
                imageUrl
              }
              alt={
                prompt ||
                (
                  edited
                    ? "Edited image"
                    : "Generated image"
                )
              }
              className="
                block

                max-h-[680px]
                w-full

                object-contain

                transition-transform
                duration-500

                group-hover:scale-[1.005]
              "
            />

            {/* ===============================================
                TOP BADGE
                =============================================== */}

            <div
              className="
                pointer-events-none

                absolute
                left-3
                top-3

                flex
                items-center
                gap-1.5

                rounded-full

                border
                border-white/[0.09]

                bg-black/55

                px-2.5
                py-1.5

                text-[10px]
                font-medium
                text-white/65

                backdrop-blur-xl
              "
            >
              {selected && (
                <Check
                  size={11}
                  strokeWidth={
                    2
                  }
                  className="
                    text-cyan-300
                  "
                />
              )}

              <span>
                {selected
                  ? "Editing"
                  : edited
                    ? "Edited"
                    : "Generated"}
              </span>
            </div>

            {/* ===============================================
                EXPAND HINT
                =============================================== */}

            <div
              className="
                pointer-events-none

                absolute
                right-3
                top-3

                flex
                h-8
                w-8
                items-center
                justify-center

                rounded-full

                border
                border-white/[0.08]

                bg-black/45

                text-white/55

                opacity-0

                backdrop-blur-xl

                transition-opacity
                duration-150

                group-hover:opacity-100
              "
            >
              <Expand
                size={14}
                strokeWidth={
                  1.7
                }
              />
            </div>
          </button>
        </div>


        {/* ==================================================
            ACTION BAR
            ================================================== */}

        <div
          className="
            mt-2.5

            flex
            flex-wrap
            items-center
            gap-1
          "
        >
          <button
            type="button"
            onClick={
              handleEdit
            }
            className={`
              flex
              h-8
              items-center
              gap-1.5

              rounded-full

              px-3

              text-[11px]
              font-medium

              transition-colors
              duration-150

              ${
                selected
                  ? "bg-cyan-300/[0.10] text-cyan-200"
                  : "text-white/38 hover:bg-white/[0.055] hover:text-white/75"
              }
            `}
          >
            {selected ? (
              <Check
                size={13}
                strokeWidth={
                  1.8
                }
              />
            ) : (
              <Pencil
                size={13}
                strokeWidth={
                  1.7
                }
              />
            )}

            {selected
              ? "Selected"
              : "Edit"}
          </button>


          <a
            href={
              imageUrl
            }
            download={
              edited
                ? "deepresearch-edited-image.png"
                : "deepresearch-generated-image.png"
            }
            onClick={
              handleDownload
            }
            className="
              flex
              h-8
              items-center
              gap-1.5

              rounded-full

              px-3

              text-[11px]
              font-medium
              text-white/38

              transition-colors
              duration-150

              hover:bg-white/[0.055]
              hover:text-white/75
            "
          >
            <Download
              size={13}
              strokeWidth={
                1.7
              }
            />

            Download
          </a>


          <button
            type="button"
            onClick={
              openViewer
            }
            className="
              flex
              h-8
              items-center
              gap-1.5

              rounded-full

              px-3

              text-[11px]
              font-medium
              text-white/38

              transition-colors
              duration-150

              hover:bg-white/[0.055]
              hover:text-white/75
            "
          >
            <Expand
              size={13}
              strokeWidth={
                1.7
              }
            />

            View
          </button>
        </div>


        {/* ==================================================
            PROMPT
            ================================================== */}

        {prompt && (
          <p
            className="
              mt-1.5

              max-w-[620px]

              px-2

              text-[11px]
              leading-5
              text-white/24
            "
          >
            {prompt}
          </p>
        )}
      </div>


      {/* ====================================================
          FULLSCREEN VIEWER
          ==================================================== */}

      {viewerOpen && (
        <ImageFullscreenViewer
          imageUrl={
            imageUrl
          }
          prompt={
            prompt
          }
          edited={
            edited
          }
          selected={
            selected
          }
          onEdit={
            handleEdit
          }
          onClose={
            closeViewer
          }
        />
      )}
    </>
  );
}


/* ============================================================
   FULLSCREEN VIEWER
   ============================================================ */

function ImageFullscreenViewer({
  imageUrl,
  prompt,
  edited,
  selected,
  onEdit,
  onClose,
}: {
  imageUrl:
    string;

  prompt:
    string;

  edited:
    boolean;

  selected:
    boolean;

  onEdit:
    () => void;

  onClose:
    () => void;
}) {

  /* ==========================================================
     ESCAPE KEY
     ========================================================== */

  useEffect(
    () => {

      function handleKeyDown(
        event:
          KeyboardEvent
      ) {
        if (
          event.key ===
          "Escape"
        ) {
          onClose();
        }
      }


      document.addEventListener(
        "keydown",
        handleKeyDown
      );

      const previousOverflow =
        document.body.style
          .overflow;

      document.body.style
        .overflow =
        "hidden";


      return () => {
        document.removeEventListener(
          "keydown",
          handleKeyDown
        );

        document.body.style
          .overflow =
          previousOverflow;
      };
    },
    [
      onClose,
    ]
  );


  return (
    <div
      className="
        fixed
        inset-0
        z-[100]

        flex
        flex-col

        bg-black/90

        backdrop-blur-xl
      "
      onMouseDown={
        (
          event
        ) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            onClose();
          }
        }
      }
    >
      {/* ====================================================
          HEADER
          ==================================================== */}

      <div
        className="
          flex
          h-16
          shrink-0
          items-center
          justify-between
          gap-4

          border-b
          border-white/[0.07]

          px-4

          sm:px-6
        "
      >
        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              text-[12px]
              font-medium
              text-white/70
            "
          >
            {edited
              ? "Edited image"
              : "Generated image"}
          </p>

          {prompt && (
            <p
              className="
                mt-0.5

                max-w-[520px]

                truncate

                text-[10px]
                text-white/28
              "
            >
              {prompt}
            </p>
          )}
        </div>


        <div
          className="
            flex
            shrink-0
            items-center
            gap-1
          "
        >
          <button
            type="button"
            onClick={
              onEdit
            }
            className={`
              flex
              h-9
              items-center
              gap-2

              rounded-full

              px-3.5

              text-[11px]
              font-medium

              transition-colors

              ${
                selected
                  ? "bg-cyan-300/[0.12] text-cyan-200"
                  : "bg-white/[0.055] text-white/65 hover:bg-white/[0.09] hover:text-white"
              }
            `}
          >
            {selected ? (
              <Check
                size={14}
                strokeWidth={
                  1.8
                }
              />
            ) : (
              <Pencil
                size={14}
                strokeWidth={
                  1.7
                }
              />
            )}

            {selected
              ? "Selected"
              : "Edit"}
          </button>


          <a
            href={
              imageUrl
            }
            download="deepresearch-image.png"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-full

              bg-white/[0.055]

              text-white/55

              transition-colors

              hover:bg-white/[0.09]
              hover:text-white
            "
            title="Download image"
          >
            <Download
              size={15}
              strokeWidth={
                1.7
              }
            />
          </a>


          <button
            type="button"
            onClick={
              onClose
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-full

              bg-white/[0.055]

              text-white/55

              transition-colors

              hover:bg-white/[0.09]
              hover:text-white
            "
            aria-label="Close image viewer"
          >
            <X
              size={16}
              strokeWidth={
                1.7
              }
            />
          </button>
        </div>
      </div>


      {/* ====================================================
          IMAGE AREA
          ==================================================== */}

      <div
        className="
          flex
          min-h-0
          flex-1
          items-center
          justify-center

          p-4

          sm:p-8
        "
        onClick={
          onClose
        }
      >
        <img
          src={
            imageUrl
          }
          alt={
            prompt ||
            "Generated image"
          }
          onClick={(
            event
          ) =>
            event.stopPropagation()
          }
          className="
            max-h-full
            max-w-full

            select-none

            rounded-xl

            object-contain

            shadow-[0_30px_100px_rgba(0,0,0,0.65)]
          "
        />
      </div>
    </div>
  );
}