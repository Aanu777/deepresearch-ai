"use client";

import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";
import Link from "next/link";

import Container from "@/components/ui/Container";

const links = [
  {
    name: "Features",
    href: "#features",
  },
  {
    name: "Architecture",
    href: "#architecture",
  },
  {
    name: "Research",
    href: "#research",
  },
  {
    name: "Docs",
    href: "#docs",
  },
];

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.7,
        ease: "easeOut",
      }}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#06070b]/80 backdrop-blur-xl"
    >
      <Container>
        <div className="flex h-20 items-center justify-between">

          {/* Logo */}

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400 text-black">

              <BrainCircuit size={20} />

            </div>

            <div>

              <h2 className="text-lg font-bold tracking-tight">
                DeepResearch
              </h2>

              <p className="-mt-1 text-xs text-slate-500">
                Autonomous AI
              </p>

            </div>

          </div>

          {/* Navigation */}

          <nav className="hidden items-center gap-10 lg:flex">

            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-400 transition hover:text-white"
              >
                {link.name}
              </a>
            ))}

          </nav>

          {/* Right */}

          <div className="flex items-center gap-4">

            <Link
              href="/login"
              className="hidden text-sm font-medium text-slate-400 transition hover:text-white md:block"
            >
              Sign In
            </Link>

          </div>

        </div>
      </Container>
    </motion.header>
  );
}