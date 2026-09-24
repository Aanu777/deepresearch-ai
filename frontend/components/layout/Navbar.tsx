"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  ArrowRight,
  BrainCircuit,
  Menu,
  X,
} from "lucide-react";

import Link from "next/link";

import {
  useState,
} from "react";

const links = [
  {
    name: "How it works",
    href: "#how-it-works",
  },
  {
    name: "Features",
    href: "#features",
  },
  {
    name: "Architecture",
    href: "#architecture",
  },
];

export default function Navbar() {
  const [
    mobileOpen,
    setMobileOpen,
  ] =
    useState(false);

  function closeMenu() {
    setMobileOpen(
      false
    );
  }

  return (
    <>
      <motion.header
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
        }}
        className="
          fixed
          inset-x-0
          top-0
          z-50
          border-b
          border-white/[0.06]
          bg-[#050505]/85
          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto
            flex
            h-16
            w-full
            max-w-[1200px]
            items-center
            justify-between
            px-4
            sm:px-6
            lg:px-8
          "
        >
          {/* BRAND */}

          <Link
            href="/"
            className="
              flex
              items-center
              gap-2.5
            "
          >
            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                border
                border-white/[0.08]
                bg-white/[0.04]
              "
            >
              <BrainCircuit
                size={16}
                className="text-cyan-300"
              />
            </div>

            <span
              className="
                text-sm
                font-semibold
                tracking-[-0.02em]
                text-white/90
              "
            >
              DeepResearch
            </span>
          </Link>

          {/* DESKTOP NAV */}

          <nav
            className="
              hidden
              items-center
              gap-7
              md:flex
            "
          >
            {links.map(
              (
                link
              ) => (
                <a
                  key={
                    link.name
                  }
                  href={
                    link.href
                  }
                  className="
                    text-[13px]
                    font-medium
                    text-white/40
                    transition-colors
                    duration-150
                    hover:text-white/80
                  "
                >
                  {link.name}
                </a>
              )
            )}
          </nav>

          {/* DESKTOP ACTIONS */}

          <div
            className="
              hidden
              items-center
              gap-2
              md:flex
            "
          >
            <Link
              href="/login"
              className="
                inline-flex
                h-9
                items-center
                justify-center
                rounded-lg
                px-3
                text-[13px]
                font-medium
                text-white/45
                transition-colors
                hover:bg-white/[0.04]
                hover:text-white/80
              "
            >
              Sign in
            </Link>

            <Link
              href="/conversation"
              className="
                inline-flex
                h-9
                items-center
                justify-center
                gap-1.5
                rounded-lg
                bg-white
                px-4
                text-[13px]
                font-semibold
                !text-black
                transition-colors
                hover:bg-white/85
              "
            >
              Open app

              <ArrowRight
                size={14}
              />
            </Link>
          </div>

          {/* MOBILE BUTTON */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                (
                  value
                ) =>
                  !value
              )
            }
            aria-label={
              mobileOpen
                ? "Close menu"
                : "Open menu"
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-white/55
              transition-colors
              hover:bg-white/[0.05]
              hover:text-white
              md:hidden
            "
          >
            {mobileOpen ? (
              <X
                size={18}
              />
            ) : (
              <Menu
                size={18}
              />
            )}
          </button>
        </div>
      </motion.header>

      {/* MOBILE MENU */}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            transition={{
              duration: 0.18,
            }}
            className="
              fixed
              inset-x-3
              top-[72px]
              z-40
              rounded-2xl
              border
              border-white/[0.08]
              bg-[#111111]
              p-2
              shadow-[0_24px_80px_rgba(0,0,0,0.55)]
              md:hidden
            "
          >
            {links.map(
              (
                link
              ) => (
                <a
                  key={
                    link.name
                  }
                  href={
                    link.href
                  }
                  onClick={
                    closeMenu
                  }
                  className="
                    block
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    text-white/55
                    transition-colors
                    hover:bg-white/[0.04]
                    hover:text-white
                  "
                >
                  {link.name}
                </a>
              )
            )}

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
                onClick={
                  closeMenu
                }
                className="
                  flex
                  h-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/[0.08]
                  text-sm
                  text-white/60
                "
              >
                Sign in
              </Link>

              <Link
                href="/conversation"
                onClick={
                  closeMenu
                }
                className="
                  flex
                  h-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  text-sm
                  font-semibold
                  !text-black
                "
              >
                Open app
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}