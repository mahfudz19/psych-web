import React, { lazy, Suspense } from "react";
import MenuCoreStatic, { type MenuProps } from "./MenuCore";

const MenuCoreDynamic = lazy(() => import("./MenuCore"));

export type MenuWrapperProps = MenuProps & {
  isDynamic?: boolean;
  skeleton?: React.ReactNode;
};

export function Menu({
  isDynamic = true,
  skeleton = null,
  ...props
}: MenuWrapperProps) {
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

export { MenuItem, MenuHeader, MenuDivider } from "./MenuCore";
export type { MenuItemProps, MenuProps } from "./MenuCore";
