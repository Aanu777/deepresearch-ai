"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  {
    label: "Product",
    target: "hero",
  },
  {
    label: "How it works",
    target: "thesis",
  },
  {
    label: "Research stack",
    target: "agents",
  },
  {
    label: "Evidence",
    target: "evidence",
  },
];

export default function LandingNavbar() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  function jumpTo(
    target: string
  ) {
    const element =
      document.getElementById(
        target
      );

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setMobileOpen(false);
  }

  return (
    <header
      className="
        sticky
        top-0
        z-[100]
        border-b
        border-white/[0.055]
        bg-[#050505]/88
        backdrop-blur-2xl
      "
    >
      <div
        className="
          mx-auto
          flex
          h-20
          w-full
          max-w-[1440px]
          items-center
          justify-between
          px-5
          sm:px-8
          lg:px-16
          xl:px-24
        "
      >
        {/* BRAND */}

        <button
          type="button"
          onClick={() =>
            jumpTo("hero")
          }
          className="
            group
            flex
            items-center
            gap-2.5
          "
          aria-label="Back to top"
        >
          <span
            className="
              h-2.5
              w-2.5
              rounded-full
              bg-cyan-300
              shadow-[0_0_18px_rgba(103,232,249,0.45)]
              transition-transform
              duration-200
              group-hover:scale-110
            "
          />

          <span
            className="
              text-[15px]
              font-medium
              tracking-[-0.03em]
              text-white/95
              [font-family:var(--font-landing-display)]
            "
          >
            DeepResearch AI
          </span>
        </button>

        {/* DESKTOP NAV */}

        <nav
          className="
            hidden
            items-center
            gap-8
            lg:flex
          "
        >
          {links.map(
            (link) => (
              <button
                key={link.label}
                type="button"
                onClick={() =>
                  jumpTo(
                    link.target
                  )
                }
                className="
                  text-[12px]
                  font-medium
                  text-white/42
                  transition-colors
                  duration-150
                  hover:text-white
                "
              >
                {link.label}
              </button>
            )
          )}

          <Link
            href="/docs"
            prefetch
            className="
              text-[12px]
              font-medium
              text-white/42
              transition-colors
              duration-150
              hover:text-cyan-300
            "
          >
            Docs
          </Link>
        </nav>

        {/* DESKTOP ACTIONS */}

        <div
          className="
            hidden
            items-center
            gap-4
            lg:flex
          "
        >
          <Link
            href="/login"
            className="
              text-[12px]
              font-medium
              text-white/55
              transition-colors
              hover:text-white
            "
          >
            Sign in
          </Link>

          <Link
            href="/workspace"
            className="
              inline-flex
              h-10
              items-center
              justify-center
              rounded-full
              bg-[#f5f5f5]
              px-5
              text-[12px]
              font-semibold
              !text-[#080808]
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-white
            "
          >
            Start researching

            <span className="ml-1.5">
              ↗
            </span>
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          onClick={() =>
            setMobileOpen(
              (value) =>
                !value
            )
          }
          aria-label="Toggle navigation"
          aria-expanded={
            mobileOpen
          }
          className="
            relative
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-white/[0.09]
            bg-white/[0.02]
            text-white/70
            lg:hidden
          "
        >
          <span
            className="
              relative
              h-4
              w-4
            "
          >
            <span
              className={`
                absolute
                left-0
                top-[4px]
                h-px
                w-4
                bg-current
                transition-transform
                duration-200

                ${
                  mobileOpen
                    ? "translate-y-[4px] rotate-45"
                    : ""
                }
              `}
            />

            <span
              className={`
                absolute
                bottom-[3px]
                left-0
                h-px
                w-4
                bg-current
                transition-transform
                duration-200

                ${
                  mobileOpen
                    ? "-translate-y-[4px] -rotate-45"
                    : ""
                }
              `}
            />
          </span>
        </button>
      </div>

      {/* MOBILE MENU */}

      {mobileOpen && (
        <div
          className="
            absolute
            left-3
            right-3
            top-[70px]
            rounded-2xl
            border
            border-white/[0.08]
            bg-[#0b0b0c]/98
            p-2
            shadow-[0_24px_80px_rgba(0,0,0,0.6)]
            backdrop-blur-2xl
            lg:hidden
          "
        >
          {links.map(
            (link) => (
              <button
                key={link.label}
                type="button"
                onClick={() =>
                  jumpTo(
                    link.target
                  )
                }
                className="
                  block
                  w-full
                  rounded-xl
                  px-4
                  py-3
                  text-left
                  text-sm
                  text-white/52
                  transition-colors
                  hover:bg-white/[0.04]
                  hover:text-white
                "
              >
                {link.label}
              </button>
            )
          )}

          <Link
            href="/docs"
            onClick={() =>
              setMobileOpen(
                false
              )
            }
            className="
              block
              rounded-xl
              px-4
              py-3
              text-sm
              text-white/52
              transition-colors
              hover:bg-white/[0.04]
              hover:text-cyan-300
            "
          >
            Docs
          </Link>

          <div
            className="
              mt-2
              grid
              grid-cols-2
              gap-2
              border-t
              border-white/[0.06]
              pt-2
            "
          >
            <Link
              href="/login"
              className="
                flex
                h-11
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.08]
                text-sm
                text-white/62
              "
            >
              Sign in
            </Link>

            <Link
              href="/workspace"
              className="
                flex
                h-11
                items-center
                justify-center
                rounded-xl
                bg-white
                text-sm
                font-semibold
                !text-black
              "
            >
              Research ↗
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}