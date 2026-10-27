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

const ghostVariant = cva(
  [
    ...baseClass,
    "hover:scale-[1.01]",
    "active:scale-[1]",
    "outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-offset-1",
    ...disabledClass,
    "disabled:bg-neutral-100 dark:disabled:bg-neutral-800",
    "disabled:text-neutral-400 dark:disabled:text-neutral-500",
  ],
  {
    variants: {
      color: {
        primary: [
          "bg-primary-main/10 dark:bg-primary-main/20",
          "text-primary-main dark:text-primary-300",
          "hover:bg-primary-main/20 dark:hover:bg-primary-main/30",
          "focus:ring-primary-main",
        ],
        secondary: [
          "bg-secondary-main/10 dark:bg-secondary-main/20",
          "text-secondary-main dark:text-secondary-300",
          "hover:bg-secondary-main/20 dark:hover:bg-secondary-main/30",
          "focus:ring-secondary-main",
        ],
        success: [
          "bg-success-main/10 dark:bg-success-main/20",
          "text-success-main dark:text-success-300",
          "hover:bg-success-main/20 dark:hover:bg-success-main/30",
          "focus:ring-success-main",
        ],
        error: [
          "bg-error-main/10 dark:bg-error-main/20",
          "text-error-main dark:text-error-300",
          "hover:bg-error-main/20 dark:hover:bg-error-main/30",
          "focus:ring-error-main",
        ],
        warning: [
          "bg-warning-main/10 dark:bg-warning-main/20",
          "text-warning-main dark:text-warning-300",
          "hover:bg-warning-main/20 dark:hover:bg-warning-main/30",
          "focus:ring-warning-main",
        ],
        info: [
          "bg-info-main/10 dark:bg-info-main/20",
          "text-info-main dark:text-info-300",
          "hover:bg-info-main/20 dark:hover:bg-info-main/30",
          "focus:ring-info-main",
        ],
        white: [
          "bg-gray-100 dark:bg-white/10",
          "text-gray-700 dark:text-white",
          "hover:bg-gray-200 dark:hover:bg-white/20",
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
  variant?: "contained" | "outlined" | "text" | "ghost";
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
  startIcon?: ReactNode,
  endIcon?: ReactNode,
) => {
  const variantMap = {
    contained: containedVariant,
    outlined: outlinedVariant,
    text: textVariant,
    ghost: ghostVariant,
  };
  const sizeMap: Record<size, { default: string[]; icon: string[] }> = {
    sm: {
      default: [
        "text-xs",
        "px-2 py-1.5",
        startIcon ? "pr-4" : "",
        endIcon ? "pl-4" : "",
      ],
      icon: ["text-sm", "w-8 h-8", "rounded-full"],
    },
    md: {
      default: [
        "text-sm",
        "px-4 py-2.5",
        "leading-6",
        startIcon ? "pr-6" : "",
        endIcon ? "pl-6" : "",
      ],
      icon: ["text-base", "w-10 h-10", "rounded-full"],
    },
    lg: {
      default: [
        "text-base",
        "px-6 py-3",
        startIcon ? "pr-8" : "",
        endIcon ? "pl-8" : "",
      ],
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
      endIcon,
      fullWidth,
      href,
      onClickDownloadURL,
      noRipple,
      LinkComponent = "button",
      ...rest
    } = props;

    if (rest.disabled) LinkComponent = "button";
    let choseVariant = switchVariant(
      variant,
      size,
      color,
      noRipple,
      undefined,
      startIcon,
      endIcon,
    );

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
