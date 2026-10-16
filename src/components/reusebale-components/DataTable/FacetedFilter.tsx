import { Filter } from "lucide-react";
import Checkbox from "../../ui/Checkbox";
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
      className={`min-h-9 flex items-center justify-between w-full gap-2 px-3 py-2 text-xs border rounded-2xl transition-all font-medium cursor-pointer min-w-56 ${
        selectedValues.size > 0
          ? "border-primary-main bg-primary-main/10 text-primary-main ring-2 ring-primary-main/20"
          : "border-divider bg-bg-paper hover:bg-divider text-text-primary focus:outline-none focus:ring-2 focus:border-primary-main focus:ring-primary-main/20"
      }`}
    >
      <span className="flex items-center gap-2 truncate font-medium">
        <Filter className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{title}</span>
      </span>

      {/* Badge Angka Indikator */}
      {selectedValues.size > 0 && (
        <span className="flex items-center justify-center min-w-4.5 h-4.5 px-1 ml-1 text-[10px] font-bold text-white rounded-full bg-primary-main shadow-sm">
          {selectedValues.size}
        </span>
      )}
    </div>
  );

  return (
    <Menu trigger={triggerElement} position="bottom-start">
      {(closePopover) => (
        <>
          {options.map((opt) => {
            const isSelected = selectedValues.has(opt.value);
            return (
              <MenuItem
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                iconStart={
                  <Checkbox
                    checked={isSelected}
                    onClick={(e) => e.stopPropagation()}
                  />
                }
                className="relative flex items-center gap-3 px-2 py-2 hover:bg-divider/20 rounded-xl cursor-pointer transition-colors group"
                classNames={{ iconStart: "flex items-center" }}
              >
                {/* Teks Label */}
                <span
                  className={` flex-1 truncate transition-colors ${
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
        </>
      )}
    </Menu>
  );
}
