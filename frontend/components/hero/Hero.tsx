"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

import HeroBadge from "./HeroBadge";
import HeroHeadline from "./HeroHeadline";
import HeroButtons from "./HeroButtons";
import HeroStats from "./HeroStats";
import HeroVisual from "./HeroVisual";

export default function Hero() {
  // ============================================================
  // MOUSE PARALLAX
  // ============================================================

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 45,
    damping: 20,
    mass: 0.5,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 45,
    damping: 20,
    mass: 0.5,
  });

  const glowX = useTransform(
    smoothX,
    [-1, 1],
    [-35, 35]
  );

  const glowY = useTransform(
    smoothY,
    [-1, 1],
    [-25, 25]
  );

  const visualX = useTransform(
    smoothX,
    [-1, 1],
    [-8, 8]
  );

  const visualY = useTransform(
    smoothY,
    [-1, 1],
    [-6, 6]
  );

  function handleMouseMove(
    event: React.MouseEvent<HTMLElement>
  ) {
    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) /
        rect.width -
      0.5;

    const y =
      (event.clientY - rect.top) /
        rect.height -
      0.5;

    mouseX.set(x * 2);
    mouseY.set(y * 2);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="
        relative
        isolate
        overflow-hidden
        pt-32
        pb-28
      "
    >

      {/* ====================================================== */}
      {/* AMBIENT BACKGROUND */}
      {/* ====================================================== */}

      <div className="pointer-events-none absolute inset-0">

        {/* Main reactive cyan glow */}

        <motion.div
          style={{
            x: glowX,
            y: glowY,
          }}
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1.8,
            ease: "easeOut",
          }}
          className="
            absolute
            left-1/2
            top-[-180px]
            h-[760px]
            w-[760px]
            -translate-x-1/2
            rounded-full
            bg-cyan-500/[0.09]
            blur-[180px]
          "
        />

        {/* Secondary blue glow */}

        <motion.div
          animate={{
            x: [-20, 20, -20],
            y: [0, 25, 0],
            opacity: [0.45, 0.7, 0.45],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-[8%]
            top-[420px]
            h-[420px]
            w-[420px]
            rounded-full
            bg-blue-500/[0.07]
            blur-[150px]
          "
        />

        {/* Right atmospheric glow */}

        <motion.div
          animate={{
            x: [20, -20, 20],
            y: [0, -20, 0],
            opacity: [0.3, 0.55, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            right-[5%]
            top-[520px]
            h-[360px]
            w-[360px]
            rounded-full
            bg-cyan-400/[0.05]
            blur-[140px]
          "
        />

        {/* ================================================== */}
        {/* HERO ORBIT */}
        {/* ================================================== */}

        <motion.div
          style={{
            x: glowX,
            y: glowY,
          }}
          initial={{
            opacity: 0,
            scale: 0.85,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1.6,
            delay: 0.2,
            ease: "easeOut",
          }}
          className="
            absolute
            left-1/2
            top-[390px]
            h-[680px]
            w-[680px]
            -translate-x-1/2
            rounded-full
            border
            border-cyan-400/[0.045]
            sm:h-[820px]
            sm:w-[820px]
          "
        />

        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear",
          }}
          className="
            absolute
            left-1/2
            top-[450px]
            hidden
            h-[560px]
            w-[560px]
            -translate-x-1/2
            rounded-full
            border
            border-dashed
            border-cyan-400/[0.06]
            lg:block
          "
        >
          <span
            className="
              absolute
              -right-1
              top-1/2
              h-2
              w-2
              rounded-full
              bg-cyan-300
              shadow-[0_0_18px_rgba(34,211,238,0.9)]
            "
          />
        </motion.div>

        {/* ================================================== */}
        {/* GRID */}
        {/* ================================================== */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.035]
            [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
            [background-size:72px_72px]
          "
        />

        {/* ================================================== */}
        {/* TOP VIGNETTE */}
        {/* ================================================== */}

        <div
          className="
            absolute
            inset-x-0
            top-0
            h-40
            bg-gradient-to-b
            from-[#06070b]
            to-transparent
          "
        />

        {/* ================================================== */}
        {/* BOTTOM FADE */}
        {/* ================================================== */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-56
            bg-gradient-to-t
            from-[#06070b]
            to-transparent
          "
        />

      </div>


      {/* ====================================================== */}
      {/* HERO CONTENT */}
      {/* ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          max-w-7xl
          flex-col
          items-center
          px-6
          text-center
        "
      >

        {/* ================================================== */}
        {/* BADGE */}
        {/* ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.65,
            ease: "easeOut",
          }}
        >
          <HeroBadge />
        </motion.div>


        {/* ================================================== */}
        {/* HEADLINE */}
        {/* ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.75,
            delay: 0.12,
            ease: "easeOut",
          }}
        >
          <HeroHeadline />
        </motion.div>


        {/* ================================================== */}
        {/* BUTTONS */}
        {/* ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.24,
            ease: "easeOut",
          }}
        >
          <HeroButtons />
        </motion.div>


        {/* ================================================== */}
        {/* STATS */}
        {/* ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.36,
            ease: "easeOut",
          }}
        >
          <HeroStats />
        </motion.div>


        {/* ================================================== */}
        {/* RESEARCH VISUAL */}
        {/* ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 45,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 1,
            delay: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            relative
            mt-20
            w-full
          "
        >

          {/* ================================================== */}
          {/* FLOATING RESEARCH STATUS */}
          {/* ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 1.15,
            }}
            className="
              absolute
              -left-3
              top-12
              z-20
              hidden
              items-center
              gap-2
              rounded-full
              border
              border-white/[0.08]
              bg-[#0a0d12]/80
              px-3
              py-2
              text-[11px]
              text-slate-400
              shadow-2xl
              backdrop-blur-xl
              lg:flex
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                animate-pulse
                rounded-full
                bg-cyan-400
                shadow-[0_0_10px_rgba(34,211,238,0.8)]
              "
            />

            Searching trusted sources
          </motion.div>


          <motion.div
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 1.35,
            }}
            className="
              absolute
              -right-3
              bottom-12
              z-20
              hidden
              items-center
              gap-2
              rounded-full
              border
              border-white/[0.08]
              bg-[#0a0d12]/80
              px-3
              py-2
              text-[11px]
              text-slate-400
              shadow-2xl
              backdrop-blur-xl
              lg:flex
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                animate-pulse
                rounded-full
                bg-emerald-400
                shadow-[0_0_10px_rgba(52,211,153,0.8)]
              "
            />

            Claims verified
          </motion.div>


          {/* ================================================== */}
          {/* OUTER GLOW */}
          {/* ================================================== */}

          <motion.div
            style={{
              x: glowX,
              y: glowY,
            }}
            className="
              pointer-events-none
              absolute
              -inset-10
              rounded-[40px]
              bg-cyan-400/[0.035]
              blur-3xl
            "
          />


          {/* ================================================== */}
          {/* VISUAL */}
          {/* ================================================== */}

          <motion.div
            style={{
              x: visualX,
              y: visualY,
            }}
            className="relative"
          >
            <HeroVisual />
          </motion.div>

        </motion.div>


        {/* ================================================== */}
        {/* SCROLL INDICATOR */}
        {/* ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
            delay: 1.6,
          }}
          className="
            mt-16
            flex
            flex-col
            items-center
            gap-3
            text-[10px]
            font-medium
            uppercase
            tracking-[0.25em]
            text-slate-600
          "
        >
          <span>
            Explore
          </span>

          <motion.div
            animate={{
              y: [0, 6, 0],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              flex
              h-8
              w-5
              items-start
              justify-center
              rounded-full
              border
              border-white/[0.12]
              p-1.5
            "
          >
            <motion.span
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                h-1.5
                w-1
                rounded-full
                bg-cyan-400
              "
            />
          </motion.div>
        </motion.div>

      </div>

    </section>
  );
}