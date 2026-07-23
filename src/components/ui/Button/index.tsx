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

const baseClass = [
  "rounded-xl",
  "tracking-wide",
  "cursor-pointer",
  "inline-flex",
  "items-center",
  "justify-center",
  "uppercase",
  "transition",
  "font-semibold",
];

const disabledClass = [
  "disabled:cursor-not-allowed",
  "disabled:scale-100",
  "disabled:opacity-25",
  "dark:disabled:cursor-not-allowed",
  "dark:disabled:scale-100",
];

const interactionClass = [
  "hover:scale-[1.03]",
  "outline-none",
  "active:scale-95",
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
          "bg-gradient-to-br",
          "from-primary-light",
          "to-primary-dark",
          "focus:ring-primary-main",
        ],
        secondary: [
          "bg-gradient-to-br",
          "from-secondary-light",
          "to-secondary-dark",
          "focus:ring-secondary-main",
        ],
        success: [
          "bg-gradient-to-br",
          "from-success-light",
          "to-success-dark",
          "focus:ring-success-main",
        ],
        error: [
          "bg-gradient-to-br",
          "from-error-light",
          "to-error-dark",
          "focus:ring-error-main",
        ],
        warning: [
          "bg-gradient-to-br",
          "from-warning-light",
          "to-warning-dark",
          "focus:ring-warning-main",
        ],
        info: [
          "bg-gradient-to-br",
          "from-info-light",
          "to-info-dark",
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
    "outline-2",
    "outline",
    "-outline-offset-1",
    ...disabledClass,
    // focus
    "focus-visible:outline-2",
    "focus-visible:outline",
    "disabled:shadow-none",
    "disabled:text-neutral-400",
    "disabled:outline-neutral-400",
    "dark:disabled:shadow-none",
    "dark:disabled:text-neutral-400",
    "dark:disabled:outline-neutral-400",
  ],
  {
    variants: {
      color: {
        primary: [
          "outline-primary-main dark:outline-primary-dark",
          "text-primary-main",
          "focus:ring-primary-main",
        ],
        secondary: [
          "outline-secondary-main dark:outline-secondary-dark",
          "text-secondary-main",
          "focus:ring-secondary-main",
        ],
        success: [
          "outline-success-main dark:outline-success-dark",
          "text-success-main",
          "focus:ring-success-main",
        ],
        error: [
          "outline-error-main dark:outline-error-dark",
          "text-error-main",
          "focus:ring-error-main",
        ],
        warning: [
          "outline-warning-main dark:outline-warning-dark",
          "text-warning-main",
          "focus:ring-warning-main",
        ],
        info: [
          "outline-info-main dark:outline-info-dark",
          "text-info-main",
          "focus:ring-info-main",
        ],
        white: [
          "outline-gray-500 dark:outline-white",
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
  sizes?: "small" | "medium" | "large";
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
  size: "small" | "medium" | "large",
  color?: ButtonVariantProps["color"],
  noRipple?: boolean,
  icon?: boolean,
) => {
  const variantMap = {
    contained: containedVariant,
    outlined: outlinedVariant,
    text: textVariant,
  };
  const sizeMap: Record<
    "small" | "medium" | "large",
    { default: string[]; icon: string[] }
  > = {
    small: {
      default: ["text-xs", "p-1", "px-4"],
      icon: ["text-xs", "p-1.5", "rounded-full"],
    },
    medium: {
      default: ["text-xs", "p-1", "leading-6", "px-6"],
      icon: ["text-sm", "p-2", "rounded-full"],
    },
    large: {
      default: ["text-sm", "p-2.5", "px-9"],
      icon: ["text-base", "p-3", "rounded-full"],
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
      sizes = "medium",
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
    let choseVariant = switchVariant(variant, sizes, color, noRipple);

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
