"use client";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/hero/Hero";

import HowItWorks from "@/components/sections/HowItWorks";
import Features from "@/components/sections/Features";
import Architecture from "@/components/sections/Architecture";
import CTA from "@/components/sections/CTA";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Architecture />
        <CTA />
      </main>
    </>
  );
}