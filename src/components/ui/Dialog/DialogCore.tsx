import { useRef, useState, type HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type DialogMaxWidth =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "full";

export type DialogProps = {
  trigger?: (
    openDialog: (e?: React.MouseEvent | Element | Event) => void,
  ) => React.ReactNode;
  children: React.ReactNode | ((closeDialog: () => void) => React.ReactNode);
  className?: HTMLAttributes<HTMLDialogElement>["className"];
  dismissible?: boolean;
  scroll?: "paper" | "body";
  isDynamic?: boolean;
  maxWidth?: DialogMaxWidth;
};

const maxWidthClasses: Record<DialogMaxWidth, string> = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] sm:max-w-[calc(100vw-4rem)] sm:h-[calc(100vh-4rem)]",
};

function Dialog(props: DialogProps) {
  const {
    children,
    trigger,
    className,
    dismissible = true,
    scroll = "body",
    isDynamic = false,
    maxWidth = "md",
    ...rest
  } = props;

  const dialogRef = useRef<HTMLDialogElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isMounted, setIsMounted] = useState(!isDynamic);

  const openDialog = (e?: React.MouseEvent | Element | Event) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (isDynamic) setIsMounted(true);

    let triggerEl: Element | null = null;
    if (e) {
      if ("currentTarget" in e && e.currentTarget instanceof Element) {
        triggerEl = e.currentTarget;
      } else if (e instanceof Element) {
        triggerEl = e;
      }
    }

    setTimeout(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (!dialog.open) dialog.showModal();

      const contentEl = scroll === "paper" ? dialog : innerRef.current;

      if (contentEl && triggerEl) {
        const contentRect = contentEl.getBoundingClientRect();
        const triggerRect = triggerEl.getBoundingClientRect();

        const triggerCenterX = triggerRect.left + triggerRect.width / 2;
        const triggerCenterY = triggerRect.top + triggerRect.height / 2;

        const originX = triggerCenterX - contentRect.left;
        const originY = triggerCenterY - contentRect.top;

        contentEl.style.transformOrigin = `${originX}px ${originY}px`;
      } else if (contentEl) {
        contentEl.style.transformOrigin = "center center";
      }

      requestAnimationFrame(() => dialog.setAttribute("data-state", "open"));
    }, 0);
  };

  const closeDialog = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.removeAttribute("data-state");

    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

    closeTimeoutRef.current = setTimeout(() => {
      dialog.close();
      if (isDynamic) setIsMounted(false);
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (!dismissible) return;
    const dialog = e.currentTarget;

    if (scroll === "paper") {
      const rect = dialog.getBoundingClientRect();
      const isClickOutside =
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom;

      if (isClickOutside) closeDialog();
    } else if (e.target === dialog) closeDialog();
  };

  const renderChildren = isMounted
    ? typeof children === "function"
      ? children(closeDialog)
      : children
    : null;

  return (
    <>
      {trigger && trigger(openDialog)}

      <dialog
        {...rest}
        ref={dialogRef}
        {...(scroll !== "body" ? { "data-slot": "dialog" } : {})}
        onCancel={(e) => {
          e.preventDefault();
          closeDialog();
        }}
        onClick={handleBackdropClick}
        className={twMerge(
          "group fixed inset-0 m-auto",
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "opacity-0 data-[state=open]:opacity-100",
          "backdrop:bg-black/40 backdrop:backdrop-blur-xs",
          "backdrop:transition-all backdrop:duration-300 backdrop:ease-out",
          "backdrop:opacity-0 data-[state=open]:backdrop:opacity-100",

          scroll === "paper" && [
            "bg-bg-paper border border-divider rounded-3xl w-full shadow-2xl",
            "max-h-[calc(100dvh-4rem)] overflow-y-auto",
            "scale-50 data-[state=open]:scale-100",
            maxWidthClasses[maxWidth],
            className,
          ],

          scroll === "body" && [
            "w-full h-full max-w-none max-h-none bg-transparent border-none",
            "p-4 sm:p-8 overflow-y-auto",
            "open:flex items-center sm:items-start justify-center",
          ],
        )}
      >
        {scroll === "body" ? (
          <div
            data-slot="dialog"
            ref={innerRef}
            className={twMerge(
              "bg-bg-paper border border-divider rounded-3xl w-full shadow-2xl relative",
              "my-auto shrink-0 flex flex-col",
              "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              "scale-75 group-data-[state=open]:scale-100",
              maxWidthClasses[maxWidth],
              maxWidth === "full" &&
                "max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] overflow-y-auto",
              className,
            )}
          >
            {renderChildren}
          </div>
        ) : (
          renderChildren
        )}
      </dialog>
    </>
  );
}

export default Dialog;
