import {
  type HTMLAttributes,
} from "react";

import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type SurfaceVariant =
  | "default"
  | "subtle"
  | "elevated";

type SurfaceProps =
  HTMLAttributes<HTMLDivElement> & {
    variant?: SurfaceVariant;
  };

const variantClasses: Record<
  SurfaceVariant,
  string
> = {
  default:
    "border border-white/[0.09] bg-[#171717]",

  subtle:
    "border border-white/[0.06] bg-white/[0.025]",

  elevated:
    "border border-white/[0.09] bg-[#1d1d1d] shadow-[0_18px_60px_rgba(0,0,0,0.42)]",
};

export default function Surface({
  variant = "default",
  className,
  children,
  ...props
}: SurfaceProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "rounded-2xl",
          variantClasses[
            variant
          ],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}