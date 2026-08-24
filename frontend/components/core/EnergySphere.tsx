"use client";

import OrbitRing from "./OrbitRing";

import { motion } from "framer-motion";

type Props = {
  status?: string;
};

export default function EnergySphere({
  status = "idle",
}: Props) {
  const colors = {
    idle: "from-cyan-400 to-blue-500",
    planning: "from-sky-400 to-blue-500",
    searching: "from-cyan-300 to-cyan-500",
    reflecting: "from-violet-400 to-fuchsia-500",
    writing: "from-amber-300 to-orange-500",
    completed: "from-emerald-400 to-green-500",
  };

  const gradient =
    colors[status as keyof typeof colors] ??
    colors.idle;

  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="relative flex items-center justify-center"
    >

        <OrbitRing
  size={190}
  duration={16}
/>

<OrbitRing
  size={235}
  duration={24}
  reverse
/>
      {/* Glow */}

      <motion.div
        animate={{
          opacity: [0.25, 0.6, 0.25],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
        className={`absolute h-56 w-56 rounded-full blur-3xl bg-gradient-to-r ${gradient}`}
      />

      {/* Outer shell */}

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute h-44 w-44 rounded-full border border-cyan-400/20"
      />

      {/* Core */}

      <motion.div
        animate={{
          boxShadow: [
            "0 0 30px rgba(34,211,238,.35)",
            "0 0 80px rgba(34,211,238,.9)",
            "0 0 30px rgba(34,211,238,.35)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
        className={`relative h-36 w-36 rounded-full bg-gradient-to-br ${gradient}`}
      />
    </motion.div>
  );
}