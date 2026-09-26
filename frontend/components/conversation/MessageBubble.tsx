"use client";

import {
  isValidElement,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import {
  Check,
  Copy,
  Pencil,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  useConversation,
} from "@/components/context/ConversationContext";

import {
  submitConversationFeedback,
  type ConversationFeedbackReason,
  type ConversationMessage,
} from "@/lib/conversation";

import ImageMessage from "./ImageMessage";


/* ============================================================
   PROPS
   ============================================================ */

type MessageBubbleProps = {
  message: ConversationMessage;
};


const FEEDBACK_REASONS: Array<{
  value: ConversationFeedbackReason;
  label: string;
}> = [
  {
    value: "incorrect",
    label: "Incorrect",
  },
  {
    value: "did_not_follow_instructions",
    label: "Didn't follow instructions",
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
    value: "bad_sources",
    label: "Bad sources",
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


/* ============================================================
   MESSAGE BUBBLE
   ============================================================ */

export default function MessageBubble({
  message,
}: MessageBubbleProps) {

  if (
    message.message_type ===
    "image"
  ) {
    return (
      <div
        className="
          flex
          w-full
          justify-start
        "
      >
        <ImageMessage
          message={message}
        />
      </div>
    );
  }


  return (
    <TextMessage
      message={message}
    />
  );
}


/* ============================================================
   TEXT MESSAGE
   ============================================================ */

function TextMessage({
  message,
}: {
  message: ConversationMessage;
}) {

  const {
    editMessage,
    sending,
    streamingMessageId,
    finishStreamingMessage,
  } =
    useConversation();


  const isUser =
    message.role ===
    "user";

  const isStreaming =
    !isUser &&
    streamingMessageId ===
      message.message_id;


  const [
    editing,
    setEditing,
  ] =
    useState(false);


  const [
    draft,
    setDraft,
  ] =
    useState(
      message.content
    );


  const [
    displayedContent,
    setDisplayedContent,
  ] =
    useState(
      message.content
    );


  useEffect(
    () => {
      if (
        !isStreaming
      ) {
        setDisplayedContent(
          message.content
        );

        return;
      }

      const fullContent =
        message.content;

      if (!fullContent) {
        finishStreamingMessage(
          message.message_id
        );

        return;
      }

      setDisplayedContent(
        ""
      );

      const totalCharacters =
        fullContent.length;

      const duration =
        Math.min(
          4800,
          Math.max(
            900,
            totalCharacters * 7
          )
        );

      const startedAt =
        performance.now();

      let frameId =
        0;

      function reveal(
        now: number
      ) {
        const elapsed =
          now - startedAt;

        const progress =
          Math.min(
            1,
            elapsed / duration
          );

        const eased =
          1 -
          Math.pow(
            1 - progress,
            2
          );

        const visibleCharacters =
          Math.min(
            totalCharacters,
            Math.max(
              1,
              Math.floor(
                totalCharacters *
                eased
              )
            )
          );

        setDisplayedContent(
          fullContent.slice(
            0,
            visibleCharacters
          )
        );

        if (
          visibleCharacters <
          totalCharacters
        ) {
          frameId =
            requestAnimationFrame(
              reveal
            );

          return;
        }

        finishStreamingMessage(
          message.message_id
        );
      }

      frameId =
        requestAnimationFrame(
          reveal
        );

      return () => {
        cancelAnimationFrame(
          frameId
        );
      };
    },
    [
      finishStreamingMessage,
      isStreaming,
      message.content,
      message.message_id,
    ]
  );


  const [
    copied,
    setCopied,
  ] =
    useState(false);


  const [
    saving,
    setSaving,
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
      ConversationFeedbackReason | ""
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


  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );


  /* ==========================================================
     SYNC MESSAGE
     ========================================================== */

  useEffect(
    () => {

      if (
        !editing
      ) {
        setDraft(
          message.content
        );
      }

    },
    [
      message.content,
      editing,
    ]
  );


  /* ==========================================================
     FOCUS EDITOR
     ========================================================== */

  useEffect(
    () => {

      if (
        !editing
      ) {
        return;
      }


      const textarea =
        textareaRef.current;


      if (
        !textarea
      ) {
        return;
      }


      textarea.focus({
        preventScroll: true,
      });


      textarea.setSelectionRange(
        textarea.value.length,
        textarea.value.length
      );


      resizeTextarea(
        textarea
      );

    },
    [
      editing,
    ]
  );


  /* ==========================================================
     COPY
     ========================================================== */

  async function handleCopy() {

    if (
      !message.content
    ) {
      return;
    }


    try {

      await navigator
        .clipboard
        .writeText(
          message.content
        );


      setCopied(
        true
      );


      window.setTimeout(
        () => {
          setCopied(
            false
          );
        },
        1400
      );

    } catch (
      error
    ) {

      console.error(
        "Failed to copy message:",
        error
      );
    }
  }


  async function submitPositiveFeedback() {
    if (
      isUser ||
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
      await submitConversationFeedback(
        message.chat_id,
        message.message_id,
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
      console.error(
        "Failed to save positive feedback:",
        error
      );

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
      isUser ||
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
      isUser ||
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

      await submitConversationFeedback(
        message.chat_id,
        message.message_id,
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
      console.error(
        "Failed to save negative feedback:",
        error
      );

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


  /* ==========================================================
     START EDIT
     ========================================================== */

  function startEditing() {

    if (
      !isUser ||
      sending
    ) {
      return;
    }


    setDraft(
      message.content
    );


    setEditing(
      true
    );
  }


  /* ==========================================================
     CANCEL EDIT
     ========================================================== */

  function cancelEditing() {

    if (
      saving
    ) {
      return;
    }


    setDraft(
      message.content
    );


    setEditing(
      false
    );
  }


  /* ==========================================================
     SAVE EDIT
     ========================================================== */

  async function saveEdit() {

    const trimmed =
      draft.trim();


    if (
      !trimmed
    ) {
      return;
    }


    if (
      trimmed ===
      message.content.trim()
    ) {

      setEditing(
        false
      );

      return;
    }


    if (
      saving ||
      sending
    ) {
      return;
    }


    setSaving(
      true
    );


    try {

      await editMessage(
        message.message_id,
        trimmed
      );


      setEditing(
        false
      );

    } catch (
      error
    ) {

      console.error(
        "Failed to edit message:",
        error
      );

    } finally {

      setSaving(
        false
      );
    }
  }


  /* ==========================================================
     EDIT KEYBOARD
     ========================================================== */

  function handleEditKeyDown(
    event:
      KeyboardEvent<HTMLTextAreaElement>
  ) {

    if (
      event.key ===
      "Escape"
    ) {

      event.preventDefault();

      cancelEditing();

      return;
    }


    if (
      event.key ===
        "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent
        .isComposing
    ) {

      event.preventDefault();

      void saveEdit();
    }
  }


  /* ==========================================================
     EDIT MODE
     ========================================================== */

  if (
    isUser &&
    editing
  ) {
    return (
      <div
        className="
          flex
          w-full
          justify-end
        "
      >
        <div
          className="
            w-full
            max-w-[92%]

            sm:max-w-[78%]
            lg:max-w-[72%]
          "
        >
          <div
            className="
              overflow-hidden

              rounded-[22px]

              border
              border-white/[0.10]

              bg-[#2b2b2b]

              shadow-[0_10px_30px_rgba(0,0,0,0.16)]

              focus-within:border-white/[0.10]
            "
          >
            <textarea
              ref={textareaRef}
              value={draft}
              rows={1}
              disabled={saving}
              spellCheck={false}
              onChange={(
                event
              ) => {

                setDraft(
                  event.target.value
                );


                resizeTextarea(
                  event.target
                );
              }}
              onKeyDown={
                handleEditKeyDown
              }
              className="
                block

                min-h-[54px]
                max-h-[220px]
                w-full

                resize-none
                overflow-y-auto

                appearance-none

                !border-0
                !border-transparent

                bg-transparent

                px-4
                pb-2
                pt-3.5

                text-[15px]
                leading-7
                text-white

                !outline-none
                outline-none

                !ring-0
                ring-0

                !shadow-none
                shadow-none

                focus:!border-transparent
                focus:!outline-none
                focus:!ring-0
                focus:!shadow-none

                focus-visible:!border-transparent
                focus-visible:!outline-none
                focus-visible:!ring-0
                focus-visible:!shadow-none

                disabled:opacity-50
              "
              style={{
                outline:
                  "none",

                boxShadow:
                  "none",

                border:
                  "none",

                borderBottom:
                  "none",
              }}
            />


            <div
              className="
                flex
                items-center
                justify-end
                gap-2

                px-3
                pb-3
              "
            >
              <button
                type="button"
                onClick={
                  cancelEditing
                }
                disabled={
                  saving
                }
                className="
                  inline-flex
                  h-8
                  items-center
                  justify-center
                  gap-1.5

                  rounded-full

                  border-0
                  bg-transparent

                  px-3

                  text-[11px]
                  font-medium
                  text-white/50

                  !outline-none

                  transition-colors

                  hover:bg-white/[0.06]
                  hover:text-white/80

                  focus:!outline-none
                  focus-visible:!outline-none
                  focus-visible:!ring-0

                  disabled:opacity-40
                "
              >
                <X
                  size={13}
                  strokeWidth={1.8}
                />

                <span>
                  Cancel
                </span>
              </button>


              <button
                type="button"
                onClick={() => {
                  void saveEdit();
                }}
                disabled={
                  saving ||
                  !draft.trim()
                }
                className="
                  inline-flex
                  h-8
                  min-w-[70px]
                  items-center
                  justify-center
                  gap-1.5

                  rounded-full

                  border
                  border-white/[0.08]

                  bg-white/[0.10]

                  px-3.5

                  text-[11px]
                  font-medium
                  text-white/80

                  !outline-none

                  transition-colors

                  hover:bg-white/[0.16]
                  hover:text-white

                  focus:!outline-none
                  focus-visible:!outline-none
                  focus-visible:!ring-0

                  disabled:cursor-not-allowed
                  disabled:opacity-35
                "
              >
                {saving ? (
                  <span>
                    Saving…
                  </span>
                ) : (
                  <>
                    <Check
                      size={13}
                      strokeWidth={2}
                    />

                    <span>
                      Save
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>


          <p
            className="
              mt-1.5
              pr-2

              text-right
              text-[9px]
              text-white/20
            "
          >
            Enter to save · Shift + Enter for new line · Esc to cancel
          </p>
        </div>
      </div>
    );
  }


  /* ==========================================================
     NORMAL MESSAGE
     ========================================================== */

  return (
    <div
      className={`
        group/message

        flex
        w-full

        ${
          isUser
            ? "justify-end"
            : "justify-start"
        }
      `}
    >
      <div
        className={`
          min-w-0

          ${
            isUser
              ? "max-w-[92%] sm:max-w-[78%] lg:max-w-[72%]"
              : "w-full"
          }
        `}
      >
        {/* ==================================================
            CONTENT
            ================================================== */}

        {isUser ? (
          <div
            className="
              break-words
              whitespace-pre-wrap

              rounded-[24px]

              bg-[#2f2f2f]

              px-4
              py-2.5

              text-[15px]
              leading-7
              text-white
            "
          >
            {message.content}
          </div>
        ) : (
          <AssistantMarkdown
            content={
              displayedContent
            }
          />
        )}


        {/* ==================================================
            ACTIONS
            ================================================== */}

        {!isStreaming && (
          <>
            <div
              className={`
                mt-1

                flex
                h-8
                items-center
                gap-0.5

                transition-opacity
                duration-150

                ${
                  !isUser &&
                  (
                    feedbackRating ||
                    feedbackOpen
                  )
                    ? "opacity-100"
                    : "opacity-0 group-hover/message:opacity-100 focus-within:opacity-100"
                }

                ${
                  isUser
                    ? "justify-end pr-1"
                    : "justify-start"
                }
              `}
            >
              <MessageAction
                label={
                  copied
                    ? "Copied"
                    : "Copy"
                }
                onClick={
                  handleCopy
                }
              >
                {copied ? (
                  <Check
                    size={13}
                    strokeWidth={1.9}
                  />
                ) : (
                  <Copy
                    size={13}
                    strokeWidth={1.7}
                  />
                )}
              </MessageAction>


              {isUser ? (
                <MessageAction
                  label="Edit message"
                  disabled={sending}
                  onClick={
                    startEditing
                  }
                >
                  <Pencil
                    size={13}
                    strokeWidth={1.7}
                  />
                </MessageAction>
              ) : (
                <>
                  <MessageAction
                    label="Good response"
                    active={
                      feedbackRating ===
                      "up"
                    }
                    disabled={
                      feedbackSubmitting
                    }
                    onClick={() => {
                      void submitPositiveFeedback();
                    }}
                  >
                    <ThumbsUp
                      size={13}
                      strokeWidth={1.7}
                    />
                  </MessageAction>

                  <MessageAction
                    label="Bad response"
                    active={
                      feedbackRating ===
                      "down"
                    }
                    disabled={
                      feedbackSubmitting
                    }
                    onClick={
                      openNegativeFeedback
                    }
                  >
                    <ThumbsDown
                      size={13}
                      strokeWidth={1.7}
                    />
                  </MessageAction>
                </>
              )}
            </div>

            {!isUser &&
              feedbackOpen && (
              <div
                className="
                  mt-2
                  max-w-xl
                  rounded-2xl
                  border
                  border-white/[0.08]
                  bg-white/[0.025]
                  p-3
                "
              >
                <p
                  className="
                    text-xs
                    font-medium
                    text-white/65
                  "
                >
                  What went wrong?
                </p>

                <div
                  className="
                    mt-2
                    flex
                    flex-wrap
                    gap-1.5
                  "
                >
                  {FEEDBACK_REASONS.map(
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
                  placeholder="What should DeepResearch have done instead? (optional)"
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
            )}

            {!isUser &&
              feedbackError &&
              !feedbackOpen && (
              <p
                className="
                  mt-1
                  text-[11px]
                  text-red-300/75
                "
              >
                {feedbackError}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}


/* ============================================================
   ASSISTANT MARKDOWN
   ============================================================ */

function AssistantMarkdown({
  content,
}: {
  content: string;
}) {

  return (
    <div
      className="
        w-full
        min-w-0

        py-1
        pr-8

        text-[15px]
        leading-7
        text-white/90
      "
    >
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
        ]}
        components={{
          p: ({
            children,
          }) => (
            <p
              className="
                my-2
                first:mt-0
                last:mb-0
              "
            >
              {children}
            </p>
          ),

          strong: ({
            children,
          }) => (
            <strong
              className="
                font-semibold
                text-white
              "
            >
              {children}
            </strong>
          ),

          em: ({
            children,
          }) => (
            <em
              className="
                italic
                text-white/85
              "
            >
              {children}
            </em>
          ),

          ul: ({
            children,
          }) => (
            <ul
              className="
                my-2
                list-disc
                space-y-1

                pl-6
              "
            >
              {children}
            </ul>
          ),

          ol: ({
            children,
          }) => (
            <ol
              className="
                my-2
                list-decimal
                space-y-1

                pl-6
              "
            >
              {children}
            </ol>
          ),

          li: ({
            children,
          }) => (
            <li
              className="
                pl-1
              "
            >
              {children}
            </li>
          ),

          h1: ({
            children,
          }) => (
            <h1
              className="
                mb-3
                mt-5

                text-[22px]
                font-semibold
                leading-8
                text-white

                first:mt-0
              "
            >
              {children}
            </h1>
          ),

          h2: ({
            children,
          }) => (
            <h2
              className="
                mb-2
                mt-5

                text-[19px]
                font-semibold
                leading-7
                text-white

                first:mt-0
              "
            >
              {children}
            </h2>
          ),

          h3: ({
            children,
          }) => (
            <h3
              className="
                mb-2
                mt-4

                text-[16px]
                font-semibold
                leading-7
                text-white

                first:mt-0
              "
            >
              {children}
            </h3>
          ),

          blockquote: ({
            children,
          }) => (
            <blockquote
              className="
                my-3

                border-l-2
                border-white/20

                pl-4

                text-white/65
              "
            >
              {children}
            </blockquote>
          ),

          code: ({
            children,
            className,
          }) => {
            if (
              typeof className ===
                "string" &&
              className.startsWith(
                "language-"
              )
            ) {
              return (
                <code
                  className={
                    className
                  }
                >
                  {children}
                </code>
              );
            }

            return (
              <code
                className="
                  rounded-md

                  bg-white/[0.08]

                  px-1.5
                  py-0.5

                  font-mono
                  text-[13px]
                  text-white/90
                "
              >
                {children}
              </code>
            );
          },

          pre: ({
            children,
          }) => {
            const child =
              Array.isArray(
                children
              )
                ? children[0]
                : children;

            if (
              isValidElement(
                child
              )
            ) {
              const props =
                child.props as {
                  className?: string;
                  children?:
                    ReactNode;
                };

              const className =
                props.className ??
                "";

              const language =
                className.startsWith(
                  "language-"
                )
                  ? className.slice(
                      "language-"
                      .length
                    )
                  : "code";

              const code =
                String(
                  props.children ??
                  ""
                ).replace(
                  /\n$/,
                  ""
                );

              return (
                <CodeCard
                  code={code}
                  language={
                    language
                  }
                />
              );
            }

            return (
              <pre
                className="
                  my-3
                  overflow-x-auto
                  rounded-2xl
                  border
                  border-white/[0.08]
                  bg-[#151515]
                  p-4
                  text-[13px]
                  leading-6
                "
              >
                {children}
              </pre>
            );
          },

          a: ({
            children,
            href,
          }) => (
            <a
              href={
                href
              }
              target="_blank"
              rel="noreferrer"
              className="
                text-white
                underline

                decoration-white/30
                underline-offset-4

                transition-colors

                hover:decoration-white/70
              "
            >
              {children}
            </a>
          ),

          hr: () => (
            <hr
              className="
                my-5
                border-white/[0.10]
              "
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}


/* ============================================================
   CODE CARD
   ============================================================ */

function CodeCard({
  code,
  language,
}: {
  code: string;
  language: string;
}) {

  const [
    copied,
    setCopied,
  ] =
    useState(false);


  async function copyCode() {
    try {
      await navigator
        .clipboard
        .writeText(
          code
        );

      setCopied(
        true
      );

      window.setTimeout(
        () => {
          setCopied(
            false
          );
        },
        1400
      );

    } catch (
      error
    ) {
      console.error(
        "Failed to copy code:",
        error
      );
    }
  }


  return (
    <div
      className="
        my-4
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.09]
        bg-[#111111]
        shadow-[0_12px_36px_rgba(0,0,0,0.18)]
      "
    >
      <div
        className="
          flex
          h-10
          items-center
          justify-between
          border-b
          border-white/[0.07]
          bg-white/[0.025]
          px-4
        "
      >
        <span
          className="
            font-mono
            text-[11px]
            lowercase
            tracking-wide
            text-white/38
          "
        >
          {language}
        </span>

        <button
          type="button"
          onClick={() => {
            void copyCode();
          }}
          className="
            inline-flex
            h-7
            items-center
            gap-1.5
            rounded-lg
            px-2
            text-[11px]
            text-white/42
            transition
            hover:bg-white/[0.06]
            hover:text-white/80
            focus:outline-none
            focus-visible:ring-1
            focus-visible:ring-white/20
          "
        >
          {copied ? (
            <Check
              size={13}
              strokeWidth={1.9}
            />
          ) : (
            <Copy
              size={13}
              strokeWidth={1.7}
            />
          )}

          <span>
            {copied
              ? "Copied"
              : "Copy code"}
          </span>
        </button>
      </div>

      <pre
        className="
          overflow-x-auto
          px-4
          py-4
          text-[13px]
          leading-6
          text-white/88
          [tab-size:2]
        "
      >
        <code
          className="
            font-mono
          "
        >
          {code}
        </code>
      </pre>
    </div>
  );
}


/* ============================================================
   MESSAGE ACTION
   ============================================================ */

function MessageAction({
  children,
  label,
  disabled = false,
  active = false,
  onClick,
}: {
  children: ReactNode;

  label: string;

  disabled?: boolean;

  active?: boolean;

  onClick: () => void;
}) {

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`
        flex
        h-7
        w-7
        items-center
        justify-center

        rounded-full

        border-0

        !outline-none

        transition-colors

        hover:bg-white/[0.055]
        hover:text-white/70

        focus:!outline-none
        focus-visible:!outline-none
        focus-visible:!ring-0

        disabled:cursor-not-allowed
        disabled:opacity-25

        ${
          active
            ? "bg-white/[0.07] text-white/78"
            : "bg-transparent text-white/28"
        }
      `}
    >
      {children}
    </button>
  );
}


/* ============================================================
   TEXTAREA RESIZE
   ============================================================ */

function resizeTextarea(
  textarea:
    HTMLTextAreaElement
) {

  textarea.style.height =
    "0px";


  textarea.style.height =
    `${Math.min(
      textarea.scrollHeight,
      220
    )}px`;
}