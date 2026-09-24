"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
} from "react";

import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger";

type ButtonSize =
  | "sm"
  | "md"
  | "lg";

type ButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    loading?: boolean;
  };

const variantClasses: Record<
  ButtonVariant,
  string
> = {
  primary: `
    bg-white
    !text-black
    hover:bg-white/85
  `,

  secondary: `
    border
    border-white/[0.09]
    bg-white/[0.035]
    !text-white/70
    hover:border-white/[0.14]
    hover:bg-white/[0.065]
    hover:!text-white
  `,

  ghost: `
    bg-transparent
    !text-white/45
    hover:bg-white/[0.05]
    hover:!text-white
  `,

  danger: `
    bg-transparent
    !text-white/45
    hover:bg-red-400/[0.08]
    hover:!text-red-300
  `,
};

const sizeClasses: Record<
  ButtonSize,
  string
> = {
  sm: `
    h-8
    rounded-lg
    px-3
    text-xs
  `,

  md: `
    h-10
    rounded-xl
    px-4
    text-sm
  `,

  lg: `
    h-11
    rounded-xl
    px-5
    text-sm
  `,
};

const Button =
  forwardRef<
    HTMLButtonElement,
    ButtonProps
  >(
    (
      {
        children,
        className,
        variant = "secondary",
        size = "md",
        fullWidth = false,
        loading = false,
        disabled,
        type = "button",
        ...props
      },
      ref
    ) => {
      const isDisabled =
        disabled || loading;

      return (
        <button
          ref={ref}
          type={type}
          disabled={isDisabled}
          className={twMerge(
            clsx(
              `
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-2
                whitespace-nowrap
                font-medium
                transition-colors
                duration-150

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-white/25

                disabled:cursor-not-allowed
                disabled:opacity-45
              `,

              variantClasses[
                variant
              ],

              sizeClasses[
                size
              ],

              fullWidth &&
                "w-full",

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

Button.displayName =
  "Button";

export default Button;