import type {
  Metadata,
} from "next";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

import {
  ResearchProvider,
} from "@/components/context/ResearchContext";

import {
  ConversationProvider,
} from "@/components/context/ConversationContext";

// ============================================================
// FONT
// ============================================================

const geistSans =
  Geist({
    variable:
      "--font-geist-sans",

    subsets: [
      "latin",
    ],

    display:
      "swap",
  });

const geistMono =
  Geist_Mono({
    variable:
      "--font-geist-mono",

    subsets: [
      "latin",
    ],

    display:
      "swap",
  });

// ============================================================
// METADATA
// ============================================================

export const metadata: Metadata = {
  title: {
    default:
      "DeepResearch AI",

    template:
      "%s | DeepResearch",
  },

  description:
    "Autonomous AI research and intelligent conversation.",

  applicationName:
    "DeepResearch AI",
};

// ============================================================
// ROOT
// ============================================================

export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          antialiased
        `}
      >
        <ResearchProvider>
          <ConversationProvider>
            {children}
          </ConversationProvider>
        </ResearchProvider>
      </body>
    </html>
  );
}