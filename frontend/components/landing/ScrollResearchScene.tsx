"use client";

import {
  MutableRefObject,
} from "react";

import {
  Canvas,
} from "@react-three/fiber";

import ResearchCore from "./ResearchCore";

type ScrollResearchSceneProps = {
  progress:
    MutableRefObject<number>;
};

export default function ScrollResearchScene({
  progress,
}: ScrollResearchSceneProps) {
  return (
    <div
      className="
        relative
        h-full
        w-full
      "
    >
      {/* GLOW */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[430px]
          w-[430px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-cyan-400/[0.035]
          blur-[130px]
        "
      />

      {/* CANVAS */}

      <Canvas
        camera={{
          position: [
            0,
            0,
            7,
          ],

          fov: 42,
        }}
        dpr={1}
        gl={{
          antialias:
            true,

          alpha:
            true,

          powerPreference:
            "high-performance",
        }}
        style={{
          background:
            "transparent",
        }}
      >
        <ambientLight
          intensity={0.7}
        />

        <directionalLight
          position={[
            4,
            5,
            6,
          ]}
          intensity={1.8}
        />

        <directionalLight
          position={[
            -4,
            -1,
            3,
          ]}
          intensity={0.45}
        />

        <pointLight
          position={[
            -3,
            2,
            4,
          ]}
          intensity={4}
          color="#67e8f9"
        />

        <ResearchCore
          position={[
            0,
            0,
            0,
          ]}
          scrollProgress={
            progress
          }
          storyMode
        />
      </Canvas>

      {/* LABEL */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-[8%]
          left-1/2
          -translate-x-1/2
          whitespace-nowrap
          rounded-full
          border
          border-white/[0.07]
          bg-[#111111]/70
          px-4
          py-2
          text-[10px]
          font-medium
          uppercase
          tracking-[0.14em]
          text-white/20
          backdrop-blur-xl
        "
      >
        Live WebGL research system
      </div>
    </div>
  );
}