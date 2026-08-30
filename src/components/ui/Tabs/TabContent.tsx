import type { ReactNode } from "react";

export interface TabContentProps {
  value: string;
  activeValue: string;
  children: ReactNode;
  keepMounted?: boolean;
}

export default function TabContent({
  value,
  activeValue,
  children,
  keepMounted = false,
}: TabContentProps) {
  const isActive = value === activeValue;
  if (!isActive && !keepMounted) return null;
  return (
    <div
      className={`mt-4 ${isActive ? "block animate-in fade-in duration-300" : "hidden"}`}
    >
      {children}
    </div>
  );
}
