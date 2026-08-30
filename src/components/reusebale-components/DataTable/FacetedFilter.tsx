import { Filter } from "lucide-react";
import Popover from "../../ui/Popover";

interface FacetedFilterProps {
  title: string;
  options: { label: string; value: string }[];
  currentValue: string;
  onChange: (val: string) => void;
}

export default function FacetedFilter({
  title,
  options,
  currentValue,
  onChange,
}: FacetedFilterProps) {
  const selectedValues = new Set(currentValue ? currentValue.split(",") : []);

  const handleSelect = (val: string) => {
    const newValues = new Set(selectedValues);
    if (newValues.has(val)) newValues.delete(val);
    else newValues.add(val);
    onChange(Array.from(newValues).join(","));
  };

  const triggerElement = (
    <div
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
    </div>
  );

  return (
    <Popover
      trigger={triggerElement}
      position="bottom-left"
      interaction="click"
    >
      {(closePopover) => (
        <div className="w-48 p-1">
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
                  closePopover();
                }}
                className="w-full text-xs text-center text-red-600 hover:text-red-700 font-medium py-1"
              >
                Hapus Filter
              </button>
            </div>
          )}
        </div>
      )}
    </Popover>
  );
}
