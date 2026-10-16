import {
  type JSX,
  forwardRef,
  type InputHTMLAttributes,
  useState,
  type ReactNode,
} from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Check, Minus } from "lucide-react";

const variants = cva(
  [
    "relative flex items-center justify-center transition-all duration-200 ease-in-out",
    "rounded-md border-2 border-gray-300 dark:border-gray-400 overflow-hidden",
    "before:absolute before:scale-0 before:transition-transform",
    "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring",
  ],
  {
    variants: {
      color: {
        primary:
          "peer-checked:bg-primary-main border-primary-main dark:border-primary-main transition-all",
        secondary:
          "peer-checked:bg-secondary-main border-secondary-main dark:border-secondary-main transition-all",
        success:
          "peer-checked:bg-success-main border-success-main dark:border-success-main transition-all",
        error:
          "peer-checked:bg-error-main border-error-main dark:border-error-main transition-all",
        warning:
          "peer-checked:bg-warning-main border-warning-main dark:border-warning-main transition-all",
      },
      sizes: {
        sm: "min-w-[1rem] min-h-[1rem] w-4 h-4",
        md: "min-w-[1.25rem] min-h-[1.25rem] w-5 h-5",
        lg: "min-w-[1.5rem] min-h-[1.5rem] w-6 h-6",
      },
      radius: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
      disabled: {
        true: "border-gray-400/30 dark:border-gray-400/30 opacity-30 dark:opacity-30 pointer-events-none",
        false: "",
      },
    },
    defaultVariants: { color: "primary", sizes: "md", radius: "md" },
  },
);

interface MoreProps {
  label?: string;
  helperText?: string | boolean | JSX.Element;
  error?: boolean;
  lineThrough?: boolean;
  customIcon?: JSX.Element;
  classNames?: {
    root?: string;
    checkbox?: string;
    label?: string;
    helperText?: string;
  };
  indeterminate?: boolean;
  children?:
    ReactNode | ((props: { checkbox: JSX.Element | null }) => ReactNode);
}

export type CheckboxProps = VariantProps<typeof variants> &
  MoreProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "children">;

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
  let {
    label,
    helperText,
    error,
    className,
    color = "primary",
    disabled,
    radius,
    lineThrough,
    sizes,
    customIcon,
    indeterminate,
    checked,
    onChange,
    defaultChecked,
    children,
    ...rest
  } = props;

  const [isChecked, setIsChecked] = useState<boolean>(defaultChecked || false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isCurrentlyChecked = event.target.checked;

    if (checked === undefined) {
      setIsChecked(isCurrentlyChecked);
    }

    onChange?.(event);
  };

  if (error) color = "error";

  const isIconChecked = checked !== undefined ? checked : isChecked;

  const renderIcon = () => {
    if (indeterminate && !isIconChecked) return <Minus color="white" />;
    if (isIconChecked) return customIcon || <Check color="white" />;
    return null;
  };

  const getCheckboxStyles = () => {
    return twMerge(
      variants({
        color: isIconChecked ? color : null,
        sizes,
        radius,
        disabled,
      }),
      indeterminate && `bg-${color}-main border-${color}-main`,
      error && "border-error-main dark:border-error-main ",
      disabled && isIconChecked ? "bg-gray-400" : "",
      className,
    );
  };

  return (
    <label
      className={twMerge(
        "inline-flex items-center cursor-pointer group",
        disabled && "cursor-not-allowed",
      )}
    >
      <input
        type="checkbox"
        className="sr-only peer"
        disabled={disabled}
        ref={ref}
        {...rest}
        checked={checked !== undefined ? checked : isChecked}
        onChange={handleChange}
      />
      {typeof children === "function" ? (
        children({
          checkbox: <div className={getCheckboxStyles()}>{renderIcon()}</div>,
        })
      ) : (
        <div className={getCheckboxStyles()}>{renderIcon()}</div>
      )}
      {!children && (
        <>
          {label && (
            <span
              className={twMerge(
                "inline-flex ml-2 cursor-pointer transition-all",
                disabled ? "pointer-events-none" : undefined,
                lineThrough && "line-through text-gray-500",
              )}
            >
              {label}
            </span>
          )}
          {helperText && (
            <p
              className={twMerge(
                "text-xs mt-1 ml-2",
                error ? "text-error-main " : "text-gray-500",
              )}
            >
              {helperText}
            </p>
          )}
        </>
      )}
    </label>
  );
});

Checkbox.displayName = "Checkbox";

export default Checkbox;
