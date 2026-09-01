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
  popoverRect: DOMRect,
  gap = 8,
  onlyShowUpOrDown?: boolean,
  onlyShowCenterBody?: boolean,
) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const scaledWidth = popoverRect.width;
  const scaledHeight = popoverRect.height;

  let top: number | undefined;
  let left = 0;
  let bottom: number | undefined;
  let maxHeight: number | undefined;
  let transformOrigin: string | undefined = getTransformOrigin(anchor);

  if (onlyShowCenterBody) {
    let l = (viewportWidth - scaledWidth) / 2;
    let t = (viewportHeight - scaledHeight) / 2;

    if (l < 10) l = 10;
    else if (l + scaledWidth > viewportWidth)
      l = viewportWidth - scaledWidth - 10;

    if (t < 10) t = 10;
    else if (t + scaledHeight > viewportHeight)
      t = viewportHeight - scaledHeight - 10;

    return { top: t, left: l, transformOrigin: "center center" };
  }

  if (onlyShowUpOrDown) {
    const spaceBelow = viewportHeight - anchorRect.bottom;
    const spaceAbove = anchorRect.top;

    if (spaceBelow >= scaledHeight || spaceBelow >= spaceAbove) {
      top = anchorRect.bottom + gap;
      transformOrigin = getTransformOrigin("bottom");
      if (scaledHeight > spaceBelow) maxHeight = spaceBelow - gap;
    } else {
      transformOrigin = getTransformOrigin("top");
      top = anchorRect.top - scaledHeight - gap;
      if (scaledHeight > spaceAbove) maxHeight = spaceAbove - gap;
    }

    left = anchorRect.left + anchorRect.width / 2 - scaledWidth / 2;

    if (left < 10) left = 10;
    else if (left + scaledWidth > viewportWidth - 10)
      left = viewportWidth - scaledWidth - 10;

    return { top, left, maxHeight, transformOrigin, bottom };
  }

  switch (anchor) {
    case "top":
      top = anchorRect.top - scaledHeight - gap;
      left = anchorRect.left + anchorRect.width / 2 - scaledWidth / 2;
      break;
    case "top-start":
      top = anchorRect.top - scaledHeight - gap;
      left = anchorRect.left;
      break;
    case "top-end":
      top = anchorRect.top - scaledHeight - gap;
      left = anchorRect.right - scaledWidth;
      break;
    case "bottom":
      top = anchorRect.bottom + gap;
      left = anchorRect.left + anchorRect.width / 2 - scaledWidth / 2;
      break;
    case "bottom-start":
      top = anchorRect.bottom + gap;
      left = anchorRect.left;
      break;
    case "bottom-end":
      top = anchorRect.bottom + gap;
      left = anchorRect.right - scaledWidth;
      break;
    case "left":
      top = anchorRect.top + anchorRect.height / 2 - scaledHeight / 2;
      left = anchorRect.left - scaledWidth - gap;
      break;
    case "left-start":
      top = anchorRect.top;
      left = anchorRect.left - scaledWidth - gap;
      break;
    case "left-end":
      top = anchorRect.bottom - scaledHeight;
      left = anchorRect.left - scaledWidth - gap;
      break;
    case "right":
      top = anchorRect.top + anchorRect.height / 2 - scaledHeight / 2;
      left = anchorRect.right + gap;
      break;
    case "right-start":
      top = anchorRect.top;
      left = anchorRect.right + gap;
      break;
    case "right-end":
      top = anchorRect.bottom - scaledHeight;
      left = anchorRect.right + gap;
      break;
    default:
      top = anchorRect.bottom + gap;
      left = anchorRect.left + anchorRect.width / 2 - scaledWidth / 2;
  }

  if (left < 10) left = 10;
  else if (left + scaledWidth > viewportWidth - 10)
    left = viewportWidth - scaledWidth - 10;

  if (top < 10) top = 10;
  else if (top + scaledHeight > viewportHeight - 10)
    top = viewportHeight - scaledHeight - 10;

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

  // Kalkulasi posisi diekstrak ke fungsi terpisah agar dapat dipanggil instan
  const updatePosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    const dialogEl = dialogRef.current;
    if (!triggerEl || !dialogEl) return;

    if (followWidthAnchor) {
      dialogEl.style.width = `${triggerEl.offsetWidth}px`;
    }

    const anchorRect = triggerEl.getBoundingClientRect();
    const popoverRect = dialogEl.getBoundingClientRect();

    const pos = calculatePosition(
      anchor,
      anchorRect,
      popoverRect,
      gap,
      onlyShowUpOrDown,
      onlyShowCenterBody,
    );

    dialogEl.style.margin = "0";
    dialogEl.style.left = `${pos.left}px`;
    if (typeof pos.top === "number") dialogEl.style.top = `${pos.top}px`;
    if (typeof pos.bottom === "number")
      dialogEl.style.bottom = `${pos.bottom}px`;
    if (typeof pos.maxHeight === "number")
      dialogEl.style.maxHeight = `${pos.maxHeight}px`;
    if (pos.transformOrigin)
      dialogEl.style.transformOrigin = pos.transformOrigin;
  }, [anchor, gap, followWidthAnchor, onlyShowUpOrDown, onlyShowCenterBody]);

  const openPopover = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    setIsOpen(true);
    dialog.showModal();

    // 1. Terapkan koordinat posisi LANGSUNG sebelum browser melakukan repaint
    updatePosition();

    // 2. Jalankan animasi opacity & scale setelah posisi terpasang presisi
    requestAnimationFrame(() => {
      requestAnimationFrame(() => dialog.setAttribute("data-state", "open"));
    });
  };

  const closePopover = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.removeAttribute("data-state");

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
          "fixed p-0 border-0 bg-transparent overflow-visible backdrop:bg-transparent",
          "transition-[opacity,transform] duration-150 ease-out",
          "opacity-0 scale-95 pointer-events-none",
          "data-[state=open]:opacity-100 data-[state=open]:scale-100 data-[state=open]:pointer-events-auto",
          classNames?.popover,
        )}
      >
        <div className="bg-bg-paper border border-divider rounded-3xl p-2 shadow-xl">
          {typeof children === "function" ? children(closePopover) : children}
        </div>
      </dialog>
    </>
  );
}
