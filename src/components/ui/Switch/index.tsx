import { type VariantProps, cva } from "class-variance-authority";
import { type InputHTMLAttributes, type JSX, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

const variants = cva(
  [
    "relative",
    "peer-focus:outline-none",
    "peer-focus:ring-4",
    "rounded-full",
    "peer",
    "peer-checked:after:translate-x-full",
    "after:content-['']",
    "after:absolute",
    "after:border",
    "after:rounded-full",
    "after:transition-all",
    "bg-gray-200",
    "after:bg-white",
    "after:border-gray-300",
    "peer-checked:after:border-white",
  ],
  {
    variants: {
      color: {
        primary: [
          "peer-checked:bg-primary-main",
          "peer-focus:ring-primary-light",
        ],
        secondary: [
          "peer-checked:bg-secondary-main",
          "peer-focus:ring-secondary-light",
        ],
        success: [
          "peer-checked:bg-success-main",
          "peer-focus:ring-success-light",
        ],
        error: ["peer-checked:bg-error-main", "peer-focus:ring-error-light"],
        warning: [
          "peer-checked:bg-warning-main",
          "peer-focus:ring-warning-light",
        ],
        info: ["peer-checked:bg-info-main", "peer-focus:ring-info-light"],
        white: ["peer-checked:bg-white-main", "peer-focus:ring-white-light"],
      },
      sizes: {
        small: [
          "w-9 h-5",
          "after:top-[0.125rem]",
          "after:left-[0.125rem]",
          "after:h-4",
          "after:w-4",
        ],
        medium: [
          "w-11 h-6",
          "after:top-[0.125rem]",
          "after:left-[0.125rem]",
          "after:h-5",
          "after:w-5",
        ],
        large: [
          "w-14 h-7",
          "after:top-0.5",
          "after:left-[0.25rem]",
          "after:h-6",
          "after:w-6",
        ],
      },
    },
    defaultVariants: {
      color: "primary",
      sizes: "medium",
    },
  },
);

interface MoreProps {
  label?: string;
  helperText?: string | JSX.Element | boolean;
  error?: boolean;
  classNames?: {
    root?: string;
    checkbox?: string;
    peer?: string;
    label?: string;
    helperText?: string;
  };
}

export type SwitchProps = InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof variants> &
  MoreProps;

const Switch = forwardRef<HTMLInputElement, SwitchProps>((props, ref) => {
  const {
    label,
    sizes,
    color,
    className,
    classNames,
    helperText,
    error,
    ...rest
  } = props;
  const disabled = rest.disabled;

  return (
    // root
    <label
      className={twMerge(
        "relative inline-flex items-center cursor-pointer",
        classNames?.root,
      )}
    >
      <div>
        {/* checkbox */}
        <input
          ref={ref}
          type="checkbox"
          className={twMerge("sr-only peer", classNames?.checkbox)}
          {...rest}
        />
        {/* peer */}
        <div
          className={twMerge(
            variants({ color, sizes, className }),
            classNames?.peer,
            disabled && "peer-checked:bg-bg-gray-300",
          )}
        />
      </div>
      {label && (
        // label
        <span
          className={twMerge(
            "ml-3 text-sm font-medium",
            classNames?.label,
            disabled && "text-gray-300 dark:text-gray-500",
          )}
        >
          {label}
        </span>
      )}
      {/* helperText */}
      {helperText && (
        <p
          className={twMerge(
            "text-xs text-gray-500 absolute -bottom-4 left-3 flex-1",
            classNames?.helperText,
            error && "text-error-main",
          )}
        >
          {helperText}
        </p>
      )}
    </label>
  );
});

Switch.displayName = "Switch";

export default Switch;
