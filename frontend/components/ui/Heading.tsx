"use client";

import { ReactNode } from "react";

export default function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">

      {eyebrow && (
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">

          {eyebrow}

        </p>
      )}

      <h2 className="text-5xl font-bold leading-tight">

        {title}

      </h2>

      {description && (
        <p className="mt-6 text-lg leading-8 text-slate-400">

          {description}

        </p>
      )}

    </div>
  );
}