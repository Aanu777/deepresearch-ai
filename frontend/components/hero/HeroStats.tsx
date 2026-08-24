"use client";

import { motion } from "framer-motion";

const stats = [
  {
    value: "5",
    label: "AI Agents",
  },
  {
    value: "127+",
    label: "Trusted Sources",
  },
  {
    value: "<2 min",
    label: "Average Report",
  },
];

export default function HeroStats() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.55 }}
      className="mt-16 flex flex-wrap items-center justify-center gap-16"
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="text-center"
        >
          <h3 className="text-4xl font-bold text-white">

            {stat.value}

          </h3>

          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-slate-500">

            {stat.label}

          </p>
        </div>
      ))}
    </motion.div>
  );
}