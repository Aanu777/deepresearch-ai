"use client";

import { ReactNode } from "react";
import Container from "./Container";

export default function Section({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="relative py-32">

      <Container>

        {children}

      </Container>

    </section>
  );
}