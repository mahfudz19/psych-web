import type { MouseEventHandler, ReactNode } from "react";
import type { color } from "../Type";
import Ripple from "../Ripple";
import { twMerge } from "tailwind-merge";

export interface MenuItemProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  classNames?: {
    root?: string;
    iconStart?: string;
    children?: string;
    iconEnd?: string;
  };
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  rippleColor?: color;
  active?: boolean;
}

export default function MenuItem({
  children,
  onClick,
  className = "",
  classNames,
  iconStart,
  iconEnd,
  rippleColor = "primary",
  active = false,
}: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      data-active={active ? "true" : undefined}
      aria-selected={active ? "true" : "false"}
      onClick={onClick}
      className={twMerge(
        "w-full relative overflow-hidden flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-text-secondary focus:outline-none transition-colors text-left hover:bg-primary-main/20",
        className,
        classNames?.root,
      )}
    >
      <span className="relative z-10 flex items-center gap-3 w-full">
        {iconStart && (
          <span className={twMerge("shrink-0", classNames?.iconStart)}>
            {iconStart}
          </span>
        )}
        <span className={twMerge("flex-1 truncate", classNames?.children)}>
          {children}
        </span>
        {iconEnd && (
          <span className={twMerge("shrink-0", classNames?.iconEnd)}>
            {iconEnd}
          </span>
        )}
      </span>

      <Ripple color={rippleColor} />
    </button>
  );
}
