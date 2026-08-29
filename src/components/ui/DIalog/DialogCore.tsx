import { useRef, type HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type DialogProps = {
  trigger?: (openDialog: () => void) => React.ReactNode;
  children: React.ReactNode | ((closeDialog: () => void) => React.ReactNode);
  className?: HTMLAttributes<HTMLDialogElement>["className"];
  dismissible?: boolean;
  scroll?: "paper" | "body";
};

function Dialog(props: DialogProps) {
  const {
    children,
    trigger,
    className,
    dismissible = true,
    scroll = "body",
  } = props;

  const dialogRef = useRef<HTMLDialogElement>(null);

  const openDialog = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();

    requestAnimationFrame(() =>
      requestAnimationFrame(() => dialog.setAttribute("data-state", "open")),
    );
  };

  const closeDialog = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.removeAttribute("data-state");

    setTimeout(() => dialog.close(), 200);
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

  const renderChildren =
    typeof children === "function" ? children(closeDialog) : children;

  return (
    <>
      {trigger && trigger(openDialog)}

      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          e.preventDefault();
          closeDialog();
        }}
        onClick={handleBackdropClick}
        className={twMerge(
          "group fixed inset-0 m-auto",
          "transition-all duration-200 ease-out",
          "opacity-0 data-[state=open]:opacity-100",
          "backdrop:bg-black/40 backdrop:backdrop-blur-xs",
          "backdrop:transition-all backdrop:duration-200 backdrop:ease-out",
          "backdrop:opacity-0 data-[state=open]:backdrop:opacity-100",

          scroll === "paper" && [
            "bg-bg-paper border border-divider rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl",
            "max-h-[calc(100dvh-4rem)] overflow-y-auto",
            "scale-95 data-[state=open]:scale-100",
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
            className={twMerge(
              "bg-bg-paper border border-divider rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative",
              "my-auto shrink-0",

              "transition-all duration-200 ease-out",
              "scale-95 group-data-[state=open]:scale-100",
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
