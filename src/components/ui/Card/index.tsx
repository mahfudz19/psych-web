import type { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

function Card({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={twMerge(
        "bg-bg-paper border border-divider/50 shadow-lg rounded-3xl transition-shadow duration-300 hover:shadow-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Card;
