"use client";

import { motion } from "framer-motion";

export default function Background() {
  return (
    <>
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          x: [-40, 30, -40],
          y: [-20, 20, -20],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
        }}
        className="fixed w-[700px] h-[700px] rounded-full blur-3xl opacity-20 bg-blue-500 -top-56 -left-56"
      />

      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          x: [40, -20, 40],
          y: [20, -20, 20],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
        }}
        className="fixed w-[650px] h-[650px] rounded-full blur-3xl opacity-20 bg-purple-500 top-0 right-[-200px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
        }}
        className="fixed w-[500px] h-[500px] rounded-full blur-3xl opacity-10 bg-orange-500 bottom-[-120px] left-1/2"
      />
    </>
  );
}