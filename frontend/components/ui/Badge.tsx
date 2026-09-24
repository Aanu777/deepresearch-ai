import {
  type HTMLAttributes,
} from "react";

import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type BadgeVariant =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger";

type BadgeProps =
  HTMLAttributes<HTMLSpanElement> & {
    variant?: BadgeVariant;
  };

const variantClasses: Record<
  BadgeVariant,
  string
> = {
  neutral:
    "bg-white/[0.045] text-white/45",

  accent:
    "bg-cyan-400/[0.08] text-cyan-300",

  success:
    "bg-emerald-400/[0.08] text-emerald-300",

  warning:
    "bg-amber-400/[0.08] text-amber-300",

  danger:
    "bg-red-400/[0.08] text-red-300",
};

export default function Badge({
  variant = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium",
          variantClasses[
            variant
          ],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}