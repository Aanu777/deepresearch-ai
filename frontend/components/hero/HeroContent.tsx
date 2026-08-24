"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HeroContent() {
  return (
    <motion.div
       className="relative mx-auto w-full max-w-[560px]"
    >

      <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm font-medium text-cyan-300">

        ✦ Multi-Agent Research Platform

      </div>

      <h1 className="mt-8 text-6xl font-black leading-[0.95] xl:text-7xl">

        Research

        <br />

        at the Speed

        <br />

        <span className="bg-gradient-to-r from-white via-cyan-300 to-blue-500 bg-clip-text text-transparent">

          of Thought

        </span>

      </h1>

      <p className="mt-8 max-w-xl text-lg leading-8 text-slate-400">

        DeepResearch orchestrates multiple AI agents
        that search, reason, verify and synthesize
        information into trustworthy reports.

      </p>

      <div className="mt-12 flex gap-5">

        <button className="flex h-14 items-center gap-3 rounded-xl bg-cyan-500 px-8 font-semibold text-black transition hover:scale-105">

          Start Research

          <ArrowRight size={18} />

        </button>

        <button className="h-14 rounded-xl border border-white/10 px-8 hover:bg-white/5">

          Watch Demo

        </button>

      </div>

      <div className="mt-14 flex flex-wrap gap-12">

        <div>

          <h3 className="text-3xl font-bold">

            5

          </h3>

          <p className="text-slate-500">

            AI Agents

          </p>

        </div>

        <div>

          <h3 className="text-3xl font-bold">

            100+

          </h3>

          <p className="text-slate-500">

            Sources

          </p>

        </div>

        <div>

          <h3 className="text-3xl font-bold">

            &lt;2 min

          </h3>

          <p className="text-slate-500">

            Avg Report

          </p>

        </div>

      </div>

    </motion.div>
  );
}