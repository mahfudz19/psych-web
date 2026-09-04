import { Filter, Check } from "lucide-react";
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
      className={`min-h-9 flex cursor-pointer items-center justify-between w-full gap-2 px-3 py-1.5 text-xs border rounded-xl transition-all select-none ${
        selectedValues.size > 0
          ? "border-primary-main bg-primary-main/5 text-primary-main ring-1 ring-primary-main/20"
          : "border-divider bg-bg-paper hover:border-gray-400 text-text-secondary"
      }`}
    >
      <span className="flex items-center gap-2 truncate font-medium">
        <Filter className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{title}</span>
      </span>

      {/* Badge Angka Indikator */}
      {selectedValues.size > 0 && (
        <span className="flex items-center justify-center min-w-5 h-5 px-1 ml-1 text-[10px] font-bold text-white rounded-full bg-primary-main shadow-sm">
          {selectedValues.size}
        </span>
      )}
    </div>
  );

  return (
    <Popover trigger={triggerElement} anchor="bottom-end" interaction="click">
      {(closePopover) => (
        <div className="w-56 p-1.5">
          <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto pr-1">
            {options.map((opt) => {
              const isSelected = selectedValues.has(opt.value);
              return (
                <label
                  key={opt.value}
                  className="relative flex items-center gap-3 px-2 py-2 hover:bg-divider/20 rounded-xl cursor-pointer transition-colors group"
                >
                  {/* Custom Checkbox Design */}
                  <div
                    className={`flex items-center justify-center w-4 h-4 rounded transition-colors ${
                      isSelected
                        ? "bg-primary-main border-primary-main text-white"
                        : "border border-divider bg-transparent group-hover:border-primary-main/50"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3" strokeWidth={3} />
                    )}
                  </div>

                  {/* Teks Label */}
                  <span
                    className={`text-sm flex-1 truncate transition-colors ${
                      isSelected
                        ? "font-bold text-text-primary"
                        : "font-medium text-text-secondary"
                    }`}
                  >
                    {opt.label}
                  </span>

                  {/* Hidden Native Input */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelect(opt.value)}
                    className="hidden"
                  />
                </label>
              );
            })}
          </div>

          {/* Area Tombol Aksi */}
          {selectedValues.size > 0 && (
            <div className="mt-2 pt-2 border-t border-divider px-1 pb-1">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  closePopover();
                }}
                className="w-full py-2 text-xs font-bold text-error-main hover:bg-error-main/10 rounded-xl transition-colors"
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
