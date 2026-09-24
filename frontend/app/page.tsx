import {
  Manrope,
  Space_Grotesk,
} from "next/font/google";

import LandingExperience from "@/components/landing/LandingExperience";
import LandingNavbar from "@/components/landing/LandingNavbar";
import SmoothScroll from "@/components/landing/SmoothScroll";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-landing-body",
});

const spaceGrotesk =
  Space_Grotesk({
    subsets: ["latin"],
    display: "swap",
    variable:
      "--font-landing-display",
  });

export default function Home() {
  return (
    <SmoothScroll>
      <main
        className={`
          ${manrope.variable}
          ${spaceGrotesk.variable}
          min-h-screen
          overflow-x-clip
          bg-[#050505]
          text-white
          [font-family:var(--font-landing-body)]
        `}
      >
        <LandingNavbar />

        <LandingExperience />
      </main>
    </SmoothScroll>
  );
}