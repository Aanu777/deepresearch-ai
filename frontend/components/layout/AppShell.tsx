"use client";

import {
  ReactNode,
  useState,
} from "react";

import Sidebar from "@/components/sidebar/Sidebar";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({
  children,
}: AppShellProps) {
  const [
    collapsed,
    setCollapsed,
  ] = useState(false);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() =>
          setCollapsed(
            (value) => !value
          )
        }
        onMobileOpen={() =>
          setMobileOpen(true)
        }
        onMobileClose={() =>
          setMobileOpen(false)
        }
      />

      <main
        className={[
          "min-h-screen",
          "bg-[#050505]",
          "transition-[margin-left]",
          "duration-200",
          "ease-out",

          // Desktop sidebar spacing
          collapsed
            ? "lg:ml-[68px]"
            : "lg:ml-[248px]",

          // Mobile never reserves sidebar width
          "ml-0",
        ].join(" ")}
      >
        {children}
      </main>
    </div>
  );
}