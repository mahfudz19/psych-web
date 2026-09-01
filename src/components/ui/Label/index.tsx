import type { LabelHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

function Label(props: LabelProps) {
  return (
    <label
      {...props}
      className={twMerge(
        "block text-xs font-bold uppercase tracking-wider text-text-secondary",
        props.className,
      )}
    />
  );
}

export default Label;
