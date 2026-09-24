import Link from "next/link";

const HERO_ART =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3IuPm94x35T3Pr6R7fJtC0Ac1Vy/hf_20260905_124238_8314b31e-f461-4f3c-bd35-2b7c69e132c3.png";

export default function Hero3D() {
  return (
    <section
      id="product"
      className="
        relative
        min-h-[880px]
        overflow-hidden
        bg-[#050505]
        lg:min-h-[980px]
      "
    >
      {/* HIGGSFIELD CORE */}

      <div
        aria-hidden="true"
        className="
          absolute
          left-[35%]
          top-[12%]
          h-[70%]
          w-[82%]
          bg-cover
          bg-center
          bg-no-repeat
          opacity-60

          max-lg:
          left-[10%]
          max-lg:
          top-[28%]
          max-lg:
          h-[55%]
          max-lg:
          w-[110%]
          max-lg:
          opacity-40
        "
        style={{
          backgroundImage: `url("${HERO_ART}")`,
        }}
      />

      {/* LEFT CONTRAST */}

      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          left-0
          w-[72%]
          bg-gradient-to-r
          from-[#050505]
          from-40%
          via-[#050505]/90
          via-70%
          to-transparent
        "
      />

      {/* MOBILE DARKENING */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-b
          from-transparent
          via-transparent
          to-[#050505]
          lg:hidden
        "
      />

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1440px]
          px-5
          pb-20
          pt-24
          sm:px-8
          lg:px-24
          lg:pt-16
        "
      >
        <div className="max-w-[760px]">
          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.14em]
              !text-cyan-400
            "
          >
            Deep research, orchestrated
          </p>

          <h1
            className="
              mt-9
              max-w-[760px]
              text-[48px]
              font-medium
              leading-[0.98]
              tracking-[-0.045em]
              text-[#f7f7f7]
              [font-family:var(--font-landing-display)]

              sm:text-[64px]
              lg:text-[78px]
            "
          >
            Research that
            <br />
            thinks in systems.
          </h1>

          <p
            className="
              mt-9
              max-w-[620px]
              text-[16px]
              leading-[1.7]
              !text-white/55
              sm:text-[18px]
            "
          >
            DeepResearch AI plans, searches, extracts,
            reflects, verifies, and synthesizes evidence
            into reports you can actually trust.
          </p>

          <div
            className="
              mt-9
              flex
              flex-col
              gap-3
              sm:flex-row
            "
          >
            <Link
              href="/workspace"
              className="
                inline-flex
                h-12
                items-center
                justify-center
                rounded-full
                bg-[#f7f7f7]
                px-[22px]
                text-[13px]
                font-semibold
                !text-[#080808]
                transition
                duration-200
                hover:-translate-y-0.5
                hover:bg-white/85
              "
            >
              Start a deep research&nbsp; ↗
            </Link>

            <a
              href="#difference"
              className="
                inline-flex
                h-12
                items-center
                justify-center
                rounded-full
                border
                border-white/[0.12]
                bg-white/[0.035]
                px-5
                text-[13px]
                font-semibold
                text-white/70
                transition
                duration-200
                hover:border-white/[0.2]
                hover:bg-white/[0.06]
                hover:text-white
              "
            >
              See how it works&nbsp; ↓
            </a>
          </div>
        </div>

        <p
          className="
            mt-36
            hidden
            text-[11px]
            tracking-[0.02em]
            !text-white/30
            lg:block
          "
        >
          PLANNER&nbsp; → &nbsp;SEARCHER&nbsp; → &nbsp;EXTRACTOR&nbsp;
          → &nbsp;REFLECTION&nbsp; → &nbsp;VERIFIER&nbsp; →
          &nbsp;SYNTHESIZER&nbsp; → &nbsp;WRITER
        </p>

        <div
          className="
            mt-24
            border-t
            border-white/[0.08]
            pt-8
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.15em]
              !text-white/25
            "
          >
            Scroll to follow the research
          </p>
        </div>
      </div>
    </section>
  );
}