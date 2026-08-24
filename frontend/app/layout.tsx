import type { Metadata } from "next";
import "./globals.css";

import { ResearchProvider } from "@/components/context/ResearchContext";
import { ConversationProvider } from "@/components/context/ConversationContext";

export const metadata: Metadata = {
  title: "DeepResearch AI",
  description: "Autonomous AI Research Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ResearchProvider>
          <ConversationProvider>
            {children}
          </ConversationProvider>
        </ResearchProvider>
      </body>
    </html>
  );
}



