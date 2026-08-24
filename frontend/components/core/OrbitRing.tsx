"use client";

import { motion } from "framer-motion";

type OrbitRingProps = {
  size: number;
  duration: number;
  reverse?: boolean;
};

export default function OrbitRing({
  size,
  duration,
  reverse = false,
}: OrbitRingProps) {
  return (
    <motion.div
      animate={{
        rotate: reverse ? -360 : 360,
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
      className="absolute rounded-full border border-cyan-400/20"
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Energy Node */}
      <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,.8)]" />
    </motion.div>
  );
}