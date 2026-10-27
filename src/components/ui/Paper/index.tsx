import type { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

function Paper({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={twMerge("bg-bg-paper shadow-lg rounded-3xl", className)}
    >
      {children}
    </div>
  );
}

export default Paper;
