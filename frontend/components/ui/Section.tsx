"use client";

import { ReactNode } from "react";
import Container from "./Container";

export default function Section({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="relative scroll-mt-20 py-32"
    >
      <Container>
        {children}
      </Container>
    </section>
  );
}