import type { ReactNode } from "react";
import type { color } from "../Type";
import Ripple from "../Ripple";
import { twMerge } from "tailwind-merge";

export interface MenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
  rippleColor?: color;
}

export default function MenuItem({
  children,
  onClick,
  className = "",
  icon,
  rippleColor = "primary",
}: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={twMerge(
        "w-full relative overflow-hidden flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-text-secondary focus:outline-none transition-colors text-left",
        className,
      )}
    >
      <span className="relative z-10 flex items-center gap-3 w-full">
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="flex-1 truncate">{children}</span>
      </span>

      <Ripple color={rippleColor} />
    </button>
  );
}
