"use client";

import EnergySphere from "./EnergySphere";
import { useResearch } from "@/components/context/ResearchContext";

export default function AICore() {
  const { job } = useResearch();

  const status = job?.status ?? "idle";
  const step = job?.current_step ?? "Waiting for research...";
  const progress = job?.progress ?? 0;

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0B1118] p-8">

      <div className="flex flex-col items-center">

        <EnergySphere status={status} />

        <h2 className="mt-10 text-2xl font-bold">
          DeepResearch AI
        </h2>

        <p className="mt-3 text-center text-slate-400">
          {step}
        </p>

        <div className="mt-8 h-3 w-full overflow-hidden rounded-full bg-white/5">

          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        <p className="mt-3 text-cyan-300">
          {progress}% Complete
        </p>

      </div>

    </section>
  );
}