import type { InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { cva } from "class-variance-authority";
import type { color } from "../Type";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "color" | "size"
> {
  color?: color;
  size?: "sm" | "md" | "lg";
}

const inputVariants = cva(
  "rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 transition-all font-medium",
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
        sm: "text-xs px-3 py-2",
        md: "text-sm px-4 py-2.5",
        lg: "text-md px-5 py-3",
      },
    },
    defaultVariants: {
      color: "primary",
      size: "md",
    },
  },
);

function Input({ color, size, className, ...restProps }: InputProps) {
  return (
    <input
      {...restProps}
      className={twMerge(inputVariants({ color, size, className }))}
    />
  );
}

export default Input;
