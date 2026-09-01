"use client";

import { ChevronDown } from "lucide-react";
import type React from "react";
import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

const SelectorTime = (
  props: TimeSelectorProps & { focusedElement: "hour" | "minute" },
) => {
  const {
    hourValue,
    minuteValue,
    dateType,
    handleTimeChange,
    registerHourRef,
    registerMinuteRef,
    onFocus,
    disabled = false,
    focusedElement,
  } = props;
  const isHour = focusedElement === "hour";
  const isMinute = focusedElement === "minute";

  // Refs for input elements
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);

  // Refs for tracking focus and touch/mouse interactions
  const focusedInputRef = useRef<"hour" | "minute" | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const activePartRef = useRef<"hour" | "minute" | null>(null);

  // Generate arrays of hours and minutes
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );

  // Get current indices
  const hourIndex = Math.max(0, hours.indexOf(hourValue));
  const minuteIndex = Math.max(0, minutes.indexOf(minuteValue));

  // Get visible options (current ± 2)
  const getVisibleOptions = (options: string[], currentIndex: number) => {
    return [-2, -1, 0, 1, 2].map((offset) => {
      const index = (currentIndex + offset + options.length) % options.length;
      return { value: options[index], offset };
    });
  };

  const visibleHours = getVisibleOptions(hours, hourIndex);
  const visibleMinutes = getVisibleOptions(minutes, minuteIndex);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, type: "hour" | "minute") => {
    if (disabled) return;

    const options = type === "hour" ? hours : minutes;
    const currentIndex = type === "hour" ? hourIndex : minuteIndex;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex = (currentIndex - 1 + options.length) % options.length;
      handleTimeChange(options[newIndex], type, dateType);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIndex = (currentIndex + 1) % options.length;
      handleTimeChange(options[newIndex], type, dateType);
    } else if (e.key === "ArrowLeft" && type === "minute") {
      e.preventDefault();
      hourInputRef.current?.focus();
    } else if (e.key === "ArrowRight" && type === "hour") {
      e.preventDefault();
      minuteInputRef.current?.focus();
    }
  };

  // Handle button
  const handleButton = (
    e: React.MouseEvent,
    type: "hour" | "minute",
    button: "up" | "down",
  ) => {
    if (disabled) return;

    const options = type === "hour" ? hours : minutes;
    const currentIndex = type === "hour" ? hourIndex : minuteIndex;

    if (button === "up") {
      e.preventDefault();
      const newIndex = (currentIndex - 1 + options.length) % options.length;
      handleTimeChange(options[newIndex], type, dateType);
    } else if (button === "down") {
      e.preventDefault();
      const newIndex = (currentIndex + 1) % options.length;
      handleTimeChange(options[newIndex], type, dateType);
    }
  };

  // Handle touch start
  const handleTouchStart = (
    e: React.TouchEvent | React.MouseEvent,
    part: "hour" | "minute",
  ) => {
    if (disabled) return;

    e.preventDefault();
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    touchStartYRef.current = clientY;
    activePartRef.current = part;

    // Focus the input
    if (part === "hour") hourInputRef.current?.focus();
    else minuteInputRef.current?.focus();
  };

  // Handle touch move
  const handleTouchMove = (e: TouchEvent | MouseEvent) => {
    if (touchStartYRef.current === null || activePartRef.current === null)
      return;

    e.preventDefault();
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const deltaY = touchStartYRef.current - clientY;

    // Only process if we've moved enough
    if (Math.abs(deltaY) > 5) {
      const options = activePartRef.current === "hour" ? hours : minutes;
      const currentIndex =
        activePartRef.current === "hour" ? hourIndex : minuteIndex;

      // Calculate new index based on direction
      const direction = deltaY > 0 ? 1 : -1;
      const newIndex =
        (currentIndex + direction + options.length) % options.length;

      // Update the value
      handleTimeChange(options[newIndex], activePartRef.current, dateType);

      // Reset touch start position
      touchStartYRef.current = clientY;
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    touchStartYRef.current = null;
    activePartRef.current = null;
  };

  // Set up event listeners for touch/mouse events
  useEffect(() => {
    if (touchStartYRef.current !== null) {
      window.addEventListener("mousemove", handleTouchMove);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("mouseup", handleTouchEnd);
      window.addEventListener("touchend", handleTouchEnd);

      return () => {
        window.removeEventListener("mousemove", handleTouchMove);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("mouseup", handleTouchEnd);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touchStartYRef.current, activePartRef.current, hourIndex, minuteIndex]);

  // Handle focus
  const handleFocus = (part: "hour" | "minute") => {
    focusedInputRef.current = part;
    onFocus(part === "hour" ? "hourInput" : "minuteInput", dateType);
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent) => {
    if (
      e.relatedTarget !== hourInputRef.current &&
      e.relatedTarget !== minuteInputRef.current
    )
      focusedInputRef.current = null;
  };

  return (
    <div
      className={twMerge(
        "relative w-12 sm:w-14 md:w-16 h-60 sm:h-full bg-inherit",
      )}
      onTouchStart={(e) => handleTouchStart(e, focusedElement)}
    >
      <button
        type="button"
        onClick={(e) => handleButton(e, focusedElement, "up")}
        className="absolute bg-inherit top-[1.5px] left-[1.5px] right-[1.5px] flex items-center justify-center active:text-primary-main z-10 text-text-secondary rounded-t-md"
      >
        <ChevronDown className="rotate-180" />
      </button>
      <div className="absolute inset-0 flex flex-col items-center justify-center border-x sm:border sm:rounded-lg border-divider/50 overflow-hidden">
        {(isHour ? visibleHours : visibleMinutes).map(({ value, offset }) => (
          <div
            key={`${focusedElement}-${value}-${offset}`}
            className={twMerge(
              "h-10 flex items-center justify-center transition-all duration-200 w-full",
              offset === 0 ? "text-lg font-bold" : "text-sm text-gray-400",
              Math.abs(offset) > 1 && "opacity-30",
              focusedInputRef.current === focusedElement &&
                offset === 0 &&
                "text-blue-600",
              !disabled && "cursor-pointer",
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) {
                handleTimeChange(value, focusedElement, dateType);
                if (focusedElement === "hour") hourInputRef.current?.focus();
                else minuteInputRef.current?.focus();
              }
            }}
            tabIndex={disabled ? -1 : 0}
            role="button"
            aria-label={`Pilih ${focusedElement} ${value}`}
          >
            {value}
          </div>
        ))}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={twMerge(
              "absolute top-1/2 left-0 right-0 h-10 -mt-5 border-y transition-colors duration-500 border-divider",
              focusedInputRef.current === focusedElement
                ? "bg-primary-main/25"
                : "",
            )}
          />
        </div>
      </div>
      <input
        ref={(el) => {
          if (isHour) {
            hourInputRef.current = el;
            registerHourRef(dateType, el);
          }
          if (isMinute) {
            minuteInputRef.current = el;
            registerMinuteRef(dateType, el);
          }
        }}
        type="text"
        inputMode="none"
        value={isHour ? hourValue : minuteValue}
        onKeyDown={(e) => handleKeyDown(e, focusedElement)}
        onFocus={() => handleFocus(focusedElement)}
        onBlur={handleBlur}
        className="absolute inset-0 opacity-0 pointer-events-none"
        tabIndex={0}
        disabled={disabled}
        aria-label={focusedElement}
      />
      <button
        type="button"
        onClick={(e) => handleButton(e, focusedElement, "down")}
        className="absolute bottom-[1.5px] bg-inherit left-[1.5px] right-[1.5px] flex items-center justify-center active:text-primary-main z-10 text-text-secondary rounded-b-md"
      >
        <ChevronDown />
      </button>
    </div>
  );
};

type TimeSelectorProps = {
  hourValue: string;
  minuteValue: string;
  dateType: "start" | "end";
  handleTimeChange: (
    value: string,
    type: "hour" | "minute",
    dateType?: "start" | "end",
  ) => void;
  registerHourRef: (dateType: string, el: HTMLInputElement | null) => void;
  registerMinuteRef: (dateType: string, el: HTMLInputElement | null) => void;
  onFocus: (
    element: "hourInput" | "minuteInput",
    dateType: "start" | "end",
  ) => void;
  disabled?: boolean;
  label?: string;
  sm: boolean;
};

export default function TimeSelector(props: TimeSelectorProps) {
  return (
    <div
      className={twMerge(
        "relative flex items-center gap-1 bg-background-paper",
        "border-x sm:border-none sm:p-1",
        props.disabled && "opacity-50 pointer-events-none",
      )}
    >
      <div className="text-xs text-center font-thin uppercase sm:capitalize z-10 absolute -top-0.5 left-2 right-2 flex items-center justify-center">
        <div className="bg-background-paper px-3">{props.label}</div>
      </div>

      {/* Hour selector */}
      <SelectorTime {...props} focusedElement="hour" />
      <div className="text-xl font-bold">:</div>
      {/* Minute selector */}
      <SelectorTime {...props} focusedElement="minute" />
    </div>
  );
}
