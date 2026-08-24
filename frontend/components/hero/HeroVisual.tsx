"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  Search,
  ShieldCheck,
  FileText,
  Globe,
  Database,
  FileSearch,
  CheckCircle2,
} from "lucide-react";

import FloatingCard from "./FloatingCard";

const agents = [
  {
    icon: BrainCircuit,
    name: "Planner",
    status: "Completed",
    color: "bg-emerald-400",
  },
  {
    icon: Search,
    name: "Searcher",
    status: "Searching...",
    color: "bg-cyan-400",
  },
  {
    icon: ShieldCheck,
    name: "Verifier",
    status: "Waiting",
    color: "bg-orange-400",
  },
  {
    icon: FileText,
    name: "Writer",
    status: "Idle",
    color: "bg-slate-500",
  },
];

export default function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9 }}
      className="relative mx-auto w-full max-w-[560px]"
    >
      <FloatingCard
        icon={Globe}
        title="Sources"
        value="127 Found"
        className="-left-35 top-8 hidden xl:block"
      />

      <FloatingCard
        icon={Database}
        title="Knowledge"
        value="18 GB"
        className="-right-24 top-24 hidden xl:block"
      />

      <FloatingCard
        icon={FileSearch}
        title="Confidence"
        value="98.4%"
        className="-left-25 bottom-18 hidden xl:block"
      />

      <div className="rounded-[34px] border border-white/10 bg-[#0b1118] p-8 shadow-[0_20px_80px_rgba(0,0,0,.45)]">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-slate-500">
              DeepResearch Engine
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Autonomous Workflow
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2">

            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />

            <span className="text-sm text-emerald-400">
              Online
            </span>

          </div>

        </div>

        <div className="mt-10 space-y-5">

          {agents.map((agent, index) => {

            const Icon = agent.icon;

            return (

              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition hover:border-cyan-400/20 hover:bg-white/[0.05]"
              >

                <div className="flex items-center gap-4">

                  <div className="rounded-xl bg-cyan-500/10 p-3">

                    <Icon
                      className="text-cyan-400"
                      size={22}
                    />

                  </div>

                  <div>

                    <h3 className="font-semibold">

                      {agent.name}

                    </h3>

                    <p className="text-sm text-slate-500">

                      {agent.status}

                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <div
                    className={`h-2.5 w-2.5 rounded-full ${agent.color}`}
                  />

                  {agent.status === "Completed" && (
                    <CheckCircle2
                      size={18}
                      className="text-emerald-400"
                    />
                  )}

                </div>

              </motion.div>

            );

          })}

        </div>

        <div className="mt-10">

          <div className="mb-3 flex justify-between text-sm">

            <span className="text-slate-400">

              Research Progress

            </span>

            <span className="font-semibold">

              72%

            </span>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/10">

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "72%" }}
              transition={{
                duration: 2,
              }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-300"
            />

          </div>

        </div>

      </div>
    </motion.div>
  );
}