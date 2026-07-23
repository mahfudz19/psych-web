"use client";

import {
  forwardRef,
  type MouseEvent,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { type color } from "../Type";
import styles from "./ripple.module.css";

const computeRippleDuration = (
  size: number,
  maxSize = 400,
  min = 250,
  max = 1000,
): number => {
  const scale = Math.min(Math.max(size / maxSize, 0), 1);
  return min + (max - min) * scale;
};

const getRippleColorClasses = (
  color?: color,
): { base: string; sudo: string[] } => {
  switch (color) {
    case "primary":
      return { base: "bg-primary-main", sudo: ["after:bg-primary-main"] };
    case "secondary":
      return { base: "bg-secondary-main", sudo: ["after:bg-secondary-main"] };
    case "white":
      return {
        base: "bg-gray-500 dark:bg-white",
        sudo: ["after:bg-gray-500", "after:dark:bg-white"],
      };
    case "warning":
      return { base: "bg-warning-main", sudo: ["after:bg-warning-main"] };
    case "success":
      return { base: "bg-success-main", sudo: ["after:bg-success-main"] };
    case "info":
      return { base: "bg-info-main", sudo: ["after:bg-info-main"] };
    case "error":
      return { base: "bg-error-main", sudo: ["after:bg-error-main"] };

    default:
      return { base: "bg-white", sudo: ["after:bg-white"] };
  }
};

const setCSSVars = (el: HTMLElement, vars: Record<string, string | number>) => {
  Object.entries(vars).forEach(([key, val]) =>
    el.style.setProperty(key, `${val}`),
  );
};

export interface RippleRef {
  addRipple: (
    event?: MouseEvent | { clientX: number; clientY: number },
    source?: "pointer" | "keyboard",
  ) => void;
  clearRipples: () => void;
}

export interface RippleProps {
  color?: color;
  opacity?: number;
  rippleScale?: number;
  rippleScaleMax?: number;
  centerRipple?: boolean;
}
const Ripple = forwardRef<RippleRef, RippleProps>((props, ref) => {
  const {
    color,
    centerRipple = false,
    opacity = 0.25,
    rippleScale = 0.7,
    rippleScaleMax = 0.8,
  } = props;
  const { base: rippleColor, sudo: sudoColor } = useMemo(
    () => getRippleColorClasses(color),
    [color],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLElement | null>(null);
  const isKeyboardRef = useRef(true);
  const activeRippleRef = useRef<{
    pointer?: HTMLSpanElement;
    keyboard?: HTMLSpanElement;
  }>({});
  const isKeyHeldRef = useRef(false);

  const createRipple = (
    event: MouseEvent | { clientX: number; clientY: number },
    type: "default" | "center",
    source: "pointer" | "keyboard",
  ) => {
    if (!containerRef.current || !parentRef.current) return;

    const rect = parentRef.current.getBoundingClientRect();
    const rippleX = centerRipple ? rect.width / 2 : event.clientX - rect.left;
    const rippleY = centerRipple ? rect.height / 2 : event.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;
    const duration = computeRippleDuration(size);

    const ripple = document.createElement("span");
    ripple.className = rippleColor;
    ripple.dataset.type = `ripple-${type}`;
    ripple.dataset.source = source;

    Object.assign(ripple.style, {
      position: "absolute",
      borderRadius: "50%",
      pointerEvents: "none",
      width: `${size}px`,
      height: `${size}px`,
      left: `${rippleX - size / 2}px`,
      top: `${rippleY - size / 2}px`,
      opacity: `${opacity}`,
      willChange: "transform, opacity",
      transform: "scale(0)",
      transition: `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`,
      contain: "layout paint style",
    });

    containerRef.current.appendChild(ripple);
    activeRippleRef.current[source] = ripple;

    requestAnimationFrame(() => (ripple.style.transform = "scale(1)"));
  };
  const releaseRippleByType = (source: "pointer" | "keyboard") => {
    const ripple = activeRippleRef.current[source];
    if (!ripple) return;

    const rect = ripple.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const duration = computeRippleDuration(size);

    let removed = false;
    const removeRipple = () => {
      if (removed) return;
      removed = true;
      ripple.remove();
      if (activeRippleRef.current[source] === ripple)
        activeRippleRef.current[source] = undefined;
    };

    ripple.style.opacity = "0";
    ripple.addEventListener("transitionend", removeRipple, { once: true });
    setTimeout(removeRipple, duration + 600);
  };

  const createRippleFromCenter = (source: "pointer" | "keyboard") => {
    if (!parentRef.current) return;
    const rect = parentRef.current.getBoundingClientRect();
    createRipple(
      {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
      },
      "center",
      source,
    );
  };

  useImperativeHandle(ref, () => ({
    addRipple: (event, source = "pointer") => {
      if (event) createRipple(event, "default", source);
      else createRippleFromCenter(source);
    },
    clearRipples: () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        activeRippleRef.current = {};
      }
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;
    const parent = containerRef.current.parentElement as HTMLElement;
    if (!parent) return;
    parentRef.current = parent;

    const afterFocusClasses = [...sudoColor, styles.focusPulseAfter];
    const handleFocus = () => {
      if (isKeyboardRef.current && parentRef.current) {
        const rect = parentRef.current.getBoundingClientRect();
        setCSSVars(parentRef.current, {
          "--ripple-size": `${rect.width}px`,
          "--ripple-opacity": `${opacity}`,
          "--ripple-scale": rippleScale,
          "--ripple-scale-max": rippleScaleMax,
        });
        parentRef.current.classList.add(...afterFocusClasses);
      }
    };
    const handleBlur = () => {
      if (!parentRef.current) return;
      if (document.activeElement !== parentRef.current)
        parentRef.current.classList.remove(...afterFocusClasses);
      isKeyboardRef.current = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      isKeyboardRef.current = true;
      if (e.target !== parentRef.current) return;
      if ((e.key === " " || e.key === "Enter") && !isKeyHeldRef.current) {
        isKeyHeldRef.current = true;
        createRippleFromCenter("keyboard");
      }
    };
    const handleKeyUp = () => {
      if (isKeyHeldRef.current) {
        isKeyHeldRef.current = false;
        releaseRippleByType("keyboard");
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      isKeyboardRef.current = false;
      if (e.pointerType === "mouse" || e.pointerType === "touch")
        createRipple(e, "default", "pointer");
    };
    const handlePointerUp = () => releaseRippleByType("pointer");
    const handlePointerCancel = () => releaseRippleByType("pointer");

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        document.activeElement === parentRef.current &&
        isKeyboardRef.current
      ) {
        handleFocus();
      }
    };

    const style = getComputedStyle(parent);
    if (style.position === "static") parent.style.position = "relative";
    if (style.overflow !== "hidden") parent.style.overflow = "hidden";

    parent.addEventListener("focus", handleFocus);
    parent.addEventListener("blur", handleBlur);
    parent.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerCancel);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      parent.removeEventListener("focus", handleFocus);
      parent.removeEventListener("blur", handleBlur);
      parent.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerCancel);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, opacity, rippleScale, rippleScaleMax, centerRipple]);

  return <div ref={containerRef} className={styles.rippleContainer} />;
});

Ripple.displayName = "Ripple";
export default Ripple;
