"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HeroButtons() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="mt-14 flex flex-wrap items-center justify-center gap-5"
    >
      {/* Start Research */}

      <button
        onClick={() => router.push("/workspace")}
        className="group flex h-14 items-center gap-3 rounded-2xl bg-cyan-500 px-8 font-semibold text-black shadow-[0_0_35px_rgba(34,211,238,.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-400 hover:shadow-[0_0_50px_rgba(34,211,238,.45)]"
      >
        Start Research

        <ArrowRight
          size={18}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </button>

      {/* Watch Demo */}

      <Link
        href="/watch-demo"
        className="group flex h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 text-slate-200 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
      >
        <Play
          size={16}
          className="transition-transform duration-300 group-hover:scale-110"
        />

        Watch Demo
      </Link>
    </motion.div>
  );
}