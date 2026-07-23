import { type HTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { cva } from "class-variance-authority";
import type { color } from "../Type";

interface MoreProps {
  size?: number;
  color?: color;
}

const variants = cva(["animate-spin"], {
  variants: {
    color: {
      primary: ["text-primary-main"],
      secondary: ["text-secondary-main"],
      success: ["text-success-main"],
      error: ["text-error-main"],
      warning: ["text-warning-main"],
      info: ["text-info-main"],
      white: ["text-white"],
    },
  },
});

export type ChipProps = HTMLAttributes<SVGSVGElement> & MoreProps;

const CircularProgress = forwardRef<SVGSVGElement, ChipProps>(
  (props: ChipProps, ref) => {
    const { className, color, size = 20, ...rest } = props;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={`${size || 24}`}
        height={`${size || 24}`}
        {...rest}
        ref={ref}
        className={twMerge(variants({ color, className }))}
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
          opacity="0.25"
        />
        <path
          fill="currentColor"
          d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
        >
          <animateTransform
            attributeName="transform"
            dur="0.75s"
            repeatCount="indefinite"
            type="rotate"
            values="0 12 12;360 12 12"
          />
        </path>
      </svg>
    );
  },
);

CircularProgress.displayName = "CircularProgress";

export default CircularProgress;
