import { lazy, Suspense } from "react";
import type { DialogProps } from "./DialogCore";
import DialogCoreStatic from "./DialogCore";

const DialogCoreDynamic = lazy(() => import("./DialogCore"));

export type DialogWrapperProps = DialogProps & {
  isDynamic?: boolean;
  skeleton?: React.ReactNode;
};

export default function Dialog({
  isDynamic = true,
  skeleton = null,
  ...props
}: DialogWrapperProps) {
  const Component = isDynamic ? DialogCoreDynamic : DialogCoreStatic;

  if (isDynamic) {
    return (
      <Suspense fallback={skeleton}>
        <Component {...props} />
      </Suspense>
    );
  }

  return <Component {...props} />;
}
