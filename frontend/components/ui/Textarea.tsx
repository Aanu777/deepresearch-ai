"use client";

import {
  forwardRef,
  type TextareaHTMLAttributes,
} from "react";

import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type TextareaProps =
  TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea =
  forwardRef<
    HTMLTextAreaElement,
    TextareaProps
  >(
    (
      {
        className,
        ...props
      },
      ref
    ) => {
      return (
        <textarea
          ref={ref}
          className={twMerge(
            clsx(
              "min-h-[96px] w-full resize-y rounded-xl",
              "border border-white/[0.09] bg-[#171717]",
              "px-3 py-3 text-sm leading-6 text-white/90",
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

Textarea.displayName =
  "Textarea";

export default Textarea;