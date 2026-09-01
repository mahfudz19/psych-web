import type { ReactNode } from "react";
import type { color } from "../Type";
import Ripple from "../Ripple";
import { twMerge } from "tailwind-merge";

export interface MenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  rippleColor?: color;
  active?: boolean;
}

export default function MenuItem({
  children,
  onClick,
  className = "",
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
      )}
    >
      <span className="relative z-10 flex items-center gap-3 w-full">
        {iconStart && <span className="shrink-0">{iconStart}</span>}
        <span className="flex-1 truncate">{children}</span>
        {iconEnd && <span className="shrink-0">{iconEnd}</span>}
      </span>

      <Ripple color={rippleColor} />
    </button>
  );
}
