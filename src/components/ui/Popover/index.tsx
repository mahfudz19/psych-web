import {
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
  type ReactNode,
} from "react";
import { twMerge } from "tailwind-merge";

export type AnchorPosition =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  anchor?: AnchorPosition;
  gap?: number;
  followWidthAnchor?: boolean;
  onlyShowUpOrDown?: boolean;
  onlyShowCenterBody?: boolean;
  interaction?: "click" | "focus";
  classNames?: {
    trigger?: string;
    popover?: string;
  };
}

export const getTransformOrigin = (anchor: AnchorPosition) => {
  switch (anchor) {
    case "top":
      return "bottom center";
    case "top-start":
      return "bottom left";
    case "top-end":
      return "bottom right";
    case "bottom":
      return "top center";
    case "bottom-start":
      return "top left";
    case "bottom-end":
      return "top right";
    case "left":
      return "center right";
    case "left-start":
      return "top right";
    case "left-end":
      return "bottom right";
    case "right":
      return "center left";
    case "right-start":
      return "top left";
    case "right-end":
      return "bottom left";
    default:
      return "bottom center";
  }
};

const calculatePosition = (
  anchor: AnchorPosition,
  anchorRect: DOMRect,
  popoverWidth: number,
  popoverHeight: number,
  gap = 8,
  onlyShowUpOrDown?: boolean,
  onlyShowCenterBody?: boolean,
) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top: number | undefined;
  let left = 0;
  let bottom: number | undefined;
  let maxHeight: number | undefined;
  let transformOrigin: string | undefined = getTransformOrigin(anchor);

  if (onlyShowCenterBody) {
    let l = (viewportWidth - popoverWidth) / 2;
    let t = (viewportHeight - popoverHeight) / 2;

    if (l < 10) l = 10;
    else if (l + popoverWidth > viewportWidth)
      l = viewportWidth - popoverWidth - 10;

    if (t < 10) t = 10;
    else if (t + popoverHeight > viewportHeight)
      t = viewportHeight - popoverHeight - 10;

    return { top: t, left: l, transformOrigin: "center center" };
  }

  if (onlyShowUpOrDown) {
    const spaceBelow = viewportHeight - anchorRect.bottom;
    const spaceAbove = anchorRect.top;

    if (spaceBelow >= popoverHeight || spaceBelow >= spaceAbove) {
      top = anchorRect.bottom + gap;
      transformOrigin = getTransformOrigin("bottom");
      if (popoverHeight > spaceBelow) maxHeight = spaceBelow - gap;
    } else {
      transformOrigin = getTransformOrigin("top");
      top = anchorRect.top - popoverHeight - gap;
      if (popoverHeight > spaceAbove) maxHeight = spaceAbove - gap;
    }

    left = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2;

    if (left < 10) left = 10;
    else if (left + popoverWidth > viewportWidth - 10)
      left = viewportWidth - popoverWidth - 10;

    return { top, left, maxHeight, transformOrigin, bottom };
  }

  switch (anchor) {
    case "top":
      top = anchorRect.top - popoverHeight - gap;
      left = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2;
      break;
    case "top-start":
      top = anchorRect.top - popoverHeight - gap;
      left = anchorRect.left;
      break;
    case "top-end":
      top = anchorRect.top - popoverHeight - gap;
      left = anchorRect.right - popoverWidth;
      break;
    case "bottom":
      top = anchorRect.bottom + gap;
      left = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2;
      break;
    case "bottom-start":
      top = anchorRect.bottom + gap;
      left = anchorRect.left;
      break;
    case "bottom-end":
      top = anchorRect.bottom + gap;
      left = anchorRect.right - popoverWidth;
      break;
    case "left":
      top = anchorRect.top + anchorRect.height / 2 - popoverHeight / 2;
      left = anchorRect.left - popoverWidth - gap;
      break;
    case "left-start":
      top = anchorRect.top;
      left = anchorRect.left - popoverWidth - gap;
      break;
    case "left-end":
      top = anchorRect.bottom - popoverHeight;
      left = anchorRect.left - popoverWidth - gap;
      break;
    case "right":
      top = anchorRect.top + anchorRect.height / 2 - popoverHeight / 2;
      left = anchorRect.right + gap;
      break;
    case "right-start":
      top = anchorRect.top;
      left = anchorRect.right + gap;
      break;
    case "right-end":
      top = anchorRect.bottom - popoverHeight;
      left = anchorRect.right + gap;
      break;
    default:
      top = anchorRect.bottom + gap;
      left = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2;
  }

  if (left < 10) left = 10;
  else if (left + popoverWidth > viewportWidth - 10)
    left = viewportWidth - popoverWidth - 10;

  if (top < 10) top = 10;
  else if (top + popoverHeight > viewportHeight - 10)
    top = viewportHeight - popoverHeight - 10;

  return { top, left, maxHeight, transformOrigin, bottom };
};

export default function Popover({
  trigger,
  children,
  anchor = "bottom",
  gap = 8,
  followWidthAnchor = false,
  onlyShowUpOrDown = false,
  onlyShowCenterBody = false,
  interaction = "click",
  classNames,
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    const dialogEl = dialogRef.current;
    const innerEl = innerRef.current;
    if (!triggerEl || !dialogEl || !innerEl) return;

    if (followWidthAnchor) {
      dialogEl.style.width = `${triggerEl.offsetWidth}px`;
    }

    const anchorRect = triggerEl.getBoundingClientRect();
    const popoverWidth = innerEl.offsetWidth;
    const popoverHeight = innerEl.offsetHeight;

    const pos = calculatePosition(
      anchor,
      anchorRect,
      popoverWidth,
      popoverHeight,
      gap,
      onlyShowUpOrDown,
      onlyShowCenterBody,
    );

    // Posisi top/left diterapkan di level dialog
    dialogEl.style.margin = "0";
    dialogEl.style.left = `${pos.left}px`;
    dialogEl.style.top = typeof pos.top === "number" ? `${pos.top}px` : "auto";
    dialogEl.style.bottom =
      typeof pos.bottom === "number" ? `${pos.bottom}px` : "auto";
    if (typeof pos.maxHeight === "number")
      dialogEl.style.maxHeight = `${pos.maxHeight}px`;
    if (pos.transformOrigin)
      innerEl.style.transformOrigin = pos.transformOrigin;
  }, [anchor, gap, followWidthAnchor, onlyShowUpOrDown, onlyShowCenterBody]);

  const openPopover = () => {
    const dialog = dialogRef.current;
    const inner = innerRef.current;
    if (!dialog || !inner) return;

    setIsOpen(true);
    dialog.showModal();

    updatePosition();

    void inner.offsetWidth;

    inner.setAttribute("data-state", "open");
  };

  const closePopover = () => {
    const dialog = dialogRef.current;
    const inner = innerRef.current;
    if (!dialog || !inner) return;

    inner.removeAttribute("data-state");

    setTimeout(() => {
      dialog.close();
      setIsOpen(false);
    }, 150);
  };

  const togglePopover = () => {
    if (isOpen) closePopover();
    else openPopover();
  };

  useLayoutEffect(() => {
    if (!isOpen) return;

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  return (
    <>
      <div
        ref={triggerRef}
        className={twMerge("inline-block", classNames?.trigger)}
        onClick={interaction === "click" ? togglePopover : undefined}
        onMouseEnter={interaction === "focus" ? openPopover : undefined}
        onMouseLeave={interaction === "focus" ? closePopover : undefined}
      >
        {trigger}
      </div>

      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          e.preventDefault();
          closePopover();
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) closePopover();
        }}
        className={twMerge(
          "fixed p-0 m-0 border-0 bg-transparent overflow-visible backdrop:bg-transparent",
          classNames?.popover,
        )}
      >
        <div
          ref={innerRef}
          className={twMerge(
            "transition-all duration-150 ease-out transform",
            "opacity-0 scale-95 pointer-events-none",
            "data-[state=open]:opacity-100 data-[state=open]:scale-100 data-[state=open]:pointer-events-auto",
          )}
        >
          <div className="bg-bg-paper border border-divider rounded-3xl p-2 shadow-xl">
            {typeof children === "function" ? children(closePopover) : children}
          </div>
        </div>
      </dialog>
    </>
  );
}
