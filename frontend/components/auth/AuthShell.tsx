"use client";

import { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthShell({
  children,
  title,
  subtitle,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#050608] text-white">
      <div className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-[420px]">
          {/* BRAND */}

          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08]">
              <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.55)]" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              DeepResearch
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {subtitle}
            </p>
          </div>

          {/* CARD */}

          <div className="rounded-2xl border border-white/[0.08] bg-[#0b0d12] p-7 shadow-2xl shadow-black/30">
            <h2 className="text-xl font-semibold">
              {title}
            </h2>

            <div className="mt-6">
              {children}
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] leading-5 text-slate-600">
            By continuing, you agree to the
            DeepResearch terms and privacy
            policy.
          </p>
        </div>
      </div>
    </main>
  );
}