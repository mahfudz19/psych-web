import type { ReactNode } from "react";

export type TabProps<C extends React.ElementType = "button"> = {
  value: string;
  label: ReactNode;
  component?: C;
} & Omit<React.ComponentPropsWithoutRef<C>, "value" | "label" | "component">;

export default function Tab<C extends React.ElementType = "button">(
  _props: TabProps<C>,
) {
  return null;
}
