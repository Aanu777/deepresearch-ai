"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  CircleUserRound,
} from "lucide-react";

import {
  createClient,
} from "@/lib/supabase/client";

import {
  Badge,
  IconButton,
} from "@/components/ui";

export default function WorkspaceHeader() {
  const [
    userName,
    setUserName,
  ] = useState("User");

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const supabase =
          createClient();

        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        if (
          !mounted ||
          !user
        ) {
          return;
        }

        const metadata =
          user.user_metadata ??
          {};

        const name =
          metadata.username ||
          metadata.full_name ||
          metadata.name ||
          metadata.user_name ||
          user.email?.split(
            "@"
          )[0] ||
          "User";

        setUserName(
          name
        );
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
    <header
      className="
        sticky
        top-0
        z-40
        border-b
        border-white/[0.06]
        bg-[var(--dr-bg)]/90
        backdrop-blur-xl
      "
    >
      <div
        className="
          mx-auto
          flex
          h-14
          w-full
          max-w-[1200px]
          items-center
          justify-between
          pl-16
          pr-4
          sm:pl-16
          sm:pr-6
          lg:px-6
        "
      >
        {/* PRODUCT */}

        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />

          <span
            className="
              text-sm
              font-semibold
              tracking-tight
              text-white/90
            "
          >
            DeepResearch
          </span>

          <Badge
            variant="accent"
            className="hidden sm:inline-flex"
          >
            Research
          </Badge>
        </div>

        {/* ACCOUNT */}

        <div className="flex items-center gap-2">
          <span
            className="
              hidden
              max-w-[140px]
              truncate
              text-xs
              text-white/35
              sm:block
            "
          >
            {userName}
          </span>

          <IconButton
            type="button"
            size="sm"
            aria-label="Account"
            title={userName}
            className="rounded-full"
          >
            <CircleUserRound
              size={19}
            />
          </IconButton>
        </div>
      </div>
    </header>
  );
}