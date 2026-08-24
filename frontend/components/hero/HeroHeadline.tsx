"use client";

import { motion } from "framer-motion";

export default function HeroHeadline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="mt-10 flex flex-col items-center"
    >
      <h1 className="max-w-5xl text-center text-6xl font-black leading-[0.9] tracking-[-0.05em] text-white md:text-7xl xl:text-8xl">

        Research

        <br />

        <span className="bg-gradient-to-r from-white via-cyan-300 to-blue-400 bg-clip-text text-transparent">

          at the speed

        </span>

        <br />

        of autonomous intelligence

      </h1>

      <p className="mt-10 max-w-3xl text-center text-xl leading-9 text-slate-400">

        DeepResearch coordinates multiple specialized AI agents
        that search, reason, verify and synthesize knowledge into
        professional research reports with transparent citations.

      </p>
    </motion.div>
  );
}