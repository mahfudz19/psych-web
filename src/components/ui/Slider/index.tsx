"use client";

import type React from "react";
import { useState, useCallback, useRef, useEffect, useMemo, memo } from "react";
import { twMerge } from "tailwind-merge";

export interface SliderProps {
  value?: number | number[];
  defaultValue?: number | number[];
  min?: number;
  max?: number;
  toFixed?: number;
  step?: number | null;
  marks?: boolean | { value: number; label?: string }[];
  orientation?: "horizontal" | "vertical";
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  disabled?: boolean;
  valueLabelDisplay?: "auto" | "on" | "off";
  disableSwap?: boolean;
  onChange?: (value: number | number[]) => void;
  onChangeCommitted?: (value: number | number[]) => void;
  className?: string;
  name?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

// Constants - moved outside component to prevent recreation
const COLOR_CLASSES = {
  primary: "bg-primary-main focus:ring-primary-main",
  secondary: "bg-secondary-main focus:ring-secondary-main",
  error: "bg-error-main focus:ring-error-main",
  info: "bg-info-main focus:ring-info-main",
  success: "bg-success-main focus:ring-success-main",
  warning: "bg-warning-main focus:ring-warning-main",
} as const;

const SIZE_CLASSES = {
  small: {
    track: "h-2",
    thumb: "w-4 h-4",
    container: (orientation: string) =>
      orientation === "vertical" ? "w-2 h-32" : "w-full",
  },
  medium: {
    track: "h-3",
    thumb: "w-5 h-5",
    container: (orientation: string) =>
      orientation === "vertical" ? "w-3 h-40" : "w-full",
  },
  large: {
    track: "h-4",
    thumb: "w-6 h-6",
    container: (orientation: string) =>
      orientation === "vertical" ? "w-4 h-48" : "w-full",
  },
} as const;

// Utility functions - memoized to prevent recreation
const getPercentage = (val: number, min: number, max: number): number => {
  return ((val - min) / (max - min)) * 100;
};

const clampValue = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

// Memoized Mark component to prevent unnecessary re-renders
interface MarkProps {
  mark: { value: number; label?: string };
  percentage: number;
  orientation: "horizontal" | "vertical";
  size: "small" | "medium" | "large";
  firstMark: boolean;
  lastMark: boolean;
}
const Mark = memo<MarkProps>(
  ({ mark, percentage, orientation, size, firstMark, lastMark }) => (
    <div
      className={twMerge(
        "absolute text-xs text-center",
        orientation === "vertical" ? "w-full flex" : "h-full",
        orientation === "vertical"
          ? "left-full ml-2 whitespace-nowrap"
          : "top-ful justify-center whitespace-nowrap",
      )}
      style={{
        [orientation === "vertical" ? "bottom" : "left"]: `${percentage}%`,
        transform:
          orientation === "vertical" ? "translateY(50%)" : "translateX(-50%)",
      }}
    >
      <div
        className={
          orientation === "vertical"
            ? `${size === "small" ? "-ml-1" : size === "medium" ? "-ml-1.5" : size === "large" ? "-ml-2" : ""}`
            : `${size === "small" ? "-mt-3.5" : size === "medium" ? "mt-[-0.975rem]" : size === "large" ? "mt-[-1.1rem]" : ""}`
        }
      >
        <div
          className={twMerge(
            "bg-gray-600 rounded-full inline-block",
            orientation === "vertical" ? "w-1 h-1 -ml-4" : `w-1 h-1 mx-auto`,
            firstMark || lastMark ? "opacity-0" : "",
          )}
        />
      </div>
      {mark.label && (
        <div
          className={twMerge(
            "text-gray-600",
            "inline-block",
            orientation === "vertical" ? "ml-2" : "mt-2",
          )}
        >
          {mark.label}
        </div>
      )}
    </div>
  ),
);

Mark.displayName = "Mark";

// Memoized ValueLabel component
const ValueLabel = memo<{
  value: number;
  percentage: number;
  orientation: "horizontal" | "vertical";
  show: boolean;
}>(({ value, percentage, orientation, show }) => {
  if (!show) return null;

  return (
    <div
      className={twMerge(
        "absolute bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap",
        orientation === "vertical" ? "right-full mr-2" : "bottom-full mb-2",
      )}
      style={{
        [orientation === "vertical" ? "bottom" : "left"]: `${percentage}%`,
        transform:
          orientation === "vertical" ? "translateY(50%)" : "translateX(-50%)",
      }}
    >
      {value}
      <div
        className={twMerge(
          "absolute w-0 h-0 border-4 border-transparent",
          orientation === "vertical"
            ? "left-full top-1/2 -translate-y-1/2 border-l-gray-800"
            : "top-full left-1/2 -translate-x-1/2 border-t-gray-800",
        )}
      />
    </div>
  );
});

ValueLabel.displayName = "ValueLabel";

// Memoized Thumb component
interface ThumbProps {
  value: number;
  index: number;
  percentage: number;
  orientation: "horizontal" | "vertical";
  size: "small" | "medium" | "large";
  color: keyof typeof COLOR_CLASSES;
  disabled: boolean;
  isDragging: boolean;
  isActive: boolean;
  isFocused: boolean;
  showLabel: boolean;
  onMouseDown: (e: React.MouseEvent, index: number) => void;
  onKeyDown: (e: React.KeyboardEvent, index: number) => void;
  onFocus: (index: number) => void;
  min: number;
  max: number;
}
const Thumb = memo<ThumbProps>((props) => {
  const {
    value,
    index,
    percentage,
    orientation,
    size,
    color,
    disabled,
    isDragging,
    isActive,
    isFocused,
    showLabel,
    onMouseDown,
    onKeyDown,
    onFocus,
    min,
    max,
  } = props;
  const sizeConfig = SIZE_CLASSES[size];

  return (
    <div>
      <div
        className={twMerge(
          "absolute rounded-full border-2 z-10 border-white shadow-md cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-offset-2",
          COLOR_CLASSES[color],
          sizeConfig.thumb,
          disabled && "cursor-not-allowed",
          isDragging && isActive && "scale-110",
          isFocused && "ring-2",
        )}
        style={{
          touchAction: "none",
          [orientation === "vertical" ? "bottom" : "left"]:
            `${orientation === "vertical" ? percentage - 12 : percentage}%`,
          [orientation === "vertical" ? "left" : "top"]: "50%",
        }}
        onMouseDown={(e) => onMouseDown(e, index)}
        onTouchStart={(e) => {
          e.preventDefault();
          onMouseDown(e as any, index);
        }}
        onKeyDown={(e) => onKeyDown(e, index)}
        onFocus={() => onFocus(index)}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-orientation={orientation}
        tabIndex={disabled ? -1 : 0}
      />
      <ValueLabel
        value={value}
        percentage={percentage}
        orientation={orientation}
        show={showLabel}
      />
    </div>
  );
});
Thumb.displayName = "Thumb";

const Slider: React.FC<SliderProps> = memo((props) => {
  const {
    value: controlledValue,
    defaultValue = 0,
    min = 0,
    max = 100,
    step = 1,
    marks = false,
    orientation = "horizontal",
    size = "medium",
    color = "primary",
    disabled = false,
    valueLabelDisplay = "auto",
    disableSwap = false,
    onChange,
    onChangeCommitted,
    className,
    toFixed,
    name,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
  } = props;
  // State management
  const [internalValue, setInternalValue] = useState<
    number | number[] | undefined
  >(controlledValue ?? defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const [activeThumb, setActiveThumb] = useState<number>(0);
  const [focusedThumb, setFocusedThumb] = useState<number>(0);

  // Refs
  const sliderRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Computed values - memoized to prevent recalculation
  const isControlled = useMemo(
    () => controlledValue !== undefined,
    [controlledValue],
  );
  const value = useMemo(
    () => (isControlled ? controlledValue : internalValue),
    [isControlled, controlledValue, internalValue],
  );
  const isRange = useMemo(() => Array.isArray(value), [value]);
  const values = useMemo(
    () => (isRange ? (value as number[]) : [value as number]),
    [isRange, value],
  );

  // Memoized configuration
  const sizeConfig = useMemo(() => SIZE_CLASSES[size], [size]);
  const containerClass = useMemo(
    () => sizeConfig.container(orientation),
    [sizeConfig, orientation],
  );

  // Memoized marks array
  const markArray = useMemo(() => {
    if (!marks) return [];

    return Array.isArray(marks)
      ? marks
      : Array.from(
          { length: Math.floor((max - min) / (step || 1)) + 1 },
          (_, i) => ({
            value: min + i * (step || 1),
          }),
        );
  }, [marks, max, min, step]);

  // Update internal value when controlled value changes
  useEffect(() => {
    if (isControlled) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue, isControlled]);

  // Update hidden input value for form submission
  useEffect(() => {
    if (inputRef.current && name) {
      inputRef.current.value = isRange
        ? values.join(",")
        : values[0].toString();
    }
  }, [values, isRange, name]);

  // Memoized value calculation function
  const getValueFromPosition = useCallback(
    (position: number, rect: DOMRect): number => {
      let percentage: number;

      if (orientation === "vertical") {
        percentage = ((rect.bottom - position) / rect.height) * 100;
      } else {
        percentage = ((position - rect.left) / rect.width) * 100;
      }

      percentage = Math.max(0, Math.min(100, percentage));
      let newValue = min + (percentage / 100) * (max - min);

      if (step && step > 0) {
        newValue = Math.round(newValue / step) * step;
      } else if (Array.isArray(marks)) {
        // Snap to nearest mark
        const markValues = marks.map((mark) => mark.value);
        newValue = markValues.reduce((prev, curr) =>
          Math.abs(curr - newValue) < Math.abs(prev - newValue) ? curr : prev,
        );
      }

      return clampValue(newValue, min, max);
    },
    [min, max, step, marks, orientation],
  );

  // Optimized value update function
  const updateValue = useCallback(
    (newValue: number, thumbIndex = 0): number | number[] => {
      let newValues = [...values];

      if (isRange) {
        newValues[thumbIndex] = newValue;

        // Handle swapping logic
        if (!disableSwap && newValues.length === 2) {
          if (thumbIndex === 0 && newValues[0] > newValues[1]) {
            newValues = [newValues[1], newValues[0]];
            setActiveThumb(1);
            setFocusedThumb(1);
          } else if (thumbIndex === 1 && newValues[1] < newValues[0]) {
            newValues = [
              Number(newValues[1].toFixed(toFixed ?? 2)),
              Number(newValues[0].toFixed(toFixed ?? 2)),
            ];
            setActiveThumb(0);
            setFocusedThumb(0);
          }
        }

        if (!isControlled) setInternalValue(newValues);
        onChange?.(newValues);
        return newValues;
      } else {
        newValue = Number(newValue.toFixed(toFixed ?? 2));
        if (!isControlled) setInternalValue(newValue);
        onChange?.(newValue);
        return newValue;
      }
    },
    [values, isRange, disableSwap, isControlled, onChange, toFixed],
  );

  // Keyboard event handler
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, thumbIndex: number) => {
      if (disabled) return;

      const currentValue = values[thumbIndex];
      let newValue = currentValue;
      const stepSize = step || 1;

      switch (event.key) {
        case "ArrowRight":
        case "ArrowUp":
          event.preventDefault();
          newValue = Math.min(max, currentValue + stepSize);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          event.preventDefault();
          newValue = Math.max(min, currentValue - stepSize);
          break;
        case "PageUp":
          event.preventDefault();
          newValue = Math.min(max, currentValue + stepSize * 10);
          break;
        case "PageDown":
          event.preventDefault();
          newValue = Math.max(min, currentValue - stepSize * 10);
          break;
        case "Home":
          event.preventDefault();
          newValue = min;
          break;
        case "End":
          event.preventDefault();
          newValue = max;
          break;
        default:
          return;
      }

      const finalValue = updateValue(newValue, thumbIndex);
      onChangeCommitted?.(finalValue);
    },
    [disabled, values, step, max, min, updateValue, onChangeCommitted],
  );

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (event: React.MouseEvent, thumbIndex: number) => {
      if (disabled) return;

      event.preventDefault();
      setIsDragging(true);
      setActiveThumb(thumbIndex);
      setFocusedThumb(thumbIndex);

      const handleMouseMove = (e: MouseEvent) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const newValue = getValueFromPosition(
          orientation === "vertical" ? e.clientY : e.clientX,
          rect,
        );
        updateValue(newValue, thumbIndex);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        onChangeCommitted?.(isRange ? values : values[0]);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };

      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        const newValue = getValueFromPosition(
          orientation === "vertical" ? touch.clientY : touch.clientX,
          rect,
        );
        updateValue(newValue, thumbIndex);
      };

      const handleTouchEnd = () => {
        setIsDragging(false);
        onChangeCommitted?.(isRange ? values : values[0]);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd, { passive: false });
    },
    [
      disabled,
      getValueFromPosition,
      orientation,
      updateValue,
      onChangeCommitted,
      isRange,
      values,
    ],
  );

  const handleTrackClick = useCallback(
    (event: React.MouseEvent) => {
      if (disabled || isDragging) return;

      const rect = sliderRef.current?.getBoundingClientRect();
      if (!rect) return;

      const newValue = getValueFromPosition(
        orientation === "vertical" ? event.clientY : event.clientX,
        rect,
      );

      if (isRange) {
        // Find closest thumb
        const distances = values.map((val) => Math.abs(val - newValue));
        const closestThumb = distances[0] <= distances[1] ? 0 : 1;
        const finalValue = updateValue(newValue, closestThumb);
        onChangeCommitted?.(finalValue);
      } else {
        const finalValue = updateValue(newValue, 0);
        onChangeCommitted?.(finalValue);
      }
    },
    [
      disabled,
      isDragging,
      values,
      isRange,
      getValueFromPosition,
      orientation,
      updateValue,
      onChangeCommitted,
    ],
  );

  const handleFocus = useCallback((index: number) => {
    setFocusedThumb(index);
  }, []);

  // Render functions
  const renderMarks = useMemo(() => {
    return markArray.map((mark, index) => {
      const percentage = getPercentage(mark.value, min, max);
      return (
        <Mark
          key={`${mark.value}-${index}`}
          mark={mark}
          size={size}
          percentage={percentage}
          orientation={orientation}
          firstMark={index === 0}
          lastMark={index === markArray.length - 1}
        />
      );
    });
  }, [markArray, min, max, size, orientation]);

  const renderThumbs = useMemo(() => {
    return values.map((val, index) => {
      const percentage = getPercentage(val, min, max);
      const showLabel =
        valueLabelDisplay === "on" ||
        (valueLabelDisplay === "auto" && isDragging && activeThumb === index);

      return (
        <Thumb
          key={index}
          value={val}
          index={index}
          percentage={percentage}
          orientation={orientation}
          size={size}
          color={color}
          disabled={disabled}
          isDragging={isDragging}
          isActive={activeThumb === index}
          isFocused={focusedThumb === index}
          showLabel={showLabel}
          onMouseDown={handleMouseDown}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          min={min}
          max={max}
        />
      );
    });
  }, [
    values,
    min,
    max,
    valueLabelDisplay,
    isDragging,
    activeThumb,
    orientation,
    size,
    color,
    disabled,
    focusedThumb,
    handleMouseDown,
    handleKeyDown,
    handleFocus,
  ]);

  // Memoized filled track style
  const filledTrackStyle = useMemo(() => {
    if (isRange) {
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      return {
        [orientation === "vertical" ? "bottom" : "left"]:
          `${getPercentage(minVal, min, max)}%`,
        [orientation === "vertical" ? "height" : "width"]:
          `${getPercentage(maxVal, min, max) - getPercentage(minVal, min, max)}%`,
      };
    } else {
      return {
        [orientation === "vertical" ? "height" : "width"]:
          `${getPercentage(values[0], min, max)}%`,
      };
    }
  }, [isRange, values, orientation, min, max]);

  return (
    <div className={twMerge("relative", containerClass, className)}>
      {/* Form input */}
      {name && (
        <input
          ref={inputRef}
          type="hidden"
          name={name}
          defaultValue={isRange ? values.join(",") : values[0]}
        />
      )}

      {/* Track Container */}
      <div
        className={twMerge(
          "relative my-auto",
          orientation === "vertical" ? "w-[inherit] h-full" : "w-full",
        )}
      >
        {/* Track */}
        <div
          ref={sliderRef}
          className={twMerge(
            "relative bg-gray-200 rounded-full cursor-pointer",
            sizeConfig.track,
            orientation === "vertical" ? "w-full h-full mx-auto" : "w-full",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          onClick={handleTrackClick}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
        >
          {/* Filled track */}
          <div
            className={twMerge(
              "absolute rounded-full",
              COLOR_CLASSES[color].split(" ")[0],
              sizeConfig.track,
              orientation === "vertical" ? "w-full" : "h-full",
              orientation === "vertical" && !isRange && "bottom-0",
              orientation === "horizontal" && !isRange && "left-0",
            )}
            style={filledTrackStyle}
          />

          {/* Thumbs */}
          {renderThumbs}
        </div>

        {/* Marks */}
        {renderMarks}
      </div>
    </div>
  );
});

Slider.displayName = "Slider";
export default Slider;
