"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type InputProps =
  InputHTMLAttributes<HTMLInputElement>;

const Input =
  forwardRef<
    HTMLInputElement,
    InputProps
  >(
    (
      {
        className,
        ...props
      },
      ref
    ) => {
      return (
        <input
          ref={ref}
          className={twMerge(
            clsx(
              "h-10 w-full rounded-xl border border-white/[0.09]",
              "bg-[#171717] px-3 text-sm text-white/90",
              "outline-none transition-colors duration-150",
              "placeholder:text-white/25",
              "hover:border-white/[0.14]",
              "focus:border-white/[0.18]",
              "disabled:cursor-not-allowed disabled:opacity-45",
              className
            )
          )}
          {...props}
        />
      );
    }
  );

Input.displayName =
  "Input";

export default Input;