import type { LabelHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import type { TooltipPosition } from "../Tooltip";
import Tooltip from "../Tooltip";

type TooltipTrue = {
  tooltip: string;
  tooltipPosition?: TooltipPosition;
};
type TooltipFlase = { tooltip?: undefined };

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> &
  (TooltipTrue | TooltipFlase) & { required?: boolean };

function Label({ children, required, ...props }: LabelProps) {
  return (
    <label
      {...props}
      className={twMerge(
        props.tooltip ? "flex items-center gap-1 " : "block ",
        "text-xs font-bold uppercase tracking-wider text-text-secondary",
        "px-2 py-1",
        props.className,
      )}
    >
      {props.tooltip && (
        <Tooltip
          position="top-center"
          interaction="hover"
          classNames={{
            tooltip:
              "max-w-62.5 text-center bg-gray-600 border-gray-500 text-white",
          }}
          trigger={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-text-secondary hover:text-primary-main transition-colors cursor-help"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        >
          <>{props.tooltip}</>
        </Tooltip>
      )}
      {children}
      {required && <span className="text-error-main">*</span>}
    </label>
  );
}

export default Label;
