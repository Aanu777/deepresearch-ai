"use client";

import { ReactNode, useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />

      <main
        className={[
          "min-h-screen",
          "bg-[#050608]",
          "transition-[margin-left] duration-200 ease-out",
          collapsed ? "ml-[64px]" : "ml-[260px]",
        ].join(" ")}
      >
        {children}
      </main>
    </div>
  );
}