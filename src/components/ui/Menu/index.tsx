import React, { lazy, Suspense, type ReactNode } from "react";
import MenuCoreStatic from "./MenuCore";
import type { AnchorPosition } from "../Popover";

const MenuCoreDynamic = lazy(() => import("./MenuCore"));

export type MenuProps = {
  isDynamic?: boolean;
  skeleton?: React.ReactNode;
  trigger: ReactNode;
  position?: AnchorPosition;
  widthClass?: string;
  children: (close: () => void) => ReactNode;
};

export default function Menu({
  isDynamic = true,
  skeleton = null,
  ...props
}: MenuProps) {
  const Component = isDynamic ? MenuCoreDynamic : MenuCoreStatic;

  if (isDynamic) {
    return (
      <Suspense fallback={skeleton}>
        <Component {...props} />
      </Suspense>
    );
  }

  return <Component {...props} />;
}
