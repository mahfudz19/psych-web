import { useState, useRef, type ChangeEvent } from "react";
import { twMerge } from "tailwind-merge";
import { cva } from "class-variance-authority";
import type { InputProps } from "../Input";

const inputColorVariants = cva(
  "flex items-center gap-3 rounded-2xl border border-divider bg-bg-default text-text-primary transition-all font-medium focus-within:ring-2 disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:opacity-60 overflow-hidden",
  {
    variants: {
      color: {
        primary:
          "focus-within:border-primary-main focus-within:ring-primary-main/20",
        secondary:
          "focus-within:border-secondary-main focus-within:ring-secondary-main/20",
        success:
          "focus-within:border-success-main focus-within:ring-success-main/20",
        warning:
          "focus-within:border-warning-main focus-within:ring-warning-main/20",
        error: "focus-within:border-error-main focus-within:ring-error-main/20",
        info: "focus-within:border-info-main focus-within:ring-info-main/20",
        white: "focus-within:border-white focus-within:ring-white/20",
      },
      size: {
        sm: "px-3 py-1.5",
        md: "px-4 py-2",
        lg: "px-5 py-2.5",
      },
    },
    defaultVariants: {
      color: "primary",
      size: "md",
    },
  },
);

// Helper untuk memastikan <input type="color"> selalu menerima format Hex yang valid
const getValidHex = (val: string) => {
  if (/^#[0-9A-F]{6}$/i.test(val)) return val;
  // Jika formatnya RGB, ubah ke Hex agar indikator warna tetap bekerja
  const rgbMatch = val.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    const hex = (x: string) => parseInt(x).toString(16).padStart(2, "0");
    return `#${hex(rgbMatch[1])}${hex(rgbMatch[2])}${hex(rgbMatch[3])}`;
  }
  return "#000000"; // Fallback aman
};

function InputColor({
  color,
  size,
  className,
  value,
  onChange,
  ...restProps
}: InputProps) {
  const [colorValue, setColorValue] = useState(value || "#000000");
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setColorValue(e.target.value);
    if (onChange) onChange(e);
  };

  const handleWrapperClick = () => colorInputRef.current?.click();

  return (
    <div
      className={twMerge(
        inputColorVariants({ color, size }),
        "w-max cursor-pointer",
        className,
      )}
      onClick={handleWrapperClick}
    >
      {/* Indikator Warna Kiri (Selalu menerima Hex) */}
      <input
        ref={colorInputRef}
        type="color"
        value={getValidHex(colorValue.toString())}
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()}
        className="h-6 w-6 shrink-0 cursor-pointer appearance-none bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-md border border-divider/50 shadow-sm rounded-md"
      />

      {/* Input Teks Kanan (Lebar dinamis mengikuti ch) */}
      <input
        type="text"
        value={colorValue}
        onChange={handleChange}
        placeholder="#000000"
        onClick={(e) => e.stopPropagation()}
        style={{ width: `${Math.max(7, colorValue.toString().length)}ch` }}
        className={twMerge(
          "bg-transparent placeholder:text-text-disabled focus:outline-none uppercase",
          size === "sm" ? "text-xs" : size === "lg" ? "text-md" : "text-sm",
        )}
        {...restProps}
      />
    </div>
  );
}

export default InputColor;
