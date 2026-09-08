"use client";
import { type VariantProps, cva } from "class-variance-authority";
import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
  forwardRef,
} from "react";
import { twMerge } from "tailwind-merge";
import Ripple from "../Ripple";
import CircularProgress from "../CircularProgress";
import type { size } from "../Type";

const baseClass = [
  "rounded-2xl",
  "tracking-wide",
  "cursor-pointer",
  "inline-flex",
  "items-center",
  "justify-center",
  "transition",
  "font-semibold",
  "border-2",
  "border-transparent",
];

const disabledClass = [
  "disabled:cursor-not-allowed",
  "disabled:scale-100",
  "disabled:opacity-25",
  "dark:disabled:cursor-not-allowed",
  "dark:disabled:scale-100",
];

const interactionClass = [
  "hover:scale-[1.01]",
  "outline-none",
  "active:scale-[1]",
  "hover:shadow-md",
];

const containedVariant = cva(
  [
    ...baseClass,
    ...interactionClass,
    "shadow",
    ...disabledClass,
    "text-white",
    "disabled:shadow-none",
    "disabled:text-white",
    "disabled:from-neutral-400",
    "disabled:to-neutral-400",
    "disabled:bg-neutral-400",
    "dark:disabled:shadow-none",
    "dark:disabled:text-white",
    "dark:disabled:from-neutral-400",
    "dark:disabled:to-neutral-400",
    "dark:disabled:bg-neutral-400",
  ],
  {
    variants: {
      color: {
        primary: [
          "bg-primary-main",
          "hover:bg-primary-dark",
          "focus:ring-primary-main",
        ],
        secondary: [
          "bg-secondary-main",
          "hover:bg-secondary-dark",
          "focus:ring-secondary-main",
        ],
        success: [
          "bg-success-main",
          "hover:bg-success-dark",
          "focus:ring-success-main",
        ],
        error: [
          "bg-error-main",
          "hover:bg-error-dark",
          "focus:ring-error-main",
        ],
        warning: [
          "bg-warning-main",
          "hover:bg-warning-dark",
          "focus:ring-warning-main",
        ],
        info: [
          "bg-info-main",
          "hover:bg-info-dark",
          "text-white",
          "focus:ring-info-main",
        ],
        white: [
          "bg-white",
          "dark:bg-gray-700",
          "text-primary-main",
          "dark:text-white",
          "focus:ring-neutral-200",
        ],
      },
    },
    defaultVariants: {
      color: "primary",
    },
  },
);

const outlinedVariant = cva(
  [
    ...baseClass,
    ...interactionClass,
    "shadow",
    "border-2",
    "bg-transparent",
    ...disabledClass,
    // focus
    "focus-visible:ring-2",
    "focus-visible:ring-offset-1",
    "disabled:shadow-none",
    "disabled:text-neutral-400",
    "disabled:border-neutral-400",
    "dark:disabled:shadow-none",
    "dark:disabled:text-neutral-400",
    "dark:disabled:border-neutral-400",
  ],
  {
    variants: {
      color: {
        primary: [
          "border-primary-main dark:border-primary-dark",
          "text-primary-main",
          "focus:ring-primary-main",
        ],
        secondary: [
          "border-secondary-main dark:border-secondary-dark",
          "text-secondary-main",
          "focus:ring-secondary-main",
        ],
        success: [
          "border-success-main dark:border-success-dark",
          "text-success-main",
          "focus:ring-success-main",
        ],
        error: [
          "border-error-main dark:border-error-dark",
          "text-error-main",
          "focus:ring-error-main",
        ],
        warning: [
          "border-warning-main dark:border-warning-dark",
          "text-warning-main",
          "focus:ring-warning-main",
        ],
        info: [
          "border-info-main dark:border-info-dark",
          "text-info-main",
          "focus:ring-info-main",
        ],
        white: [
          "border-gray-500 dark:border-white",
          "text-gray-500 dark:text-white",
          "focus:ring-gray-500 dark:focus:ring-white",
        ],
      },
    },
    defaultVariants: {
      color: "primary",
    },
  },
);

const textVariant = cva(
  [
    ...baseClass,
    "focus-visible:outline-none",
    "hover:scale-[1.01]",
    ...disabledClass,
  ],
  {
    variants: {
      color: {
        primary: [
          "text-primary-main",
          "hover:text-primary-dark focus:ring-primary-main",
        ],
        secondary: [
          "text-secondary-main",
          "hover:text-secondary-dark focus:ring-secondary-main",
        ],
        success: [
          "text-success-main",
          "hover:text-success-dark focus:ring-success-main",
        ],
        error: [
          "text-error-main",
          "hover:text-error-dark focus:ring-error-main",
        ],
        warning: [
          "text-warning-main",
          "hover:text-warning-dark focus:ring-warning-main",
        ],
        info: ["text-info-main", "hover:text-info-dark focus:ring-info-main"],
        white: [
          "text-gray-500 dark:text-white",
          "focus:ring-gray-500 dark:focus:ring-white",
        ],
      },
    },
    defaultVariants: {
      color: "primary",
    },
  },
);

interface MoreProps {
  loading?: boolean;
  variant?: "contained" | "outlined" | "text";
  size?: size;
  fullWidth?: boolean;
  noRipple?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  href?: string;
  onClickDownloadURL?: string;
  target?: string;
  LinkComponent?: React.ComponentType<any>;
  download?: AnchorHTMLAttributes<HTMLAnchorElement>["download"];
}

export type ButtonVariantProps = VariantProps<typeof containedVariant>;
export type ButtonProp = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariantProps &
  MoreProps;

export const switchVariant = (
  variant: MoreProps["variant"],
  size: size,
  color?: ButtonVariantProps["color"],
  noRipple?: boolean,
  icon?: boolean,
) => {
  const variantMap = {
    contained: containedVariant,
    outlined: outlinedVariant,
    text: textVariant,
  };
  const sizeMap: Record<size, { default: string[]; icon: string[] }> = {
    sm: {
      default: ["text-xs", "px-3 py-2"],
      icon: ["text-sm", "w-8 h-8", "rounded-full"],
    },
    md: {
      default: ["text-sm", "px-4 py-2.5", "leading-6"],
      icon: ["text-base", "w-10 h-10", "rounded-full"],
    },
    lg: {
      default: ["text-base", "px-6 py-3"],
      icon: ["text-lg", "w-12 h-12", "rounded-full"],
    },
  };

  const sizeClasses = icon ? sizeMap[size].icon : sizeMap[size].default;
  const base = variantMap[variant ?? "contained"]({ color });
  const rippleClass = noRipple
    ? "focus-visible:ring-2 focus-visible:ring-offset-2"
    : "";

  return [base, rippleClass, ...sizeClasses].join(" ");
};

const Button = forwardRef<HTMLButtonElement, ButtonProp>(
  (props: ButtonProp, ref) => {
    let {
      className,
      variant = "contained",
      color = "primary",
      size = "md",
      loading,
      children,
      startIcon,
      fullWidth,
      endIcon,
      href,
      onClickDownloadURL,
      noRipple,
      LinkComponent = "button",
      ...rest
    } = props;

    if (rest.disabled) LinkComponent = "button";
    let choseVariant = switchVariant(variant, size, color, noRipple);

    if (onClickDownloadURL) {
      rest.onClick = () => {
        const a = document.createElement("a");
        a.href = onClickDownloadURL;
        a.click();
      };
    }

    return (
      <LinkComponent
        ref={ref}
        title={
          rest.title || typeof children === "string" ? children : undefined
        }
        type={rest.type}
        {...(href && { href: href })}
        className={twMerge(
          "overflow-hidden relative",
          choseVariant,
          startIcon ? "pl-3" : "",
          endIcon ? "pr-3" : "",
          fullWidth && "w-full",
          className,
        )}
        style={{ WebkitTapHighlightColor: "transparent" }}
        {...rest}
      >
        {startIcon && <span className="mx-1">{startIcon}</span>}
        {loading && (
          <CircularProgress className="absolute inline-flex items-center" />
        )}
        <span
          className={twMerge(
            "transition",
            loading ? "opacity-0" : "opacity-100",
          )}
        >
          {children}
        </span>

        {endIcon && <span className="mx-1">{endIcon}</span>}
        {!noRipple && !rest.disabled && (
          <Ripple
            color={
              variant === "contained" && color !== "white" ? undefined : color
            }
            opacity={
              variant === "contained" && color !== "white" ? undefined : 0.25
            }
          />
        )}
      </LinkComponent>
    );
  },
);

Button.displayName = "Button";

export default Button;
