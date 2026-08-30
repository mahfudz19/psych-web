import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import Popover from "../../ui/Popover";

export default function DateRangeFilter({
  title,
  currentValue,
  onChange,
}: {
  title: string;
  currentValue: string; // Format: "2026-08-01,2026-08-31"
  onChange: (val: string) => void;
}) {
  const [startValue = "", endValue = ""] = currentValue
    ? currentValue.split(",")
    : ["", ""];

  const [localStart, setLocalStart] = useState(startValue);
  const [localEnd, setLocalEnd] = useState(endValue);

  // Sinkronisasi dengan URL
  useEffect(() => {
    const [s = "", e = ""] = currentValue ? currentValue.split(",") : ["", ""];
    setLocalStart(s);
    setLocalEnd(e);
  }, [currentValue]);

  const hasFilter = Boolean(startValue || endValue);

  const triggerElement = (
    <div
      className={`flex items-center justify-between w-full gap-2 px-2 py-1.5 text-xs border rounded-md transition-colors ${
        hasFilter
          ? "border-primary-main bg-primary-main/10 text-primary-main font-medium"
          : "border-gray-300 bg-white hover:bg-gray-50 text-gray-600"
      }`}
    >
      <span className="flex items-center gap-1.5 truncate">
        <Calendar className="w-3 h-3 shrink-0" />
        {title}
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
        <div className="w-56 p-1">
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={localStart}
                onChange={(e) => setLocalStart(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-main"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={localEnd}
                onChange={(e) => setLocalEnd(e.target.value)}
                min={localStart}
                className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-main"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => {
                if (!localStart && !localEnd) {
                  onChange("");
                } else {
                  onChange(`${localStart},${localEnd}`);
                }
                closePopover(); // Gunakan fungsi dari Popover
              }}
              className="w-full text-xs text-center bg-primary-main text-white hover:bg-primary-dark rounded-md font-medium py-1.5"
            >
              Terapkan
            </button>
            {hasFilter && (
              <button
                onClick={() => {
                  setLocalStart("");
                  setLocalEnd("");
                  onChange("");
                  closePopover(); // Gunakan fungsi dari Popover
                }}
                className="w-full text-xs text-center text-red-600 hover:text-red-700 font-medium py-1"
              >
                Hapus Filter
              </button>
            )}
          </div>
        </div>
      )}
    </Popover>
  );
}
