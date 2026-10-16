import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface TabContentProps {
  value: string;
  activeValue: string;
  className?: string;
  children: ReactNode;
  keepMounted?: boolean;
}

export default function TabContent({
  value,
  activeValue,
  children,
  className,
  keepMounted = false,
}: TabContentProps) {
  const isActive = value === activeValue;
  if (!isActive && !keepMounted) return null;
  return (
    <div
      className={twMerge(
        `mt-4`,
        isActive ? "block animate-in fade-in duration-300" : "hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
