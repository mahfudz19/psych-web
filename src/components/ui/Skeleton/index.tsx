import { cva } from "class-variance-authority";
import { type HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface MoreProps {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: number | string;
  height: number | string;
}

const variants = cva(
  ["inline-block", "bg-gray-200 dark:bg-gray-700", "animate-pulse"],
  {
    variants: {
      variant: {
        text: ["h-full rounded-sm"],
        circular: ["rounded-full"],
        rectangular: ["rounded-md"],
        rounded: ["rounded-2xl"],
      },
    },
    defaultVariants: {
      variant: "text",
    },
  },
);

export type SkeletonProps = MoreProps & HTMLAttributes<HTMLDivElement>;

const Skeleton = ({
  variant,
  width,
  height,
  className,
  ...rest
}: SkeletonProps) => {
  const style = { width, height };

  return (
    <div
      className={twMerge(variants({ variant, className }))}
      style={style}
      {...rest}
    />
  );
};

export default Skeleton;
