import type { SelectHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { cva } from "class-variance-authority";
import type { color } from "../Type";

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "color" | "size"
> {
  color?: color;
  size?: "sm" | "md" | "lg";
}

const selectVariants = cva(
  "rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 transition-all font-medium cursor-pointer disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-text-disabled disabled:border-divider/50 disabled:opacity-60",
  {
    variants: {
      color: {
        primary: "focus:border-primary-main focus:ring-primary-main/20",
        secondary: "focus:border-secondary-main focus:ring-secondary-main/20",
        success: "focus:border-success-main focus:ring-success-main/20",
        warning: "focus:border-warning-main focus:ring-warning-main/20",
        error: "focus:border-error-main focus:ring-error-main/20",
        info: "focus:border-info-main focus:ring-info-main/20",
        white: "focus:border-white focus:ring-white/20",
      },
      size: {
        sm: "text-xs pl-3 pr-8 py-2",
        md: "text-sm pl-4 pr-10 py-2.5",
        lg: "text-md pl-5 pr-12 py-3",
      },
    },
    defaultVariants: {
      color: "primary",
      size: "md",
    },
  },
);

function Select({
  color,
  size,
  className,
  children,
  ...restProps
}: SelectProps) {
  return (
    <select
      {...restProps}
      className={twMerge(selectVariants({ color, size, className }))}
    >
      {children}
    </select>
  );
}

export default Select;
