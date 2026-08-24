
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-28 lg:py-36">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/[0.045] blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Explicitly centered container */}
      <div className="mx-auto w-full max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#0B1118] px-6 py-16 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:px-10 lg:px-20 lg:py-20"
        >
          {/* Top accent line */}
          <div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

          {/* Subtle glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-cyan-400/[0.07] blur-[100px]" />

          {/* Centered content */}
          <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
            {/* Eyebrow */}
            <div className="mb-7 inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-sm font-medium text-slate-400">
              <Sparkles
                size={15}
                className="text-cyan-400"
              />

              <span>Start researching smarter</span>
            </div>

            {/* Heading */}
            <h2 className="w-full text-center text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
              Turn questions into
              <span className="block bg-gradient-to-r from-cyan-300 via-white to-slate-300 bg-clip-text text-transparent">
                knowledge you can trust.
              </span>
            </h2>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              DeepResearch brings autonomous search, reasoning,
              verification, and synthesis together to produce
              research you can actually use.
            </p>

            {/* Actions */}
            <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/workspace"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 text-sm font-semibold text-[#05070B] shadow-[0_8px_30px_rgba(34,211,238,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-[0_12px_35px_rgba(34,211,238,0.2)]"
              >
                Start Research

                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/docs"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.02] px-6 text-sm font-medium text-slate-200 transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.05]"
              >
                Explore the Docs
              </Link>
            </div>

            {/* Trust points */}
            <div className="mt-12 flex w-full flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center text-sm text-slate-500">
              <span className="flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Multi-Agent Research
              </span>

              <span className="flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Verified Sources
              </span>

              <span className="flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Structured Reports
              </span>

              <span className="flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Built for Deep Research
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
