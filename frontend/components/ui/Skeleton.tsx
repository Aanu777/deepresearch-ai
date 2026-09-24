import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type SkeletonProps = {
  className?: string;
};

export default function Skeleton({
  className,
}: SkeletonProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "animate-pulse rounded-lg bg-white/[0.04]",
          className
        )
      )}
    />
  );
}