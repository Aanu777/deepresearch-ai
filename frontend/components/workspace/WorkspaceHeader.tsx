"use client";

import {
  BrainCircuit,
  UserCircle2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

export default function WorkspaceHeader() {
  const [userName, setUserName] =
    useState("User");

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const supabase =
          createClient();

        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!mounted || !user) {
          return;
        }

        const metadata =
          user.user_metadata ?? {};

        const name =
          metadata.username ||
          metadata.full_name ||
          metadata.name ||
          metadata.user_name ||
          user.email?.split("@")[0] ||
          "User";

        setUserName(name);
      } catch (error) {
        console.error(
          "Failed to load current user:",
          error
        );
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070B]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10">

            <BrainCircuit
              size={24}
              className="text-cyan-400"
            />

          </div>

          <div>

            <h1 className="text-lg font-semibold">
              DeepResearch
            </h1>

            <p className="text-sm text-slate-400">
              Autonomous Research Workspace
            </p>

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center gap-3">


          <button className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0B1118] px-3 py-2 transition hover:border-cyan-400/30">

            <UserCircle2
              size={34}
              className="text-cyan-400"
            />

            <div className="text-left">

              <p className="text-sm font-medium">
                {userName}
              </p>

              <p className="text-xs text-slate-400">
                Researcher
              </p>

            </div>

          </button>

        </div>

      </div>
    </header>
  );
}