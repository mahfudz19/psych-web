import { useState, useRef, useEffect } from "react";
import { Filter } from "lucide-react";

interface FacetedFilterProps {
  title: string;
  options: { label: string; value: string }[];
  currentValue: string;
  onChange: (val: string) => void;
}

export function FacetedFilter({
  title,
  options,
  currentValue,
  onChange,
}: FacetedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedValues = new Set(currentValue ? currentValue.split(",") : []);

  const handleSelect = (val: string) => {
    const newValues = new Set(selectedValues);
    if (newValues.has(val)) newValues.delete(val);
    else newValues.add(val);
    onChange(Array.from(newValues).join(","));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full gap-2 px-2 py-1.5 text-xs border rounded-md transition-colors ${
          selectedValues.size > 0
            ? "border-primary-main bg-primary-main/10 text-primary-main font-medium"
            : "border-gray-300 bg-white hover:bg-gray-50 text-gray-600"
        }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          <Filter className="w-3 h-3 shrink-0" />
          Filter {title} {selectedValues.size > 0 && `(${selectedValues.size})`}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2">
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.has(opt.value)}
                  onChange={() => handleSelect(opt.value)}
                  className="rounded border-gray-300 text-primary-main focus:ring-primary-main"
                />
                {opt.label}
              </label>
            ))}
          </div>
          {selectedValues.size > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className="w-full text-xs text-center text-red-600 hover:text-red-700 font-medium py-1"
              >
                Hapus Filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
