"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
} from "react";

import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type IconButtonSize =
  | "sm"
  | "md"
  | "lg";

type IconButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: IconButtonSize;
  };

const sizeClasses: Record<
  IconButtonSize,
  string
> = {
  sm:
    "h-8 w-8 rounded-lg",

  md:
    "h-10 w-10 rounded-xl",

  lg:
    "h-11 w-11 rounded-xl",
};

const IconButton =
  forwardRef<
    HTMLButtonElement,
    IconButtonProps
  >(
    (
      {
        className,
        size = "md",
        children,
        ...props
      },
      ref
    ) => {
      return (
        <button
          ref={ref}
          className={twMerge(
            clsx(
              "inline-flex items-center justify-center",
              "bg-transparent text-white/40",
              "transition-colors duration-150",
              "hover:bg-white/[0.055] hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60",
              "disabled:cursor-not-allowed disabled:opacity-40",
              sizeClasses[
                size
              ],
              className
            )
          )}
          {...props}
        >
          {children}
        </button>
      );
    }
  );

IconButton.displayName =
  "IconButton";

export default IconButton;