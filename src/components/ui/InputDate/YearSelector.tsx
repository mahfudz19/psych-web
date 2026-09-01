"use client";
import { memo } from "react";
import Button from "../Button";

// ===== HELPER COMPONENTS =====

// Komponen untuk selector tahun
const YearSelector = memo(
  ({
    currentYear,
    onYearChange,
    registerYearRef,
    years,
  }: {
    currentYear: number;
    onYearChange: (year: number) => void;
    registerYearRef: (year: number, el: HTMLButtonElement | null) => void;
    years: number[];
  }) => {
    return (
      <div className="grid grid-cols-3 gap-2 p-2 overflow-auto max-h-80">
        {years.map((year) => {
          const isCurrentYear = year === currentYear;
          return (
            <Button
              key={year}
              type="button"
              ref={(el) => registerYearRef(year, el)}
              variant={isCurrentYear ? "contained" : "text"}
              className={`py-2 rounded text-center text-base font-normal hover:bg-primary-main/25 ${isCurrentYear ? "bg-primary-main hover:bg-primary-dark text-white" : ""}`}
              onClick={() => onYearChange(year)}
              tabIndex={0}
              aria-selected={isCurrentYear}
            >
              {year}
            </Button>
          );
        })}
      </div>
    );
  },
);
YearSelector.displayName = "YearSelector";

export default YearSelector;
