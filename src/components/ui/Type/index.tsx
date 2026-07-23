import { type ReactNode } from "react";

export type ComponentProp = {
  children?: ReactNode;
  className?: string;
};

export type color =
  "primary" | "secondary" | "success" | "error" | "warning" | "info" | "white";
