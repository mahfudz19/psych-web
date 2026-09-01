import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";

export type TooltipPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "left-top"
  | "left-center"
  | "left-bottom"
  | "right-top"
  | "right-center"
  | "right-bottom";

export interface TooltipProps {
  trigger: ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  position?: TooltipPosition;
  interaction?: "hover" | "click";
  delay?: number; // Delay dalam ms sebelum tooltip muncul saat hover
  disabled?: boolean;
  classNames?: {
    trigger?: string;
    tooltip?: string;
  };
}

const getTransformOrigin = (pos: TooltipPosition): string => {
  const map: Record<TooltipPosition, string> = {
    "top-left": "bottom left",
    "top-center": "bottom center",
    "top-right": "bottom right",
    "bottom-left": "top left",
    "bottom-center": "top center",
    "bottom-right": "top right",
    "left-top": "top right",
    "left-center": "center right",
    "left-bottom": "bottom right",
    "right-top": "top left",
    "right-center": "center left",
    "right-bottom": "bottom left",
  };
  return map[pos] || "bottom center";
};

export default function Tooltip({
  trigger,
  children,
  position = "top-center",
  interaction = "hover",
  delay = 150,
  disabled = false,
  classNames,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const openTooltip = (immediate = false) => {
    if (disabled) return;
    clearTimer();
    if (!hasRendered) setHasRendered(true);

    if (immediate || delay === 0 || interaction === "click") {
      setIsOpen(true);
    } else {
      timerRef.current = setTimeout(() => setIsOpen(true), delay);
    }
  };

  const closeTooltip = (immediate = false) => {
    clearTimer();
    if (immediate || interaction === "click") {
      setIsOpen(false);
    } else {
      timerRef.current = setTimeout(() => setIsOpen(false), 100);
    }
  };

  const toggleTooltip = () => {
    if (isOpen) closeTooltip(true);
    else openTooltip(true);
  };

  // Synchronous positioning sebelum browser melakukan repaint
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !tooltipRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const tooltip = tooltipRef.current;
      if (!trigger || !tooltip) return;

      const tRect = trigger.getBoundingClientRect();
      const pRect = tooltip.getBoundingClientRect();
      const gap = 8;

      let top = 0;
      let left = 0;

      switch (position) {
        case "top-left":
          top = tRect.top - pRect.height - gap;
          left = tRect.left;
          break;
        case "top-center":
          top = tRect.top - pRect.height - gap;
          left = tRect.left + tRect.width / 2 - pRect.width / 2;
          break;
        case "top-right":
          top = tRect.top - pRect.height - gap;
          left = tRect.right - pRect.width;
          break;
        case "bottom-left":
          top = tRect.bottom + gap;
          left = tRect.left;
          break;
        case "bottom-center":
          top = tRect.bottom + gap;
          left = tRect.left + tRect.width / 2 - pRect.width / 2;
          break;
        case "bottom-right":
          top = tRect.bottom + gap;
          left = tRect.right - pRect.width;
          break;
        case "left-top":
          top = tRect.top;
          left = tRect.left - pRect.width - gap;
          break;
        case "left-center":
          top = tRect.top + tRect.height / 2 - pRect.height / 2;
          left = tRect.left - pRect.width - gap;
          break;
        case "left-bottom":
          top = tRect.bottom - pRect.height;
          left = tRect.left - pRect.width - gap;
          break;
        case "right-top":
          top = tRect.top;
          left = tRect.right + gap;
          break;
        case "right-center":
          top = tRect.top + tRect.height / 2 - pRect.height / 2;
          left = tRect.right + gap;
          break;
        case "right-bottom":
          top = tRect.bottom - pRect.height;
          left = tRect.right + gap;
          break;
      }

      // Viewport boundary guard
      if (left < 16) left = 16;
      if (left + pRect.width > window.innerWidth - 16) {
        left = window.innerWidth - pRect.width - 16;
      }
      if (top < 16) top = 16;
      if (top + pRect.height > window.innerHeight - 16) {
        top = window.innerHeight - pRect.height - 16;
      }

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
      tooltip.style.transformOrigin = getTransformOrigin(position);
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, position]);

  // Click outside & Escape key listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleEvents = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key === "Escape") {
        closeTooltip(true);
        return;
      }
      if (e instanceof MouseEvent && interaction === "click") {
        const target = e.target as Node;
        if (
          triggerRef.current?.contains(target) ||
          tooltipRef.current?.contains(target)
        ) {
          return;
        }
        closeTooltip(true);
      }
    };

    document.addEventListener("mousedown", handleEvents);
    document.addEventListener("keydown", handleEvents);
    return () => {
      document.removeEventListener("mousedown", handleEvents);
      document.removeEventListener("keydown", handleEvents);
    };
  }, [isOpen, interaction]);

  // Cleanup timer saat unmount
  useEffect(() => {
    return () => clearTimer();
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        className={twMerge("inline-block", classNames?.trigger)}
        onClick={interaction === "click" ? toggleTooltip : undefined}
        onMouseEnter={interaction === "hover" ? () => openTooltip() : undefined}
        onMouseLeave={
          interaction === "hover" ? () => closeTooltip() : undefined
        }
        onFocus={interaction === "hover" ? () => openTooltip(true) : undefined}
        onBlur={interaction === "hover" ? () => closeTooltip(true) : undefined}
      >
        {trigger}
      </div>

      {hasRendered &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            data-state={isOpen ? "open" : "closed"}
            onMouseEnter={
              interaction === "hover" ? () => openTooltip(true) : undefined
            }
            onMouseLeave={
              interaction === "hover" ? () => closeTooltip(true) : undefined
            }
            className={twMerge(
              "fixed z-9999 rounded-lg px-2.5 py-1 text-xs font-medium shadow-md border border-divider",
              "bg-bg-paper text-text-primary transition-all duration-150 ease-out",
              "data-[state=closed]:opacity-0 data-[state=closed]:scale-95 data-[state=closed]:pointer-events-none",
              "data-[state=open]:opacity-100 data-[state=open]:scale-100",
              interaction === "hover"
                ? "pointer-events-none"
                : "pointer-events-auto",
              classNames?.tooltip,
            )}
          >
            {typeof children === "function"
              ? children(() => closeTooltip(true))
              : children}
          </div>,
          document.body,
        )}
    </>
  );
}
