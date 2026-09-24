
"use client";

import {
  motion,
} from "framer-motion";

import {
  ArrowRight,
  BrainCircuit,
} from "lucide-react";

import Link from "next/link";

export default function CTA() {
  return (
    <>
      <section
        className="
          bg-[#050505]
          px-4
          py-24
          sm:px-6
          sm:py-28
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: "-80px",
          }}
          transition={{
            duration: 0.5,
          }}
          className="
            relative
            mx-auto
            max-w-[1100px]
            overflow-hidden
            rounded-3xl
            border
            border-white/[0.08]
            bg-[#101010]
            px-6
            py-14
            sm:px-10
            sm:py-16
            lg:px-16
          "
        >
          {/* SUBTLE ACCENT */}

          <div
            className="
              pointer-events-none
              absolute
              right-[-160px]
              top-[-200px]
              h-[420px]
              w-[420px]
              rounded-full
              bg-cyan-400/[0.035]
              blur-[100px]
            "
          />

          <div
            className="
              relative
              grid
              gap-10
              lg:grid-cols-[1fr_auto]
              lg:items-end
            "
          >
            <div>
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                "
              >
                <BrainCircuit
                  size={16}
                  className="text-cyan-300"
                />
              </div>

              <h2
                className="
                  mt-7
                  max-w-2xl
                  text-3xl
                  font-semibold
                  tracking-[-0.045em]
                  text-white
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                Start with a question.
                <span
                  className="
                    block
                    text-white/35
                  "
                >
                  Leave with research.
                </span>
              </h2>

              <p
                className="
                  mt-4
                  max-w-xl
                  text-sm
                  leading-7
                  text-white/32
                "
              >
                Use DeepResearch when a quick answer is not enough,
                or switch to Conversation when it is.
              </p>
            </div>

            {/* ACTIONS */}

            <div
              className="
                flex
                flex-col
                gap-2
                sm:flex-row
                lg:flex-col
              "
            >
              <Link
                href="/workspace"
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-5
                  text-sm
                  font-semibold
                  !text-black
                  transition-colors
                  hover:bg-white/85
                "
              >
                Start research

                <ArrowRight
                  size={15}
                />
              </Link>

              <Link
                href="/conversation"
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/[0.08]
                  bg-white/[0.025]
                  px-5
                  text-sm
                  font-medium
                  text-white/50
                  transition-colors
                  hover:bg-white/[0.05]
                  hover:text-white/80
                "
              >
                Open conversation
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}

      <footer
        className="
          border-t
          border-white/[0.06]
          bg-[#050505]
        "
      >
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-[1200px]
            flex-col
            gap-4
            px-4
            py-6
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-6
            lg:px-8
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
                h-1.5
                w-1.5
                rounded-full
                bg-cyan-400
              "
            />

            <span
              className="
                text-xs
                font-medium
                text-white/30
              "
            >
              DeepResearch
            </span>
          </div>

          <p
            className="
              text-[11px]
              text-white/18
            "
          >
            Autonomous research with traceable sources.
          </p>
        </div>
      </footer>
    </>
  );
}