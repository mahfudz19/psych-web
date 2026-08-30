import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";

export type PopoverPosition =
  "bottom-right" | "bottom-left" | "right-center" | "left-center" | "top-right";

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  position?: PopoverPosition;
  interaction?: "click" | "focus";
  classNames?: {
    trigger?: string;
    popover?: string;
  };
}

export default function Popover({
  trigger,
  children,
  position = "bottom-right",
  interaction = "click",
  classNames,
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState({ top: 0, left: 0 });
  // State untuk memastikan popover belum ditampilkan sebelum posisinya akurat
  const [isPositionReady, setIsPositionReady] = useState(false);

  const closePopover = () => {
    setIsOpen(false);
    setIsPositionReady(false);
  };

  const togglePopover = () => {
    if (!isOpen) {
      setIsPositionReady(false); // Reset status siap setiap kali mau buka
      setIsOpen(true);
    } else {
      closePopover();
    }
  };

  // Fungsi kalkulasi koordinat
  const calculatePosition = () => {
    if (!triggerRef.current || !popoverRef.current) return;

    const tRect = triggerRef.current.getBoundingClientRect();
    const pRect = popoverRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (position) {
      case "bottom-right":
        top = tRect.bottom + 8;
        left = tRect.right - pRect.width;
        break;
      case "bottom-left":
        top = tRect.bottom + 8;
        left = tRect.left;
        break;
      case "right-center":
        top = tRect.top + tRect.height / 2 - pRect.height / 2;
        left = tRect.right + 8;
        break;
      case "left-center":
        top = tRect.top + tRect.height / 2 - pRect.height / 2;
        left = tRect.left - pRect.width - 8;
        break;
      case "top-right":
        top = tRect.top - pRect.height - 8;
        left = tRect.right - pRect.width;
        break;
    }

    // Deteksi benturan layar
    if (left < 16) left = 16;
    if (left + pRect.width > window.innerWidth - 16) {
      left = window.innerWidth - pRect.width - 16;
    }
    if (top + pRect.height > window.innerHeight - 16) {
      top = tRect.top - pRect.height - 8;
    }

    setCoords({ top, left });
    // Koordinat sudah siap, nyalakan visibilitas secara instan
    setIsPositionReady(true);
  };

  // Gunakan useLayoutEffect agar kalkulasi selesai SEBELUM browser menggambar ke layar
  useLayoutEffect(() => {
    if (isOpen) {
      calculatePosition();
      window.addEventListener("scroll", calculatePosition, true);
      window.addEventListener("resize", calculatePosition);
    }
    return () => {
      window.removeEventListener("scroll", calculatePosition, true);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [isOpen, position]);

  // Click Outside Listener
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        popoverRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      closePopover();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <div
        ref={triggerRef}
        className={twMerge("inline-block", classNames?.trigger)}
        onClick={interaction === "click" ? togglePopover : undefined}
        onMouseEnter={
          interaction === "focus"
            ? () => {
                setIsOpen(true);
                setIsPositionReady(false);
              }
            : undefined
        }
        onMouseLeave={interaction === "focus" ? closePopover : undefined}
      >
        {trigger}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ top: coords.top, left: coords.left }}
            className={twMerge(
              "fixed z-9999 bg-bg-paper rounded-3xl shadow-xl border border-divider p-2",
              "transition-opacity duration-150 ease-out",
              isPositionReady ? "opacity-100 visible" : "opacity-0 invisible",
              classNames?.popover,
            )}
          >
            {typeof children === "function" ? children(closePopover) : children}
          </div>,
          document.body,
        )}
    </>
  );
}
