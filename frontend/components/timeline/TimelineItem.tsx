"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

type Props = {
  title: string;
  description: string;
  completed?: boolean;
};

export default function TimelineItem({
  title,
  description,
  completed,
}: Props) {
  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        x: -15,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      className="flex gap-4"
    >
      <div className="mt-1">

        {completed ? (
          <CheckCircle2
            className="text-emerald-400"
            size={18}
          />
        ) : (
          <Loader2
            className="animate-spin text-cyan-400"
            size={18}
          />
        )}

      </div>

      <div className="flex-1">

        <h4 className="font-medium">
          {title}
        </h4>

        <p className="mt-1 text-sm text-slate-400">
          {description}
        </p>

      </div>

    </motion.div>
  );
}