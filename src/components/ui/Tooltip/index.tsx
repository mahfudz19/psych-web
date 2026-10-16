import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
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
  delay?: number;
  disabled?: boolean;
  classNames?: { trigger?: string; tooltip?: string };
}

export const getTransformOrigin = (pos: TooltipPosition): string => {
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
  const innerRef = useRef<HTMLDivElement>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const updatePosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    const tooltipEl = tooltipRef.current;
    const innerEl = innerRef.current;
    if (!triggerEl || !tooltipEl || !innerEl) return;

    const tRect = triggerEl.getBoundingClientRect();

    const pWidth = innerEl.offsetWidth;
    const pHeight = innerEl.offsetHeight;
    const gap = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top-left":
        top = tRect.top - pHeight - gap;
        left = tRect.left;
        break;
      case "top-center":
        top = tRect.top - pHeight - gap;
        left = tRect.left + tRect.width / 2 - pWidth / 2;
        break;
      case "top-right":
        top = tRect.top - pHeight - gap;
        left = tRect.right - pWidth;
        break;
      case "bottom-left":
        top = tRect.bottom + gap;
        left = tRect.left;
        break;
      case "bottom-center":
        top = tRect.bottom + gap;
        left = tRect.left + tRect.width / 2 - pWidth / 2;
        break;
      case "bottom-right":
        top = tRect.bottom + gap;
        left = tRect.right - pWidth;
        break;
      case "left-top":
        top = tRect.top;
        left = tRect.left - pWidth - gap;
        break;
      case "left-center":
        top = tRect.top + tRect.height / 2 - pHeight / 2;
        left = tRect.left - pWidth - gap;
        break;
      case "left-bottom":
        top = tRect.bottom - pHeight;
        left = tRect.left - pWidth - gap;
        break;
      case "right-top":
        top = tRect.top;
        left = tRect.right + gap;
        break;
      case "right-center":
        top = tRect.top + tRect.height / 2 - pHeight / 2;
        left = tRect.right + gap;
        break;
      case "right-bottom":
        top = tRect.bottom - pHeight;
        left = tRect.right + gap;
        break;
    }

    if (left < 16) left = 16;
    if (left + pWidth > window.innerWidth - 16) {
      left = window.innerWidth - pWidth - 16;
    }
    if (top < 16) top = 16;
    if (top + pHeight > window.innerHeight - 16) {
      top = window.innerHeight - pHeight - 16;
    }

    tooltipEl.style.margin = "0";
    tooltipEl.style.inset = "auto";
    tooltipEl.style.top = `${top}px`;
    tooltipEl.style.left = `${left}px`;

    innerEl.style.transformOrigin = getTransformOrigin(position);
  }, [position]);

  const openTooltip = useCallback(
    (immediate = false) => {
      if (disabled) return;
      clearTimers();
      if (!hasRendered) setHasRendered(true);

      const executeOpen = () => {
        setIsOpen(true);
      };

      if (immediate || delay === 0 || interaction === "click") {
        executeOpen();
      } else {
        timerRef.current = setTimeout(executeOpen, delay);
      }
    },
    [disabled, hasRendered, delay, interaction],
  );

  const closeTooltip = useCallback(
    (immediate = false) => {
      clearTimers();

      const performClose = () => {
        const inner = innerRef.current;
        if (inner) {
          inner.removeAttribute("data-state");
        }

        closeTimerRef.current = setTimeout(() => {
          const tooltip = tooltipRef.current;
          if (tooltip && typeof tooltip.hidePopover === "function") {
            try {
              if (tooltip.matches(":popover-open")) {
                tooltip.hidePopover();
              }
            } catch (e) {}
          }
          setIsOpen(false);
        }, 150);
      };

      if (immediate) {
        const inner = innerRef.current;
        if (inner) inner.removeAttribute("data-state");
        const tooltip = tooltipRef.current;
        if (tooltip && typeof tooltip.hidePopover === "function") {
          try {
            if (tooltip.matches(":popover-open")) tooltip.hidePopover();
          } catch (e) {}
        }
        setIsOpen(false);
      } else if (interaction === "click") {
        performClose();
      } else {
        timerRef.current = setTimeout(performClose, 100);
      }
    },
    [interaction],
  );

  const toggleTooltip = () => {
    if (isOpen) closeTooltip(true);
    else openTooltip(true);
  };

  useLayoutEffect(() => {
    if (!isOpen) return;

    const tooltip = tooltipRef.current;
    const inner = innerRef.current;
    if (!tooltip || !inner) return;

    try {
      if (typeof tooltip.showPopover === "function") {
        if (!tooltip.matches(":popover-open")) {
          tooltip.showPopover();
        }
      }
    } catch (error) {}

    updatePosition();

    void inner.offsetWidth;

    inner.setAttribute("data-state", "open");

    const handleScrollResize = () => updatePosition();
    window.addEventListener("scroll", handleScrollResize, true);
    window.addEventListener("resize", handleScrollResize);

    return () => {
      window.removeEventListener("scroll", handleScrollResize, true);
      window.removeEventListener("resize", handleScrollResize);
    };
  }, [isOpen, updatePosition]);

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
          tooltipRef.current?.contains(target) ||
          innerRef.current?.contains(target)
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
  }, [isOpen, interaction, closeTooltip]);

  useEffect(() => {
    return () => clearTimers();
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
            popover="manual"
            className={twMerge(
              "fixed p-0 m-0 border-0 bg-transparent overflow-visible pointer-events-none z-9999",
            )}
          >
            <div
              ref={innerRef}
              onMouseEnter={
                interaction === "hover" ? () => openTooltip(true) : undefined
              }
              onMouseLeave={
                interaction === "hover" ? () => closeTooltip() : undefined
              }
              className={twMerge(
                "rounded-lg px-2.5 py-1 text-xs font-medium shadow-md border border-divider",
                "bg-bg-paper text-text-primary transition-all duration-150 ease-out transform",
                "opacity-0 scale-95 pointer-events-none",
                "data-[state=open]:opacity-100 data-[state=open]:scale-100",
                interaction === "hover"
                  ? "pointer-events-none"
                  : "data-[state=open]:pointer-events-auto",
                classNames?.tooltip,
              )}
            >
              {typeof children === "function"
                ? children(() => closeTooltip(true))
                : children}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
