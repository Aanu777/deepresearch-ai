"use client";

import {
  type ReactNode,
  useEffect,
} from "react";

export default function SmoothScroll({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    const previous =
      document.documentElement.style.scrollBehavior;

    document.documentElement.style.scrollBehavior =
      "smooth";

    return () => {
      document.documentElement.style.scrollBehavior =
        previous;
    };
  }, []);

  return <>{children}</>;
}