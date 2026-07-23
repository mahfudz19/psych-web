"use client";

import type React from "react";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { X } from "lucide-react";
import IconButton from "../IconButton";

const alertVariants = cva(
  "relative rounded-xl px-4 py-3 flex items-start gap-3",
  {
    variants: {
      variant: {
        standard: "",
        outlined: "border-2 bg-background",
        filled: "border-0 text-white [&>svg]:text-white",
      },
      severity: {
        info: "",
        success: "",
        warning: "",
        error: "",
      },
    },
    compoundVariants: [
      {
        variant: "standard",
        severity: "info",
        class:
          "bg-blue-50 text-blue-900 [&>svg]:text-blue-600 dark:bg-blue-950 dark:text-blue-200 dark:[&>svg]:text-blue-200",
      },
      {
        variant: "standard",
        severity: "success",
        class:
          "bg-green-50 text-green-900 [&>svg]:text-green-600 dark:bg-green-950 dark:text-green-200 dark:[&>svg]:text-green-200",
      },
      {
        variant: "standard",
        severity: "warning",
        class:
          "bg-yellow-50 text-yellow-900 [&>svg]:text-yellow-600 dark:bg-yellow-950 dark:text-yellow-200 dark:[&>svg]:text-yellow-200",
      },
      {
        variant: "standard",
        severity: "error",
        class:
          "bg-red-50 text-red-900 [&>svg]:text-red-600 dark:bg-red-950 dark:text-red-200 dark:[&>svg]:text-red-200",
      },
      {
        variant: "outlined",
        severity: "info",
        class:
          "border-info-main text-info-dark [&>svg]:text-info-main dark:border-info-main dark:text-info-light dark:[&>svg]:text-info-light",
      },
      {
        variant: "outlined",
        severity: "success",
        class:
          "border-success-main text-success-dark [&>svg]:text-success-main dark:border-success-main dark:text-success-light dark:[&>svg]:text-success-light",
      },
      {
        variant: "outlined",
        severity: "warning",
        class:
          "border-warning-main text-warning-dark [&>svg]:text-warning-main dark:border-warning-main dark:text-warning-light dark:[&>svg]:text-warning-light",
      },
      {
        variant: "outlined",
        severity: "error",
        class:
          "border-error-main text-error-dark [&>svg]:text-error-main dark:border-error-main dark:text-error-light dark:[&>svg]:text-error-light",
      },
      {
        variant: "filled",
        severity: "info",
        class: "bg-info-main text-white [&>svg]:text-white dark:bg-info-dark",
      },
      {
        variant: "filled",
        severity: "success",
        class:
          "bg-success-main text-white [&>svg]:text-white dark:bg-success-dark",
      },
      {
        variant: "filled",
        severity: "warning",
        class:
          "bg-warning-main text-white [&>svg]:text-white dark:bg-warning-dark",
      },
      {
        variant: "filled",
        severity: "error",
        class: "bg-error-main text-white [&>svg]:text-white dark:bg-error-dark",
      },
    ],
    defaultVariants: {
      variant: "standard",
      severity: "info",
    },
  },
);

const IconInfo = ({
  fontSize,
  ...props
}: React.SVGProps<SVGSVGElement> & { fontSize?: number | string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={fontSize || 24}
    height={fontSize || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const IconSuccess = ({
  fontSize,
  ...props
}: React.SVGProps<SVGSVGElement> & { fontSize?: number | string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={fontSize || 24}
    height={fontSize || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconWarning = ({
  fontSize,
  ...props
}: React.SVGProps<SVGSVGElement> & { fontSize?: number | string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={fontSize || 24}
    height={fontSize || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconError = ({
  fontSize,
  ...props
}: React.SVGProps<SVGSVGElement> & { fontSize?: number | string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={fontSize || 24}
    height={fontSize || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const severityIcons = {
  info: IconInfo,
  success: IconSuccess,
  warning: IconWarning,
  error: IconError,
};

export interface AlertProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode | boolean;
  onClose?: () => void;
  action?: React.ReactNode;
  closable?: boolean;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant,
      severity = "info",
      icon,
      onClose,
      action,
      closable,
      children,
      ...props
    },
    ref,
  ) => {
    const IconComponent = severityIcons[severity as keyof typeof severityIcons];
    const showIcon = icon !== false;
    const customIcon = typeof icon === "object" ? icon : null;

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="polite"
        className={twMerge(alertVariants({ variant, severity }), className)}
        {...props}
      >
        {showIcon && (
          <div className="self-start">
            {customIcon || <IconComponent fontSize={16} />}
          </div>
        )}
        <div className="flex-1 flex flex-col gap-1">{children}</div>
        {(action || closable || onClose) && (
          <div className="inline-flex items-center gap-2 ml-auto pl-4 self-start">
            {action}
            {(closable || onClose) && (
              <IconButton
                onClick={onClose}
                variant="text"
                color={severity || "info"}
                aria-label="Close alert"
              >
                <X fontSize={16} />
              </IconButton>
            )}
          </div>
        )}
      </div>
    );
  },
);
Alert.displayName = "Alert";

// Toast-specific Alert component that integrates with your toast manager
export interface ToastAlertProps extends Omit<AlertProps, "severity"> {
  type: "info" | "success" | "error" | "warning";
  message: string;
  title?: string;
}

export default Alert;
