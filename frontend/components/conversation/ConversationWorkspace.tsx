"use client";

import ConversationHeader from "./ConversationHeader";
import MessageList from "./MessageList";
import ConversationComposer from "./ConversationComposer";

export default function ConversationWorkspace() {
  return (
    <main
      className="
        flex
        h-[100dvh]
        min-h-0
        w-full
        min-w-0
        flex-col
        overflow-hidden
        overscroll-none
        bg-[#050505]
        text-white
      "
    >
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div
        className="
          relative
          z-30
          min-w-0
          shrink-0
        "
      >
        <ConversationHeader />
      </div>

      {/* ====================================================
          CONVERSATION
      ==================================================== */}

      <div
        className="
          flex
          min-h-0
          min-w-0
          flex-1
          flex-col
          overflow-hidden
        "
      >
        {/* ==================================================
            MESSAGE SCROLLER
        ================================================== */}

        <div
          className="
            flex
            min-h-0
            min-w-0
            flex-1
            flex-col
            overflow-hidden
          "
        >
          <MessageList />
        </div>

        {/* ==================================================
            COMPOSER
        ================================================== */}

        <div
          className="
            relative
            z-20
            w-full
            min-w-0
            shrink-0

            bg-[#050505]

            pb-[env(safe-area-inset-bottom)]
          "
        >
          {/* ================================================
              TOP FADE
          ================================================ */}

          <div
            className="
              pointer-events-none

              absolute
              inset-x-0
              -top-8

              h-8

              bg-gradient-to-t
              from-[#050505]
              to-transparent

              sm:-top-12
              sm:h-12
            "
          />

          <ConversationComposer />
        </div>
      </div>
    </main>
  );
}