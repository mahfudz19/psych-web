import { type VariantProps, cva } from "class-variance-authority";
import { type HTMLAttributes, type JSX, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import type { size } from "../Type";

interface MoreProps {
  variant?: "contained" | "outlined" | "light";
  size?: size;
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
}

const baseChip = [
  "inline-flex",
  "items-center",
  "justify-center",
  "rounded-full",
  "font-medium",
  "leading-none",
  "w-fit",
];

const chipSizes = {
  sm: ["text-xs", "px-2", "py-0.5", "gap-1"],
  md: ["text-xs", "px-2.5", "py-1", "gap-1.5"],
  lg: ["text-sm", "px-3", "py-1.5", "gap-1.5"],
};

const variantsLight = cva(baseChip, {
  variants: {
    color: {
      neutral: ["bg-divider/60", "text-text-secondary"],
      primary: [
        "bg-primary-main/15",
        "text-primary-dark dark:text-primary-light",
      ],
      secondary: [
        "bg-secondary-main/15",
        "text-secondary-dark dark:text-secondary-light",
      ],
      success: [
        "bg-success-main/15",
        "text-success-dark dark:text-success-light",
      ],
      error: ["bg-error-main/15", "text-error-dark dark:text-error-light"],
      warning: [
        "bg-warning-main/15",
        "text-warning-dark dark:text-warning-light",
      ],
      info: ["bg-info-main/15", "text-info-dark dark:text-info-light"],
      white: ["bg-gray-100 dark:bg-white/10", "text-gray-700 dark:text-white"],
    },
    size: chipSizes,
  },
  defaultVariants: { color: "primary", size: "md" },
});

const variantsContained = cva(baseChip, {
  variants: {
    color: {
      neutral: ["bg-text-primary", "text-bg-paper"],
      primary: ["bg-primary-main", "text-white"],
      secondary: ["bg-secondary-main", "text-white"],
      success: ["bg-success-main", "text-white"],
      error: ["bg-error-main", "text-white"],
      warning: ["bg-warning-main", "text-white"],
      info: ["bg-info-main", "text-white"],
      white: ["bg-white", "text-primary-main shadow-xs"],
    },
    size: chipSizes,
  },
  defaultVariants: { color: "primary", size: "md" },
});

const variantsOutlined = cva([...baseChip, "border", "bg-transparent"], {
  variants: {
    color: {
      neutral: ["border-divider", "text-text-secondary"],
      primary: [
        "border-primary-main/40",
        "text-primary-main dark:text-primary-light",
      ],
      secondary: [
        "border-secondary-main/40",
        "text-secondary-main dark:text-secondary-light",
      ],
      success: [
        "border-success-main/40",
        "text-success-main dark:text-success-light",
      ],
      error: ["border-error-main/40", "text-error-main dark:text-error-light"],
      warning: [
        "border-warning-main/40",
        "text-warning-main dark:text-warning-light",
      ],
      info: ["border-info-main/40", "text-info-main dark:text-info-light"],
      white: [
        "border-gray-300 dark:border-white/30",
        "text-gray-700 dark:text-white",
      ],
    },
    size: chipSizes,
  },
  defaultVariants: { color: "primary", size: "md" },
});

export type ChipProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof variantsContained | typeof variantsOutlined> &
  MoreProps;

const Chip = forwardRef<HTMLDivElement, ChipProps>((props: ChipProps, ref) => {
  const {
    className,
    variant = "light",
    color = "primary",
    size = "md",
    children,
    startIcon,
    endIcon,
    ...rest
  } = props;

  const variantFns = {
    light: variantsLight,
    outlined: variantsOutlined,
    contained: variantsContained,
  };

  const chosenClass = (variantFns[variant] ?? variantsLight)({ color, size });

  return (
    <div {...rest} ref={ref} className={twMerge(chosenClass, className)}>
      {startIcon && <span className="inline-flex shrink-0">{startIcon}</span>}
      {children}
      {endIcon && <span className="inline-flex shrink-0">{endIcon}</span>}
    </div>
  );
});

Chip.displayName = "Chip";

export default Chip;
