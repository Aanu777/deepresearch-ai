"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  value: string;
  className?: string;
};

export default function FloatingCard({
  icon: Icon,
  title,
  value,
  className = "",
}: Props) {
  return (
    <motion.div
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute rounded-2xl border border-white/10 bg-[#0d131d]/95 backdrop-blur-md p-4 shadow-2xl ${className}`}
    >
      <div className="flex items-center gap-3">

        <div className="rounded-xl bg-cyan-500/10 p-3">
          <Icon
            size={18}
            className="text-cyan-400"
          />
        </div>

        <div>

          <p className="text-xs text-slate-500">
            {title}
          </p>

          <h4 className="mt-1 font-semibold">
            {value}
          </h4>

        </div>

      </div>
    </motion.div>
  );
}