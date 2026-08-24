"use client";

import { motion } from "framer-motion";
import {
  Search,
  BrainCircuit,
  ShieldCheck,
  FileText,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search",
    text: "AI gathers trusted information from multiple sources.",
  },
  {
    icon: BrainCircuit,
    title: "Reason",
    text: "Specialized agents analyze and verify every result.",
  },
  {
    icon: ShieldCheck,
    title: "Validate",
    text: "Claims are cross-checked before synthesis.",
  },
  {
    icon: FileText,
    title: "Generate",
    text: "A professional report is produced with citations.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 py-32">

      {/* ====================================================== */}
      {/* BACKGROUND */}
      {/* ====================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-[500px]
            w-[900px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-cyan-500/[0.035]
            blur-[150px]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.025]
            [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
            [background-size:64px_64px]
          "
        />

      </div>


      {/* ====================================================== */}
      {/* CENTERED CONTENT CONTAINER */}
      {/* ====================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 lg:px-10">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          viewport={{
            once: true,
            margin: "-100px",
          }}
          className="mx-auto max-w-4xl text-center"
        >

          <div className="mb-5 flex items-center justify-center gap-3">

            <div className="h-px w-8 bg-cyan-400" />

            <p className="text-xs font-semibold tracking-[0.25em] text-cyan-400">
              HOW IT WORKS
            </p>

            <div className="h-px w-8 bg-cyan-400" />

          </div>

          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Autonomous agents
            <span className="block text-slate-500">
              working together.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
            Every research request passes through a collaborative AI workflow
            instead of relying on a single model.
          </p>

        </motion.div>


        {/* ================================================== */}
        {/* PIPELINE */}
        {/* ================================================== */}

        <div className="relative mx-auto mt-20 max-w-[1280px]">

          {/* Desktop connection line */}

          <div
            className="
              pointer-events-none
              absolute
              left-[12.5%]
              right-[12.5%]
              top-[58px]
              hidden
              h-px
              bg-gradient-to-r
              from-transparent
              via-cyan-400/30
              to-transparent
              xl:block
            "
          />

          {/* Animated signal */}

          <motion.div
            initial={{
              left: "12.5%",
              opacity: 0,
            }}
            whileInView={{
              left: "87.5%",
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 2.8,
              delay: 0.4,
              ease: "easeInOut",
            }}
            viewport={{
              once: true,
            }}
            className="
              pointer-events-none
              absolute
              top-[55px]
              hidden
              h-[7px]
              w-[7px]
              -translate-x-1/2
              rounded-full
              bg-cyan-300
              shadow-[0_0_16px_rgba(34,211,238,0.9)]
              xl:block
            "
          />


          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {steps.map((step, i) => {

              const Icon = step.icon;

              return (
                <motion.div
                  key={step.title}
                  initial={{
                    opacity: 0,
                    y: 40,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.65,
                    delay: i * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  viewport={{
                    once: true,
                    margin: "-80px",
                  }}
                  whileHover={{
                    y: -8,
                  }}
                  className="group relative"
                >

                  {/* Number */}

                  <div
                    className="
                      absolute
                      right-6
                      top-6
                      text-xs
                      font-semibold
                      tracking-widest
                      text-slate-700
                      transition
                      duration-300
                      group-hover:text-cyan-400/40
                    "
                  >
                    0{i + 1}
                  </div>


                  {/* Card */}

                  <div
                    className="
                      relative
                      h-full
                      overflow-hidden
                      rounded-3xl
                      border
                      border-white/[0.08]
                      bg-white/[0.025]
                      p-7
                      backdrop-blur-sm
                      transition-all
                      duration-500
                      group-hover:border-cyan-400/20
                      group-hover:bg-white/[0.045]
                      group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)]
                    "
                  >

                    {/* Hover glow */}

                    <div
                      className="
                        pointer-events-none
                        absolute
                        -right-16
                        -top-16
                        h-32
                        w-32
                        rounded-full
                        bg-cyan-400/0
                        blur-3xl
                        transition-all
                        duration-500
                        group-hover:bg-cyan-400/10
                      "
                    />


                    {/* Icon */}

                    <div
                      className="
                        relative
                        mb-8
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-cyan-400/10
                        bg-cyan-400/[0.07]
                        transition-all
                        duration-500
                        group-hover:border-cyan-400/25
                        group-hover:bg-cyan-400/[0.12]
                        group-hover:shadow-[0_0_30px_rgba(34,211,238,0.12)]
                      "
                    >
                      <Icon
                        size={25}
                        strokeWidth={1.8}
                        className="
                          text-cyan-400
                          transition-transform
                          duration-500
                          group-hover:scale-110
                        "
                      />
                    </div>


                    {/* Content */}

                    <h3 className="text-xl font-semibold tracking-tight text-white">
                      {step.title}
                    </h3>

                    <p className="mt-4 leading-7 text-slate-400">
                      {step.text}
                    </p>


                    {/* Bottom indicator */}

                    <div className="mt-8 flex items-center gap-2 text-xs font-medium text-slate-600 transition-colors duration-300 group-hover:text-cyan-400/70">

                      <span>
                        Stage {i + 1}
                      </span>

                      {i < steps.length - 1 && (
                        <ArrowRight
                          size={13}
                          className="
                            transition-transform
                            duration-300
                            group-hover:translate-x-1
                          "
                        />
                      )}

                    </div>

                  </div>

                </motion.div>
              );
            })}

          </div>

        </div>

      </div>

    </section>
  );
}