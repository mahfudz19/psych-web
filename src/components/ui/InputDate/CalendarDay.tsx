"use client";
import { memo } from "react";
import { twMerge } from "tailwind-merge";
import { type DateState } from ".";
import IconButton from "../IconButton";

interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isPrevMonth?: boolean;
  isNextMonth?: boolean;
}

// ===== HELPER COMPONENTS =====

// Komponen untuk hari kalender
const CalendarDay = memo(
  ({
    dayInfo,
    dateState,
    isDateInRange,
    isDateHovered,
    isDateDisabled,
    selectsRange,
    onDateClick,
    onMouseEnter,
    registerDayRef,
  }: {
    dayInfo: DayInfo;
    dateState: DateState;
    isDateInRange: (date: Date) => boolean;
    isDateHovered: (date: Date) => boolean;
    isDateDisabled: (date: Date) => boolean;
    selectsRange: boolean;
    onDateClick: (date: Date, isCurrentMonth: boolean) => void;
    onMouseEnter: (date: Date) => void;
    registerDayRef: (date: Date, el: HTMLButtonElement | null) => void;
  }) => {
    const { date, isCurrentMonth } = dayInfo;

    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected =
      dateState.startDate?.toDateString() === date.toDateString() ||
      dateState.endDate?.toDateString() === date.toDateString();
    const isInRange = selectsRange && isDateInRange(date);
    const isHovered = selectsRange && isDateHovered(date);
    const isDisabled = isDateDisabled(date);

    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    return (
      <IconButton
        type="button"
        ref={(el) => registerDayRef(date, el)}
        disabled={isDisabled}
        variant={isSelected ? "contained" : "text"}
        className={twMerge(
          "h-8 w-8 flex text-text-primary transition-all items-center justify-center rounded-full text-sm relative font-normal outline-none",
          isCurrentMonth ? "" : "text-text-secondary opacity-60",
          isDisabled
            ? "cursor-not-allowed opacity-40"
            : isCurrentMonth
              ? "hover:bg-gray-100 dark:hover:bg-gray-600"
              : "hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:text-gray-400",
          isSelected
            ? "bg-primary-main text-white hover:bg-primary-dark dark:hover:bg-primary-dark"
            : "",
          (isInRange || isHovered) && !isSelected ? "bg-primary-main/25" : "",
          !isCurrentMonth && !isDisabled
            ? "cursor-pointer hover:text-gray-700 hover:opacity-80"
            : "",
          isToday ? "ring-2 ring-primary-main ring-offset-[1.25px]" : "",
        )}
        onClick={() => onDateClick(date, isCurrentMonth)}
        onMouseEnter={() => onMouseEnter(date)}
        aria-label={`${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`}
        aria-current={isCurrentMonth ? true : false}
        aria-selected={isSelected}
      >
        {date.getDate()}
      </IconButton>
    );
  },
);
CalendarDay.displayName = "CalendarDay";

export default CalendarDay;
