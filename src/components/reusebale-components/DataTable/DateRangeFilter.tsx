import { Calendar, X } from "lucide-react";
import InputDate from "../../ui/InputDate";

export default function DateRangeFilter({
  title,
  currentValue,
  onChange,
}: {
  title: string;
  currentValue: string;
  onChange: (val: string) => void;
}) {
  const inputValue = currentValue ? currentValue.replace(",", "/") : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (!val) {
      onChange("");
      return;
    }

    if (val.includes("/")) {
      const [startISO, endISO] = val.split("/");
      const startDate = startISO.split("T")[0];
      const endDate = endISO ? endISO.split("T")[0] : "";
      if (startDate && endDate) onChange(`${startDate},${endDate}`);
    }
  };

  return (
    <InputDate
      selectsRange
      monthsShown={2}
      value={inputValue}
      onChange={handleChange}
      customTrigger={({ value, clear }) => {
        const hasFilter = Boolean(value);

        return (
          <div
            className={`min-h-9 flex items-center justify-between w-full gap-2 px-3 py-2 text-xs border rounded-2xl transition-colors cursor-pointer min-w-56 ${
              hasFilter
                ? "border-primary-main bg-primary-main/10 text-primary-main font-bold ring-1 ring-primary-main/20"
                : "border-divider bg-bg-paper hover:bg-divider text-text-primary"
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <Calendar className="w-4 h-4 shrink-0" />
              {hasFilter ? (
                <span className="truncate">
                  {value
                    .split("/")
                    .map((d) => d.split("T")[0])
                    .join(" - ")}
                </span>
              ) : (
                <span>{title}</span>
              )}
            </span>

            {hasFilter && (
              <button
                type="button"
                className="p-0.5 rounded-full hover:bg-error-main/20 text-error-main"
                onClick={(e) => {
                  e.stopPropagation();
                  clear(e);
                  onChange("");
                }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      }}
    />
  );
}
