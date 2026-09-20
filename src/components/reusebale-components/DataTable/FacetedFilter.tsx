import { Check, Filter } from "lucide-react";
import Menu from "../../ui/Menu";
import MenuItem from "../../ui/Menu/MenuItem";

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
      className={`min-h-9 flex items-center justify-between w-full gap-2 px-3 py-2 text-xs border rounded-2xl transition-colors cursor-pointer min-w-56 ${
        selectedValues.size > 0
          ? "border-primary-main bg-primary-main/10 text-primary-main font-bold ring-1 ring-primary-main/20"
          : "border-divider bg-bg-paper hover:bg-divider text-text-primary"
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
    <Menu trigger={triggerElement} position="bottom-start">
      {(closePopover) => (
        <div className="p-1.5 flex flex-col gap-0.5 max-h-60 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = selectedValues.has(opt.value);
            return (
              <MenuItem
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                iconStart={
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
                }
                className="relative flex items-center gap-3 px-2 py-2 hover:bg-divider/20 rounded-xl cursor-pointer transition-colors group"
              >
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
              </MenuItem>
            );
          })}

          {/* Area Tombol Aksi */}
          {selectedValues.size > 0 && (
            <>
              <div className="mt-2 pt-2 border-t border-divider px-1 pb-1" />
              <MenuItem
                onClick={() => {
                  onChange("");
                  closePopover();
                }}
                className="w-full py-2 text-xs font-bold text-error-main hover:bg-error-main/10 rounded-xl transition-colors"
              >
                Hapus Filter
              </MenuItem>
            </>
          )}
        </div>
      )}
    </Menu>
  );
}
