import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export default function MenuHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={twMerge("px-3 py-3 border-b border-divider", className)}>
      {children}
    </div>
  );
}
