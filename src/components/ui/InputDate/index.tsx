"use client";
import type React from "react";
import {
  type ChangeEventHandler,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import Button from "../Button";
import Carousel from "../Carousel";
import IconButton from "../IconButton";
import { type InputProps as TextFieldProps } from "../Input";
import Popover from "../Popover";
import Tabs from "../Tabs";
import Tab from "../Tabs/Tab";
import styles from "./animations.module.css";
import CalendarDay from "./CalendarDay";
import CalendarHeader from "./CalendarHeader";
import DateInput, { type DateInputRef } from "./DateInput";
import MonthSelector from "./MonthSelector";
import TimeSelector from "./TimeSelector";
import YearSelector from "./YearSelector";
import { Calendar, ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import useMediaQuery from "../../utility/useMediaQuery";

const today = new Date();
const length = today.getFullYear() - 1900;
const years = Array.from(
  { length: length },
  (_, i) => today.getFullYear() + 5 - i,
);
const daysOfWeek = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const HelperFunction = (
  activeInputRef: React.RefObject<"start" | "end">,
  dateState: DateState,
  onChange?: ChangeEventHandler<HTMLInputElement>,
  min?: string,
  max?: string,
) => {
  // Fungsi untuk menghitung jumlah hari dalam bulan
  const daysInMonth = useCallback(
    (month: number, year: number) => new Date(year, month + 1, 0).getDate(),
    [],
  );

  // Fungsi untuk mendapatkan hari pertama dari bulan
  const getFirstDayOfMonth = useCallback(
    (month: number, year: number) => new Date(year, month, 1).getDay(),
    [],
  );

  // Fungsi untuk mengubah Date menjadi ISO string
  const formatToISOString = useCallback(
    (date: Date | null) => (!date ? "" : date.toISOString()),
    [],
  );

  // Fungsi untuk mengecek apakah tanggal berada dalam range
  const isDateInRange = useCallback(
    (date: Date) => {
      if (!dateState.startDate || !dateState.endDate) return false;
      return date > dateState.startDate && date < dateState.endDate;
    },
    [dateState],
  );

  // Fungsi untuk mengecek apakah tanggal sedang dihover
  const isDateHovered = useCallback(
    (date: Date) => {
      const { startDate, hoveredDate } = dateState;
      if (!startDate || !hoveredDate || activeInputRef.current !== "end")
        return false;
      return date > startDate && date <= hoveredDate;
    },
    [activeInputRef, dateState],
  );

  // Fungsi untuk mengecek apakah tanggal disabled
  const isDateDisabled = useCallback(
    (date: Date) => {
      const minDate = min ? new Date(min) : null;
      const maxDate = max ? new Date(max) : null;

      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    },
    [min, max],
  );

  // Fungsi untuk memanggil onChange dengan aman
  const safeOnChange = useCallback(
    (name?: string, value?: string) => {
      if (!onChange) return;
      // Create a fake input element to satisfy the type
      const input = document.createElement("input");
      input.name = name ?? "";
      input.value = value ?? "";
      const event = { target: input } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    },
    [onChange],
  );

  return {
    daysInMonth,
    getFirstDayOfMonth,
    formatToISOString,
    isDateInRange,
    isDateHovered,
    isDateDisabled,
    safeOnChange,
  };
};

const EventHandler = (
  dateState: DateState,
  setDateState: React.Dispatch<React.SetStateAction<DateState>>,
  daysInMonth: (month: number, year: number) => number,
  isDateDisabled: (date: Date) => boolean,
  calendarDayRefs: React.RefObject<Map<string, HTMLButtonElement>>,
  animationTimeoutRef: React.RefObject<ReturnType<typeof setTimeout> | null>,
  formatToISOString: (date: Date | null) => string,
  safeOnChange: (name?: string, value?: string) => void | undefined,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  dayRef: React.RefObject<HTMLInputElement | null>,
  monthButtonsRef: React.RefObject<Map<number, HTMLButtonElement>>,
  yearButtonsRef: React.RefObject<Map<number, HTMLButtonElement>>,
  selectsRange: boolean,
  showTimeSelect: boolean,
  focusedDateRef: React.RefObject<Date | null>,
  activeInputRef: React.RefObject<"start" | "end">,
  name?: string,
) => {
  // Handler untuk perubahan tanggal
  const focusOnCalendarDate = useCallback(() => {
    if (focusedDateRef.current) {
      const dateKey = focusedDateRef.current.toDateString();
      const buttonEl = calendarDayRefs.current.get(dateKey);

      if (buttonEl) {
        buttonEl.focus();
      } else {
        // Jika tanggal yang difokuskan tidak ditemukan, fokus ke tanggal pertama yang tersedia
        const firstButton = Array.from(calendarDayRefs.current.values())[0];
        if (firstButton) firstButton.focus();
      }
    } else {
      // Jika tidak ada tanggal yang difokuskan, fokus ke tanggal hari ini atau tanggal pertama
      const today = new Date();
      const todayKey = today.toDateString();
      const todayButton = calendarDayRefs.current.get(todayKey);

      if (todayButton) {
        todayButton.focus();
      } else {
        const firstButton = Array.from(calendarDayRefs.current.values())[0];
        if (firstButton) firstButton.focus();
      }
    }
  }, [calendarDayRefs, focusedDateRef]);

  const handleDateChange = useCallback(
    (
      type: DateChangeType,
      value: number | Date | string,
      dateType: DateInputType = "start",
      isCurrentMonth = true,
    ) => {
      // Handle selector bulan
      if (type === "selector-month") {
        const month = value as number;
        setDateState((prev) => {
          const currentFocusedDate = focusedDateRef.current || new Date();

          // Buat tanggal baru di bulan sebelumnya dengan tanggal yang sama jika memungkinkan
          const focusedDate = new Date(
            prev.currentYear,
            month,
            Math.min(
              currentFocusedDate.getDate(),
              daysInMonth(month, prev.currentYear),
            ),
          );
          focusedDateRef.current = focusedDate;
          return { ...prev, currentMonth: month, focusedElement: "calendar" };
        });

        // Fokus kembali ke tanggal setelah memilih bulan
        setTimeout(() => {
          focusOnCalendarDate();
        }, 400);
        return;
      }

      // Handle selector tahun
      if (type === "selector-year") {
        const year = value as number;
        setDateState((prev) => {
          const currentFocusedDate = focusedDateRef.current || new Date();

          // Buat tanggal baru di bulan sebelumnya dengan tanggal yang sama jika memungkinkan
          const focusedDate = new Date(
            year,
            prev.currentMonth,
            Math.min(
              currentFocusedDate.getDate(),
              daysInMonth(prev.currentMonth, year),
            ),
          );
          focusedDateRef.current = focusedDate;
          return { ...prev, currentYear: year, focusedElement: "calendar" };
        });

        // Fokus kembali ke tanggal setelah memilih tahun
        setTimeout(() => {
          focusOnCalendarDate();
        }, 400);
        return;
      }

      // Handle klik pada tanggal di kalender
      if (type === "date") {
        const date = value as Date;
        if (isDateDisabled(date)) return;

        // Jika tanggal dari bulan lain, pindah ke bulan tersebut
        if (!isCurrentMonth) {
          const newMonth = date.getMonth();
          const newYear = date.getFullYear();
          const currentMonth = dateState.currentMonth;
          const currentYear = dateState.currentYear;

          // Tentukan arah slide berdasarkan bulan yang dipilih
          let direction: "left" | "right" | null = null;

          if (
            newYear < currentYear ||
            (newYear === currentYear && newMonth < currentMonth)
          ) {
            direction = "right"; // Mundur ke bulan sebelumnya
          } else if (
            newYear > currentYear ||
            (newYear === currentYear && newMonth > currentMonth)
          ) {
            direction = "left"; // Maju ke bulan berikutnya
          }
          focusedDateRef.current = date;
          // Ubah bulan dan tahun saat ini
          if (direction === "left") handleNextMonth();
          if (direction === "right") handlePrevMonth();
        }

        if (selectsRange) {
          if (
            activeInputRef.current === "start" ||
            !dateState.startDate ||
            (dateState.startDate && dateState.endDate)
          ) {
            activeInputRef.current = "end";
            setDateState((prev) => {
              // Set hours and minutes if there is time
              if (prev.startHour && prev.startMinute) {
                date.setHours(Number.parseInt(prev.startHour, 10));
                date.setMinutes(Number.parseInt(prev.startMinute, 10));
              }
              return {
                ...prev,
                startDate: date,
                endDate: null,
                startDay: date.getDate().toString().padStart(2, "0"),
                startMonth: (date.getMonth() + 1).toString().padStart(2, "0"),
                startYear: date.getFullYear().toString(),
                startHour: date.getHours().toString().padStart(2, "0"),
                startMinute: date.getMinutes().toString().padStart(2, "0"),
                endDay: "",
                endMonth: "",
                endYear: "",
              };
            });
          } else {
            // Don't allow end date before start date
            activeInputRef.current = "end";
            if (!dateState.startDate || date < dateState.startDate) {
              setDateState((prev) => {
                // Set hours and minutes if there is time
                if (prev.startHour && prev.startMinute) {
                  date.setHours(Number.parseInt(prev.startHour, 10));
                  date.setMinutes(Number.parseInt(prev.startMinute, 10));
                }
                return {
                  ...prev,
                  startDate: date,
                  endDate: null,
                  startDay: date.getDate().toString().padStart(2, "0"),
                  startMonth: (date.getMonth() + 1).toString().padStart(2, "0"),
                  startYear: date.getFullYear().toString(),
                  startHour: date.getHours().toString().padStart(2, "0"),
                  startMinute: date.getMinutes().toString().padStart(2, "0"),
                  endDay: "",
                  endMonth: "",
                  endYear: "",
                };
              });
            } else {
              activeInputRef.current = "start";
              setDateState((prev) => {
                // Set hours and minutes if there is time
                if (prev.endHour && prev.endMinute) {
                  date.setHours(Number.parseInt(prev.endHour, 10));
                  date.setMinutes(Number.parseInt(prev.endMinute, 10));
                }
                return {
                  ...prev,
                  endDate: date,
                  endDay: date.getDate().toString().padStart(2, "0"),
                  endMonth: (date.getMonth() + 1).toString().padStart(2, "0"),
                  endYear: date.getFullYear().toString(),
                  endHour: date.getHours().toString().padStart(2, "0"),
                  endMinute: date.getMinutes().toString().padStart(2, "0"),
                };
              });

              // Trigger onChange with range value
              const startIso = formatToISOString(
                date < dateState.startDate! ? date : dateState.startDate,
              );
              const endIso = formatToISOString(
                date < dateState.startDate! ? dateState.startDate : date,
              );
              safeOnChange(name, `${startIso}/${endIso}`);

              if (!showTimeSelect) handlerClose();
            }
          }
        } else {
          setDateState((prev) => {
            // Set hours and minutes if there is time
            if (prev.startHour && prev.startMinute) {
              date.setHours(Number.parseInt(prev.startHour, 10));
              date.setMinutes(Number.parseInt(prev.startMinute, 10));
            }
            return {
              ...prev,
              startDate: date,
              startDay: date.getDate().toString().padStart(2, "0"),
              startMonth: (date.getMonth() + 1).toString().padStart(2, "0"),
              startYear: date.getFullYear().toString(),
              startHour: date.getHours().toString().padStart(2, "0"),
              startMinute: date.getMinutes().toString().padStart(2, "0"),
            };
          });

          // Trigger onChange with single date value
          if (!showTimeSelect) {
            safeOnChange(name, formatToISOString(date));
            handlerClose();
          }
        }
        return;
      }

      // Handle perubahan pada input tanggal (hari, bulan, tahun)
      const cleanValue = `${value}`.trim();
      const prefix = dateType === "start" ? "start" : "end";
      setDateState((prev) => {
        const newState = { ...prev };

        if (type === "day" && cleanValue.length <= 2)
          newState[`${prefix}Day`] = cleanValue;
        if (type === "month" && cleanValue.length <= 2)
          newState[`${prefix}Month`] = cleanValue;
        if (type === "year" && cleanValue.length <= 4)
          newState[`${prefix}Year`] = cleanValue;

        // Try to create a valid date from the input fields
        if (
          dateType === "start" &&
          newState.startDay &&
          newState.startMonth &&
          newState.startYear &&
          newState.startDay.length === 2 &&
          newState.startMonth.length === 2 &&
          newState.startYear.length === 4
        ) {
          const day = Number.parseInt(newState.startDay, 10);
          const month = Number.parseInt(newState.startMonth, 10) - 1; // 0-based month
          const year = Number.parseInt(newState.startYear, 10);

          // Validate date values
          if (
            day >= 1 &&
            day <= 31 &&
            month >= 0 &&
            month <= 11 &&
            year >= 1900 &&
            year <= 2100
          ) {
            const newDate = new Date(year, month, day);

            // Check if the date is valid (e.g., not Feb 30)
            if (
              newDate.getDate() === day &&
              newDate.getMonth() === month &&
              newDate.getFullYear() === year
            ) {
              // Set hours and minutes if there is time
              if (prev.startHour && prev.startMinute) {
                newDate.setHours(Number.parseInt(prev.startHour, 10));
                newDate.setMinutes(Number.parseInt(prev.startMinute, 10));
              }

              // Check if date is within min/max bounds
              if (!isDateDisabled(newDate)) {
                newState.startDate = newDate;
                newState.currentMonth = month;
                newState.currentYear = year;
                newState.startHour = newDate
                  .getHours()
                  .toString()
                  .padStart(2, "0");
                newState.startMinute = newDate
                  .getMinutes()
                  .toString()
                  .padStart(2, "0");

                // Trigger onChange for single date
                if (!selectsRange)
                  safeOnChange(name, formatToISOString(newDate));
              }
            }
          }
        } else if (
          dateType === "end" &&
          newState.endDay &&
          newState.endMonth &&
          newState.endYear &&
          newState.endDay.length === 2 &&
          newState.endMonth.length === 2 &&
          newState.endYear.length === 4
        ) {
          const day = Number.parseInt(newState.endDay, 10);
          const month = Number.parseInt(newState.endMonth, 10) - 1; // 0-based month
          const year = Number.parseInt(newState.endYear, 10);

          // Validate date values
          if (
            day >= 1 &&
            day <= 31 &&
            month >= 0 &&
            month <= 11 &&
            year >= 1900 &&
            year <= 2100
          ) {
            const newDate = new Date(year, month, day);

            // Check if the date is valid (e.g., not Feb 30)
            if (
              newDate.getDate() === day &&
              newDate.getMonth() === month &&
              newDate.getFullYear() === year
            ) {
              // Set hours and minutes if there is time
              if (prev.endHour && prev.endMinute) {
                newDate.setHours(Number.parseInt(prev.endHour, 10));
                newDate.setMinutes(Number.parseInt(prev.endMinute, 10));
              }

              // Check if date is within min/max bounds
              if (!isDateDisabled(newDate)) {
                newState.endDate = newDate;
                newState.endHour = newDate
                  .getHours()
                  .toString()
                  .padStart(2, "0");
                newState.endMinute = newDate
                  .getMinutes()
                  .toString()
                  .padStart(2, "0");

                // Trigger onChange for range if both dates are set
                if (selectsRange && newState.startDate) {
                  const startIso = formatToISOString(newState.startDate);
                  const endIso = formatToISOString(newDate);
                  safeOnChange(name, `${startIso}/${endIso}`);
                }
              }
            }
          }
        } else if (
          dateType === "start" &&
          newState.startDate &&
          !newState.startDay &&
          !newState.startMonth &&
          !newState.startYear
        ) {
          newState.startDate = null;
          newState.startDay = "";
          newState.startMonth = "";
          newState.startYear = "";
          safeOnChange(name, "");
        }

        return newState;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectsRange,
      daysInMonth,
      focusOnCalendarDate,
      isDateDisabled,
      dateState.currentMonth,
      dateState.currentYear,
      activeInputRef.current,
      dateState.startDate,
      dateState.endDate,
      formatToISOString,
      safeOnChange,
      name,
      showTimeSelect,
    ],
  );

  // Handler untuk mouse enter pada tanggal
  const handleMouseEnterDate = useCallback(
    (date: Date) => {
      selectsRange && dateState.startDate && !dateState.endDate
        ? setDateState((prev) => ({ ...prev, hoveredDate: date }))
        : null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectsRange, dateState.startDate, dateState.endDate],
  );

  // Handler untuk bulan sebelumnya
  const handlePrevMonth = useCallback(() => {
    let newMonth = dateState.currentMonth - 1;
    let newYear = dateState.currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    // Simpan tanggal yang difokuskan saat ini
    const currentFocusedDate = focusedDateRef.current || new Date();

    // Buat tanggal baru di bulan sebelumnya dengan tanggal yang sama jika memungkinkan
    const focusedDate = new Date(
      newYear,
      newMonth,
      Math.min(currentFocusedDate.getDate(), daysInMonth(newMonth, newYear)),
    );
    focusedDateRef.current = focusedDate;
    setDateState((prev) => ({
      ...prev,
      currentMonth: newMonth,
      currentYear: newYear,
      slideDirection: "right",
    }));
    // Fokuskan ke tanggal yang sesuai setelah animasi selesai
    // Reset calendar day refs karena DOM telah berubah
    calendarDayRefs.current = new Map();

    // Beri waktu untuk DOM diperbarui
    animationTimeoutRef.current = setTimeout(() => {
      setDateState((prev) => ({ ...prev, slideDirection: null }));
      const dateKey = focusedDate.toDateString();
      const buttonEl = calendarDayRefs.current.get(dateKey);

      if (buttonEl) buttonEl.focus();
    }, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dateState.currentMonth,
    dateState.currentYear,
    focusedDateRef,
    daysInMonth,
    calendarDayRefs,
    animationTimeoutRef,
  ]);

  // Handler untuk bulan berikutnya
  const handleNextMonth = useCallback(() => {
    let newMonth = dateState.currentMonth + 1;
    let newYear = dateState.currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    // Simpan tanggal yang difokuskan saat ini
    const currentFocusedDate = focusedDateRef.current || new Date();

    // Buat tanggal baru di bulan berikutnya dengan tanggal yang sama jika memungkinkan
    const focusedDate = new Date(
      newYear,
      newMonth,
      Math.min(currentFocusedDate.getDate(), daysInMonth(newMonth, newYear)),
    );
    focusedDateRef.current = focusedDate;
    setDateState((prev) => ({
      ...prev,
      currentMonth: newMonth,
      currentYear: newYear,
      slideDirection: "left",
    }));

    // Fokuskan ke tanggal yang sesuai setelah animasi selesai
    // Reset calendar day refs karena DOM telah berubah
    calendarDayRefs.current = new Map();

    // Beri waktu untuk DOM diperbarui
    animationTimeoutRef.current = setTimeout(() => {
      setDateState((prev) => ({ ...prev, slideDirection: null }));
      const dateKey = focusedDate.toDateString();
      const buttonEl = calendarDayRefs.current.get(dateKey);

      if (buttonEl) buttonEl.focus();
    }, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dateState.currentMonth,
    dateState.currentYear,
    focusedDateRef.current,
    daysInMonth,
  ]);

  // Handler untuk clear
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent opening the calendar when clearing
      activeInputRef.current = "start";
      setDateState((prev) => ({
        ...prev,
        startDate: null,
        endDate: null,
        startDay: "",
        startMonth: "",
        startYear: "",
        startHour: "",
        startMinute: "",
        endDay: "",
        endMonth: "",
        endYear: "",
        endHour: "",
        endMinute: "",
      }));

      safeOnChange(name, "");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, safeOnChange],
  );
  const handleToday = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent opening the calendar when clearing
      if (!selectsRange) {
        const now = new Date();
        const newDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          now.getHours(),
          now.getMinutes(),
        );
        // Single date selection
        setDateState((prev) => ({
          ...prev,
          startDate: newDate,
          startDay: newDate.getDate().toString().padStart(2, "0"),
          startMonth: (newDate.getMonth() + 1).toString().padStart(2, "0"),
          startYear: newDate.getFullYear().toString(),
          startHour: newDate.getHours().toString().padStart(2, "0"),
          startMinute: newDate.getMinutes().toString().padStart(2, "0"),
        }));
        safeOnChange(name, formatToISOString(newDate));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, safeOnChange, selectsRange, dateState.startDate, formatToISOString],
  );

  // Handler untuk perubahan waktu
  const handleTimeChange = useCallback(
    (
      value: string,
      type: "hour" | "minute",
      dateType: "start" | "end" = "start",
    ) => {
      // Only allow numeric input and limit to 2 digits
      if (!/^\d*$/.test(value) && value !== "") return;
      if (value.length > 2) return;

      setDateState((prev) => {
        const newState = { ...prev };

        if (dateType === "start") {
          if (type === "hour") newState.startHour = value;
          else newState.startMinute = value;
        } else {
          if (type === "hour") newState.endHour = value;
          else newState.endMinute = value;
        }

        // Try to update the Date object if we have valid time values
        if (dateType === "start" && prev.startDate) {
          if (type === "hour" && value.length === 2) {
            const hour = Number.parseInt(value, 10);
            if (hour >= 0 && hour <= 23) {
              const newDate = new Date(prev.startDate);
              newDate.setHours(hour);
              newState.startDate = newDate;

              // Trigger onChange
              if (!selectsRange) {
                safeOnChange(name, formatToISOString(newDate));
              } else if (prev.endDate) {
                safeOnChange(
                  name,
                  `${formatToISOString(newDate)}/${formatToISOString(prev.endDate)}`,
                );
              }
            }
          } else if (type === "minute" && value.length === 2) {
            const minute = Number.parseInt(value, 10);
            if (minute >= 0 && minute <= 59) {
              const newDate = new Date(prev.startDate);
              newDate.setMinutes(minute);
              newState.startDate = newDate;

              // Trigger onChange
              if (!selectsRange) {
                safeOnChange(name, formatToISOString(newDate));
              } else if (prev.endDate) {
                safeOnChange(
                  name,
                  `${formatToISOString(newDate)}/${formatToISOString(prev.endDate)}`,
                );
              }
            }
          }
        } else if (dateType === "end" && prev.endDate) {
          if (type === "hour" && value.length === 2) {
            const hour = Number.parseInt(value, 10);
            if (hour >= 0 && hour <= 23) {
              const newDate = new Date(prev.endDate);
              newDate.setHours(hour);
              newState.endDate = newDate;

              // Trigger onChange for range
              if (prev.startDate) {
                safeOnChange(
                  name,
                  `${formatToISOString(prev.startDate)}/${formatToISOString(newDate)}`,
                );
              }
            }
          } else if (type === "minute" && value.length === 2) {
            const minute = Number.parseInt(value, 10);
            if (minute >= 0 && minute <= 59) {
              const newDate = new Date(prev.endDate);
              newDate.setMinutes(minute);
              newState.endDate = newDate;

              // Trigger onChange for range
              if (prev.startDate) {
                safeOnChange(
                  name,
                  `${formatToISOString(prev.startDate)}/${formatToISOString(newDate)}`,
                );
              }
            }
          }
        }

        return newState;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectsRange, formatToISOString, name, safeOnChange],
  );

  // Handler untuk toggle selector bulan
  const toggleMonthSelector = useCallback(() => {
    setDateState((prev) => ({
      ...prev,
      focusedElement:
        prev.focusedElement === "monthSelector"
          ? "monthButton"
          : "monthSelector",
    }));

    // Jika membuka selector bulan, fokuskan ke bulan yang dipilih
    if (dateState.focusedElement !== "monthSelector") {
      setTimeout(() => {
        const buttonEl = monthButtonsRef.current.get(dateState.currentMonth);
        if (buttonEl) buttonEl.focus();
      }, 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateState.currentMonth, dateState.focusedElement]);

  // Handler untuk toggle selector tahun
  const toggleYearSelector = useCallback(() => {
    setDateState((prev) => ({
      ...prev,
      focusedElement:
        prev.focusedElement === "yearSelector" ? "yearButton" : "yearSelector",
    }));

    // Jika membuka selector tahun, fokuskan ke tahun yang dipilih
    if (dateState.focusedElement !== "yearSelector") {
      setTimeout(() => {
        const buttonEl = yearButtonsRef.current.get(dateState.currentYear);
        if (buttonEl) buttonEl.focus();
      }, 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateState.currentYear, dateState.focusedElement]);

  const handlerOpen = useCallback(
    (toggle?: boolean) => {
      if (toggle) setIsOpen((p) => !p);
      else setIsOpen(true);

      // Reset calendar day refs setiap kali kalender terbuka
      calendarDayRefs.current = new Map();

      // Tunggu sedikit lebih lama untuk memastikan render selesai
      setTimeout(() => {
        focusedDateRef.current = dateState.startDate || today;

        // Fokuskan ke tombol tanggal yang sesuai
        const dateKey = focusedDateRef.current.toDateString();
        const buttonEl = calendarDayRefs.current.get(dateKey);
        if (buttonEl) buttonEl.focus();
      }, 400 + 300);
    },
    [calendarDayRefs, dateState.startDate, focusedDateRef, setIsOpen],
  );

  const handlerClose = useCallback(() => {
    setIsOpen(false);
    dayRef.current?.focus();
    setTimeout(() => {
      setDateState((p) => ({
        ...p,
        slideDirection: null,
        currentMonth: p.startDate ? p.startDate.getMonth() : today.getMonth(),
        currentYear: p.startDate
          ? p.startDate.getFullYear()
          : today.getFullYear(),
        focusedElement: "calendar",
        activeIndex: 0,
      }));
    }, 400);
  }, [dayRef, setDateState, setIsOpen]);

  return {
    handlerOpen,
    toggleYearSelector,
    toggleMonthSelector,
    handleTimeChange,
    handleClear,
    handleToday,
    handleNextMonth,
    handleDateChange,
    handleMouseEnterDate,
    handlePrevMonth,
    handlerClose,
  };
};

const FocusManagement = (
  isOpen: boolean,
  handlerClose: () => void,
  dateState: DateState,
  setDateState: React.Dispatch<React.SetStateAction<DateState>>,
  monthButtonRef: React.RefObject<HTMLButtonElement | null>,
  yearButtonRef: React.RefObject<HTMLButtonElement | null>,
  calendarDayRefs: React.RefObject<Map<string, HTMLButtonElement>>,
  hourInputRefs: React.RefObject<Map<string, HTMLInputElement>>,
  minuteInputRefs: React.RefObject<Map<string, HTMLInputElement>>,
  clearButtonRef: React.RefObject<HTMLButtonElement | null>,
  todayButtonRef: React.RefObject<HTMLButtonElement | null>,
  prevButtonRef: React.RefObject<HTMLButtonElement | null>,
  nextButtonRef: React.RefObject<HTMLButtonElement | null>,
  monthButtonsRef: React.RefObject<Map<number, HTMLButtonElement>>,
  yearButtonsRef: React.RefObject<Map<number, HTMLButtonElement>>,
  animationTimeoutRef: React.RefObject<ReturnType<typeof setTimeout> | null>,
  isClearable: boolean,
  selectsRange: boolean,
  showTimeSelect: boolean,
  handleDateChange: (
    type: DateChangeType,
    value: number | Date | string,
    dateType?: DateInputType,
    isCurrentMonth?: boolean,
  ) => void,
  handlePrevMonth: () => void,
  handleNextMonth: () => void,
  isDateDisabled: (date: Date) => boolean,
  focusedDateRef: React.RefObject<Date | null>,
  activeInputRef: React.RefObject<"start" | "end">,
  handleMouseEnterDate: (date: Date) => void,
) => {
  // ===== FOCUS MANAGEMENT =====

  // Fungsi untuk mendapatkan elemen yang bisa difokuskan
  const getFocusableElements = useCallback(() => {
    const elements: (HTMLButtonElement | HTMLInputElement)[] = [];

    // Tombol bulan dan tahun
    if (monthButtonRef.current) elements.push(monthButtonRef.current);
    if (yearButtonRef.current) elements.push(yearButtonRef.current);

    // Tambahkan tombol tanggal yang sedang difokuskan
    if (focusedDateRef.current) {
      const dateKey = focusedDateRef.current.toDateString();
      const focusedDateButton = calendarDayRefs.current.get(dateKey);
      if (focusedDateButton) {
        elements.push(focusedDateButton);
      }
    }

    // Input jam dan menit
    if (showTimeSelect && dateState.startDate) {
      const hourInput = hourInputRefs.current.get("start");
      const minuteInput = minuteInputRefs.current.get("start");
      if (hourInput) elements.push(hourInput);
      if (minuteInput) elements.push(minuteInput);

      if (selectsRange && dateState.endDate) {
        const endHourInput = hourInputRefs.current.get("end");
        const endMinuteInput = minuteInputRefs.current.get("end");
        if (endHourInput) elements.push(endHourInput);
        if (endMinuteInput) elements.push(endMinuteInput);
      }
    }

    // Tombol clear
    if (
      isClearable &&
      (dateState.startDate || dateState.endDate) &&
      clearButtonRef.current
    ) {
      elements.push(clearButtonRef.current);
    }
    if (todayButtonRef.current) elements.push(todayButtonRef.current);

    return elements;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    focusedDateRef.current,
    dateState.startDate,
    dateState.endDate,
    showTimeSelect,
    selectsRange,
    isClearable,
  ]);

  // Fungsi untuk fokus ke elemen berikutnya
  const focusNextElement = useCallback((elements: HTMLElement[]) => {
    if (elements.length === 0) return;

    const activeElement = document.activeElement;
    const currentIndex = elements.findIndex((el) => el === activeElement);

    if (currentIndex === -1 || currentIndex === elements.length - 1) {
      // Fokus ke elemen pertama jika tidak ada elemen aktif atau sudah di elemen terakhir
      elements[0].focus();
      updateFocusedElement(elements[0]);
    } else {
      // Fokus ke elemen berikutnya
      elements[currentIndex + 1].focus();
      updateFocusedElement(elements[currentIndex + 1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fungsi untuk fokus ke elemen sebelumnya
  const focusPreviousElement = useCallback((elements: HTMLElement[]) => {
    if (elements.length === 0) return;

    const activeElement = document.activeElement;
    const currentIndex = elements.findIndex((el) => el === activeElement);

    if (currentIndex === -1 || currentIndex === 0) {
      // Fokus ke elemen terakhir jika tidak ada elemen aktif atau sudah di elemen pertama
      elements[elements.length - 1].focus();
      updateFocusedElement(elements[elements.length - 1]);
    } else {
      // Fokus ke elemen sebelumnya
      elements[currentIndex - 1].focus();
      updateFocusedElement(elements[currentIndex - 1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fungsi untuk update state focused element
  const updateFocusedElement = useCallback((element: HTMLElement) => {
    // Cek tipe elemen yang difokuskan dan update state
    if (element === monthButtonRef.current) {
      setDateState((prev) => ({ ...prev, focusedElement: "monthButton" }));
    } else if (element === yearButtonRef.current) {
      setDateState((prev) => ({ ...prev, focusedElement: "yearButton" }));
    } else if (element === prevButtonRef.current) {
      setDateState((prev) => ({ ...prev, focusedElement: "prevButton" }));
    } else if (element === nextButtonRef.current) {
      setDateState((prev) => ({ ...prev, focusedElement: "nextButton" }));
    } else {
      // Cek apakah elemen adalah tombol tanggal
      const calendarDayButton = Array.from(
        calendarDayRefs.current.entries(),
      ).find(([_, el]) => el === element);

      if (calendarDayButton) {
        const [dateString] = calendarDayButton;
        focusedDateRef.current = new Date(dateString);
        setDateState((prev) => ({ ...prev, focusedElement: "calendar" }));
      } else {
        // Cek apakah elemen adalah input jam/menit
        const hourInput = Array.from(hourInputRefs.current.entries()).find(
          ([_, el]) => el === element,
        );

        if (hourInput) {
          activeInputRef.current = hourInput[0] as "start" | "end";
          setDateState((prev) => ({ ...prev, focusedElement: "hourInput" }));
        } else {
          const minuteInput = Array.from(
            minuteInputRefs.current.entries(),
          ).find(([_, el]) => el === element);

          if (minuteInput) {
            activeInputRef.current = minuteInput[0] as "start" | "end";
            setDateState((prev) => ({
              ...prev,
              focusedElement: "minuteInput",
            }));
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====  KEYBOARD NAVIGATION =====

  // Handler untuk keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      const { key, shiftKey } = e;

      // Cegah default behavior untuk tombol tab agar bisa trap focus
      if (key === "Tab") {
        e.preventDefault();
        const focusableElements = getFocusableElements();

        if (shiftKey) focusPreviousElement(focusableElements);
        else focusNextElement(focusableElements);
        return;
      }

      // Handle navigasi tanggal pada kalender
      if (dateState.focusedElement === "calendar") {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) {
          e.preventDefault();
          navigateCalendarWithArrowKeys(key);
        } else if (key === "Enter" || key === " ") {
          e.preventDefault();
          if (focusedDateRef.current) {
            handleDateChange(
              "date",
              focusedDateRef.current,
              activeInputRef.current,
              focusedDateRef.current.getMonth() === dateState.currentMonth,
            );
          }
        } else if (key === "Home") {
          // Navigasi ke awal bulan
          e.preventDefault();
          const firstDayOfMonth = new Date(
            dateState.currentYear,
            dateState.currentMonth,
            1,
          );
          navigateToDate(firstDayOfMonth);
        } else if (key === "End") {
          // Navigasi ke akhir bulan
          e.preventDefault();
          const lastDayOfMonth = new Date(
            dateState.currentYear,
            dateState.currentMonth + 1,
            0,
          );
          navigateToDate(lastDayOfMonth);
        } else if (key === "PageUp") {
          // Navigasi ke bulan sebelumnya
          e.preventDefault();
          handlePrevMonth();
        } else if (key === "PageDown") {
          // Navigasi ke bulan berikutnya
          e.preventDefault();
          handleNextMonth();
        }
      }

      // Handle navigasi di selector bulan
      else if (dateState.focusedElement === "monthSelector") {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) {
          e.preventDefault();
          navigateMonthSelector(key);
        } else if (key === "Enter" || key === " ") {
          e.preventDefault();
          // Fokus pada bulan yang sedang difokuskan
          const focusedMonthButton = Array.from(
            monthButtonsRef.current.entries(),
          ).find(([_, el]) => el === document.activeElement);

          if (focusedMonthButton)
            handleDateChange("selector-month", focusedMonthButton[0]);
        } else if (key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          setDateState((prev) => ({ ...prev, focusedElement: "monthButton" }));
          monthButtonRef.current?.focus();
        }
      }

      // Handle navigasi di selector tahun
      else if (dateState.focusedElement === "yearSelector") {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) {
          e.preventDefault();
          navigateYearSelector(key);
        } else if (key === "Enter" || key === " ") {
          e.preventDefault();
          // Fokus pada tahun yang sedang difokuskan
          const focusedYearButton = Array.from(
            yearButtonsRef.current.entries(),
          ).find(([_, el]) => el === document.activeElement);

          if (focusedYearButton) {
            handleDateChange("selector-year", focusedYearButton[0]);
          }
        } else if (key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          setDateState((prev) => ({
            ...prev,
            focusedElement: "yearButton",
          }));
          yearButtonRef.current?.focus();
        }
      }

      // Handle navigasi di antara input jam dan menit
      else if (
        dateState.focusedElement === "hourInput" ||
        dateState.focusedElement === "minuteInput"
      ) {
        if (key === "ArrowLeft" && dateState.focusedElement === "minuteInput") {
          e.preventDefault();
          // Fokus ke input jam
          // setDateState(prev => ({ ...prev, focusedElement: 'hourInput' }))
          hourInputRefs.current.get(activeInputRef.current)?.focus();
        } else if (
          key === "ArrowRight" &&
          dateState.focusedElement === "hourInput"
        ) {
          e.preventDefault();
          // Fokus ke input menit
          // setDateState(prev => ({ ...prev, focusedElement: 'minuteInput' }))
          minuteInputRefs.current.get(activeInputRef.current)?.focus();
        }
      }

      // Handle escape key untuk menutup popover
      if (key === "Escape") {
        e.stopPropagation();
        e.preventDefault();
        handlerClose();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isOpen,
      dateState.focusedElement,
      focusedDateRef.current,
      activeInputRef.current,
      dateState.currentMonth,
      dateState.currentYear,
      getFocusableElements,
      focusPreviousElement,
      focusNextElement,
      handleDateChange,
      handlePrevMonth,
      handleNextMonth,
    ],
  );

  // Fungsi untuk navigasi kalender dengan arrow keys
  const navigateCalendarWithArrowKeys = useCallback(
    (key: string) => {
      if (!focusedDateRef.current) return;

      const newDate = new Date(focusedDateRef.current);

      switch (key) {
        case "ArrowLeft":
          newDate.setDate(focusedDateRef.current.getDate() - 1);
          break;
        case "ArrowRight":
          newDate.setDate(focusedDateRef.current.getDate() + 1);
          break;
        case "ArrowUp":
          newDate.setDate(focusedDateRef.current.getDate() - 7);
          break;
        case "ArrowDown":
          newDate.setDate(focusedDateRef.current.getDate() + 7);
          break;
      }
      handleMouseEnterDate(newDate);

      // Jika tanggal baru disabled, tidak lakukan apa-apa
      if (isDateDisabled(newDate)) return;

      // Cek apakah perlu berpindah bulan
      const newMonth = newDate.getMonth();
      const newYear = newDate.getFullYear();

      if (
        newMonth !== dateState.currentMonth ||
        newYear !== dateState.currentYear
      ) {
        // Arahkan slide berdasarkan perbedaan tanggal
        const direction =
          newYear < dateState.currentYear ||
          (newYear === dateState.currentYear &&
            newMonth < dateState.currentMonth)
            ? "right"
            : "left";

        // Update bulan saat ini dan fokuskan tanggal baru
        focusedDateRef.current = newDate;
        setDateState((prev) => ({
          ...prev,
          currentMonth: newMonth,
          currentYear: newYear,
          slideDirection: direction,
        }));

        // Beri waktu untuk animasi selesai, lalu fokuskan tombol tanggal
        // Reset calendar day refs karena DOM telah berubah
        calendarDayRefs.current = new Map();

        // Beri waktu untuk DOM diperbarui
        animationTimeoutRef.current = setTimeout(() => {
          setDateState((prev) => ({ ...prev, slideDirection: null }));
          const dateKey = newDate.toDateString();
          const buttonEl = calendarDayRefs.current.get(dateKey);

          if (buttonEl) {
            buttonEl.focus();
          } else {
            // Jika tidak menemukan tombol yang tepat, coba fokus ke tombol tanggal pertama
            const firstButton = Array.from(calendarDayRefs.current.values())[0];
            if (firstButton) firstButton.focus();
          }
        }, 400);
      } else {
        // Tidak perlu berpindah bulan, cukup update tanggal yang difokuskan
        focusedDateRef.current = newDate;

        // Fokuskan ke tombol tanggal yang sesuai
        const dateKey = newDate.toDateString();
        const buttonEl = calendarDayRefs.current.get(dateKey);
        if (buttonEl) buttonEl.focus();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dateState.currentMonth,
      dateState.currentYear,
      focusedDateRef.current,
      isDateDisabled,
    ],
  );

  // Fungsi untuk navigasi selector bulan
  const navigateMonthSelector = useCallback(
    (key: string) => {
      const activeElement = document.activeElement;
      const currentMonthButton = Array.from(
        monthButtonsRef.current.entries(),
      ).find(([_, el]) => el === activeElement);

      if (!currentMonthButton) {
        // Jika tidak ada bulan yang difokuskan, fokuskan ke bulan saat ini
        const currentMonth = dateState.currentMonth;
        const buttonEl = monthButtonsRef.current.get(currentMonth);
        if (buttonEl) {
          buttonEl.focus();
        }
        return;
      }

      const [month] = currentMonthButton;
      let newMonth = month;

      switch (key) {
        case "ArrowLeft":
          newMonth = month > 0 ? month - 1 : 11;
          break;
        case "ArrowRight":
          newMonth = month < 11 ? month + 1 : 0;
          break;
        case "ArrowUp":
          newMonth = month >= 3 ? month - 3 : month + 9;
          break;
        case "ArrowDown":
          newMonth = month <= 8 ? month + 3 : month - 9;
          break;
      }

      const buttonEl = monthButtonsRef.current.get(newMonth);
      if (buttonEl) buttonEl.focus();
    },
    [dateState.currentMonth, monthButtonsRef],
  );

  // Fungsi untuk navigasi selector tahun
  const navigateYearSelector = useCallback(
    (key: string) => {
      const activeElement = document.activeElement;
      const currentYearButton = Array.from(
        yearButtonsRef.current.entries(),
      ).find(([_, el]) => el === activeElement);

      const columnsPerRow = 3;

      if (!currentYearButton) {
        const currentYear = dateState.currentYear;
        const buttonEl = yearButtonsRef.current.get(currentYear);
        if (buttonEl) buttonEl.focus();
        return;
      }

      const [year] = currentYearButton;
      const currentIndex = years.indexOf(year);

      if (currentIndex === -1) return;

      let newIndex = currentIndex;

      switch (key) {
        case "ArrowLeft":
          newIndex = currentIndex > 0 ? currentIndex - 1 : years.length - 1;
          break;
        case "ArrowRight":
          newIndex = currentIndex < years.length - 1 ? currentIndex + 1 : 0;
          break;
        case "ArrowUp":
          newIndex = currentIndex - columnsPerRow;
          if (newIndex < 0) {
            // pindah ke baris paling bawah di kolom yang sama
            const col = currentIndex % columnsPerRow;
            const rows = Math.floor((years.length - 1) / columnsPerRow);
            newIndex = rows * columnsPerRow + col;
            if (newIndex >= years.length) {
              newIndex -= columnsPerRow; // geser ke baris atas jika overflow
            }
          }
          break;
        case "ArrowDown":
          newIndex = currentIndex + columnsPerRow;
          if (newIndex >= years.length) {
            // pindah ke baris paling atas di kolom yang sama
            newIndex = currentIndex % columnsPerRow;
          }
          break;
      }

      const newYear = years[newIndex];
      const buttonEl = yearButtonsRef.current.get(newYear);

      if (buttonEl) buttonEl.focus();
    },
    [dateState.currentYear, yearButtonsRef],
  );

  // Fungsi untuk navigasi ke tanggal tertentu
  const navigateToDate = useCallback(
    (date: Date) => {
      if (isDateDisabled(date)) return;

      const newMonth = date.getMonth();
      const newYear = date.getFullYear();

      // Cek apakah perlu berpindah bulan
      if (
        newMonth !== dateState.currentMonth ||
        newYear !== dateState.currentYear
      ) {
        // Arahkan slide berdasarkan perbedaan tanggal
        const direction =
          newYear < dateState.currentYear ||
          (newYear === dateState.currentYear &&
            newMonth < dateState.currentMonth)
            ? "right"
            : "left";

        // Update bulan saat ini dan fokuskan tanggal baru
        focusedDateRef.current = date;
        setDateState((prev) => ({
          ...prev,
          currentMonth: newMonth,
          currentYear: newYear,
          slideDirection: direction,
        }));

        // Beri waktu untuk animasi selesai, lalu fokuskan tombol tanggal
        // Reset calendar day refs karena DOM telah berubah
        calendarDayRefs.current = new Map();

        // Beri waktu untuk DOM diperbarui
        animationTimeoutRef.current = setTimeout(() => {
          setDateState((prev) => ({ ...prev, slideDirection: null }));
          const dateKey = date.toDateString();
          const buttonEl = calendarDayRefs.current.get(dateKey);

          buttonEl?.focus();
        }, 400);
      } else {
        // Tidak perlu berpindah bulan, cukup update tanggal yang difokuskan
        focusedDateRef.current = date;

        // Fokuskan ke tombol tanggal yang sesuai
        const dateKey = date.toDateString();
        const buttonEl = calendarDayRefs.current.get(dateKey);
        if (buttonEl) buttonEl.focus();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      animationTimeoutRef,
      calendarDayRefs,
      dateState.currentMonth,
      dateState.currentYear,
      focusedDateRef,
      isDateDisabled,
    ],
  );

  return { handleKeyDown };
};

const RenderFunction = (
  dateState: DateState,
  setDateState: React.Dispatch<React.SetStateAction<DateState>>,
  calendarDayRefs: React.RefObject<Map<string, HTMLButtonElement>>,
  prevButtonRef: React.RefObject<HTMLButtonElement | null>,
  nextButtonRef: React.RefObject<HTMLButtonElement | null>,
  monthButtonRef: React.RefObject<HTMLButtonElement | null>,
  yearButtonRef: React.RefObject<HTMLButtonElement | null>,
  hourInputRefs: React.RefObject<Map<string, HTMLInputElement>>,
  minuteInputRefs: React.RefObject<Map<string, HTMLInputElement>>,
  monthButtonsRef: React.RefObject<Map<number, HTMLButtonElement>>,
  yearButtonsRef: React.RefObject<Map<number, HTMLButtonElement>>,
  monthsShown: 1 | 2,
  showTimeSelect: boolean,
  selectsRange: boolean,
  daysInMonth: (month: number, year: number) => number,
  getFirstDayOfMonth: (month: number, year: number) => number,
  isDateInRange: (date: Date) => boolean,
  isDateHovered: (date: Date) => boolean,
  isDateDisabled: (date: Date) => boolean,
  handleMouseEnterDate: (date: Date) => void,
  handlePrevMonth: () => void,
  handleNextMonth: () => void,
  toggleMonthSelector: () => void,
  toggleYearSelector: () => void,
  handleDateChange: (
    type: DateChangeType,
    value: number | Date | string,
    dateType?: DateInputType,
    isCurrentMonth?: boolean,
  ) => void,
  handleTimeChange: (
    value: string,
    type: "hour" | "minute",
    dateType?: "start" | "end",
  ) => void,
  activeInputRef: React.RefObject<"start" | "end">,
  clearButtonRef: React.RefObject<HTMLButtonElement | null>,
  todayButtonRef: React.RefObject<HTMLButtonElement | null>,
  handleClear: (e: React.MouseEvent) => void,
  handleToday: (e: React.MouseEvent) => void,
  handlerClose: () => void,
) => {
  const currentMonthRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk render hari kalender
  const renderCalendarDays = useCallback(
    (monthOffset = 0) => {
      let month = dateState.currentMonth + monthOffset;
      let year = dateState.currentYear;

      // Adjust for month overflow
      while (month > 11) {
        month -= 12;
        year += 1;
      }
      while (month < 0) {
        month += 12;
        year -= 1;
      }

      const totalDays = daysInMonth(month, year);
      const firstDay = getFirstDayOfMonth(month, year);

      // Hitung bulan dan tahun sebelumnya
      let prevMonth = month - 1;
      let prevYear = year;
      if (prevMonth < 0) {
        prevMonth = 11;
        prevYear--;
      }

      // Hitung bulan dan tahun berikutnya
      let nextMonth = month + 1;
      let nextYear = year;
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
      }

      // Hitung jumlah hari di bulan sebelumnya
      const daysInPrevMonth = daysInMonth(prevMonth, prevYear);

      // Create array for days of the month
      const days: {
        date: Date;
        isCurrentMonth: boolean;
        isPrevMonth: boolean;
        isNextMonth?: boolean;
      }[] = [];

      // Tambahkan hari-hari dari bulan sebelumnya
      for (let i = 0; i < firstDay; i++) {
        const day = daysInPrevMonth - firstDay + i + 1;
        days.push({
          date: new Date(prevYear, prevMonth, day),
          isCurrentMonth: false,
          isPrevMonth: true,
        });
      }

      // Tambahkan hari-hari dari bulan saat ini
      for (let i = 1; i <= totalDays; i++) {
        days.push({
          date: new Date(year, month, i),
          isCurrentMonth: true,
          isPrevMonth: false,
          isNextMonth: false,
        });
      }

      // Tambahkan hari-hari dari bulan berikutnya untuk mengisi grid 6x7
      const totalCells = 42; // 6 baris x 7 kolom
      const remainingCells = totalCells - days.length;
      for (let i = 1; i <= remainingCells; i++) {
        const date = new Date(nextYear, nextMonth, i);
        days.push({
          date,
          isCurrentMonth: false,
          isPrevMonth: false,
          isNextMonth: true,
        });
      }

      return (
        <>
          <div className="grid grid-cols-7 mb-2">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((dayInfo, index) => (
              <CalendarDay
                key={`${dayInfo.date.toDateString()}-${index}`}
                dayInfo={dayInfo}
                dateState={dateState}
                isDateInRange={isDateInRange}
                isDateHovered={isDateHovered}
                isDateDisabled={isDateDisabled}
                selectsRange={selectsRange}
                onDateClick={(date, month) =>
                  handleDateChange("date", date, activeInputRef.current, month)
                }
                onMouseEnter={handleMouseEnterDate}
                registerDayRef={(date, el) =>
                  el?.getAttribute("aria-current") === "true"
                    ? calendarDayRefs.current.set(date.toDateString(), el)
                    : undefined
                }
              />
            ))}
          </div>
        </>
      );
    },
    [
      dateState,
      daysInMonth,
      getFirstDayOfMonth,
      isDateInRange,
      isDateHovered,
      isDateDisabled,
      selectsRange,
      handleMouseEnterDate,
      handleDateChange,
      activeInputRef,
      calendarDayRefs,
    ],
  );

  // Fungsi untuk render view bulan
  const renderMonthView = useCallback(
    (monthOffset = 0) => {
      let month = dateState.currentMonth + monthOffset;
      let year = dateState.currentYear;

      // Adjust for month overflow
      while (month > 11) {
        month -= 12;
        year += 1;
      }
      while (month < 0) {
        month += 12;
        year -= 1;
      }
      const registerMonthButtonRef = (el: HTMLButtonElement | null) =>
        (monthButtonRef.current = el);
      const registerYearButtonRef = (el: HTMLButtonElement | null) =>
        (yearButtonRef.current = el);

      return (
        <>
          <CalendarHeader
            month={month}
            year={year}
            onToggleMonthSelector={toggleMonthSelector}
            onToggleYearSelector={toggleYearSelector}
            registerMonthButtonRef={registerMonthButtonRef}
            registerYearButtonRef={registerYearButtonRef}
            monthNames={monthNames}
          />
          {renderCalendarDays(monthOffset)}
        </>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dateState.currentMonth,
      dateState.currentYear,
      dateState.startHour,
      dateState.startMinute,
      dateState.endDate,
      dateState.endHour,
      dateState.endMinute,
      monthsShown,
      handlePrevMonth,
      handleNextMonth,
      toggleMonthSelector,
      toggleYearSelector,
      renderCalendarDays,
      showTimeSelect,
      handleTimeChange,
      selectsRange,
      prevButtonRef,
      nextButtonRef,
      monthButtonRef,
      yearButtonRef,
      hourInputRefs,
      minuteInputRefs,
      activeInputRef,
    ],
  );
  // Fungsi untuk render konten kalender
  const renderCalendarContent = useCallback(
    (sm: boolean, isClearable: boolean) => {
      if (dateState.focusedElement === "monthSelector") {
        return (
          <MonthSelector
            currentMonth={dateState.currentMonth}
            onMonthChange={(month) => handleDateChange("selector-month", month)}
            registerMonthRef={(month, el) =>
              el ? monthButtonsRef.current.set(month, el) : undefined
            }
            monthNames={monthNames}
          />
        );
      }

      if (dateState.focusedElement === "yearSelector") {
        return (
          <YearSelector
            years={years}
            currentYear={dateState.currentYear}
            onYearChange={(year) => handleDateChange("selector-year", year)}
            registerYearRef={(year, el) =>
              el ? yearButtonsRef.current.set(year, el) : undefined
            }
          />
        );
      }

      const renderContent = () => (
        <>
          {/* Outgoing view */}
          {dateState.slideDirection && (
            <div
              className={twMerge(
                "absolute top-4 left-4 right-4",
                !sm
                  ? dateState.slideDirection === "left"
                    ? styles.animateSlideOutLeft
                    : dateState.slideDirection === "right"
                      ? styles.animateSlideOutRight
                      : ""
                  : dateState.slideDirection === "left"
                    ? styles.animateSlideOutUp
                    : dateState.slideDirection === "right"
                      ? styles.animateSlideOutDown
                      : "",
              )}
            >
              <div
                className={`grid grid-cols-${monthsShown} gap-4 justify-center`}
              >
                {!(monthsShown > 2 || monthsShown < 1) ? (
                  Array.from({ length: monthsShown }).map((_, index) => (
                    <div
                      key={`outgoing-${dateState.slideDirection === "left" ? --index : ++index}`}
                      className="col-span-2 sm:col-auto"
                    >
                      {renderMonthView(
                        dateState.slideDirection === "left" ? --index : ++index,
                      )}
                    </div>
                  ))
                ) : (
                  <></>
                )}
              </div>
            </div>
          )}

          {/* Incoming view */}
          <div
            ref={currentMonthRef}
            className={twMerge(
              !sm
                ? dateState.slideDirection === "left"
                  ? styles.animateSlideInLeft
                  : dateState.slideDirection === "right"
                    ? styles.animateSlideInRight
                    : ""
                : dateState.slideDirection === "left"
                  ? styles.animateSlideInUp
                  : dateState.slideDirection === "right"
                    ? styles.animateSlideInDown
                    : "",
            )}
          >
            <div
              className={`grid grid-cols-${monthsShown} gap-4 justify-center`}
              onMouseLeave={() =>
                setDateState((prev) => ({ ...prev, hoveredDate: null }))
              }
            >
              {!(monthsShown > 2 || monthsShown < 1) ? (
                Array.from({ length: monthsShown }).map((_, index) => (
                  <div
                    key={`incoming-${index}`}
                    className="col-span-2 sm:col-auto"
                  >
                    {renderMonthView(index)}
                  </div>
                ))
              ) : (
                <></>
              )}
            </div>
          </div>
        </>
      );

      if (sm) {
        const startDate = dateState.startDate;
        const endDate = dateState.endDate;
        const info = () => {
          return (
            <>
              {selectsRange && showTimeSelect ? (
                <>
                  <span className="text-xs font-thin capitalize">
                    Start {startDate?.getFullYear()}
                  </span>
                  <div className="flex justify-between mb-2">
                    <div className="flex flex-col">
                      <div className="font-thin">
                        {startDate
                          ? `${monthNames[startDate.getMonth()]} ${startDate.getDate()}`
                          : "--"}
                      </div>
                    </div>
                    <div className="font-thin">
                      {startDate
                        ? `${String(startDate.getHours()).padStart(2, "0")}:${String(
                            startDate.getMinutes(),
                          ).padStart(2, "0")}`
                        : "--:--"}
                    </div>
                  </div>
                  <span className="text-xs font-thin capitalize">
                    End {endDate?.getFullYear()}
                  </span>
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <div className="font-thin">
                        {endDate
                          ? `${monthNames[endDate.getMonth()]} ${endDate.getDate()}`
                          : "--"}
                      </div>
                    </div>
                    <div className="font-thin">
                      {endDate
                        ? `${String(endDate.getHours()).padStart(2, "0")}:${String(
                            endDate.getMinutes(),
                          ).padStart(2, "0")}`
                        : "--:--"}
                    </div>
                  </div>
                </>
              ) : selectsRange ? (
                <>
                  <span className="text-xs font-thin capitalize">
                    Select Date Range
                  </span>

                  <div className="pb-4 pt-2 flex gap-4 items-end font-thin">
                    <div>
                      <div className="font-thin text-xs">
                        {startDate?.getFullYear() ?? "-"}
                      </div>
                      {startDate
                        ? `${monthNames[startDate.getMonth()]} ${startDate.getDate()}`
                        : "Start"}
                    </div>
                    <span>-</span>
                    <div>
                      <div className="font-thin text-xs">
                        {startDate?.getFullYear() ?? "-"}
                      </div>
                      {endDate
                        ? `${monthNames[endDate.getMonth()]} ${endDate.getDate()}`
                        : "End"}
                    </div>
                  </div>
                </>
              ) : showTimeSelect ? (
                <>
                  <span className="capitalize text-xs font-thin">
                    Select Date & Time
                  </span>
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <div className="font-thin -mb-2">
                        {startDate?.getFullYear() ?? "-"}
                      </div>
                      <div className="font-thin text-lg">
                        {startDate
                          ? `${monthNames[startDate.getMonth()]} ${startDate.getDate()}`
                          : "--"}
                      </div>
                    </div>
                    <div className="font-thin">
                      {startDate
                        ? `${String(startDate.getHours()).padStart(2, "0")}:${String(
                            startDate.getMinutes(),
                          ).padStart(2, "0")}`
                        : "--:--"}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="capitalize text-xs font-thin">
                    Select Date
                  </div>

                  <div className="font-thin -mb-2">
                    {startDate?.getFullYear() ?? "-"}
                  </div>
                  <div className="font-thin text-lg">
                    {startDate
                      ? `${daysOfWeek[startDate.getDay()]}, ${monthNames[startDate.getMonth()]} ${startDate.getDate()}`
                      : "--"}
                  </div>
                </>
              )}
            </>
          );
        };

        const tabs = () => {
          return (
            <>
              {showTimeSelect && (
                <Tabs
                  value={"0"}
                  className="px-4"
                  onChange={(v) =>
                    setDateState((p) => ({ ...p, activeIndex: Number(v) }))
                  }
                >
                  <Tab
                    value="0"
                    label={<Calendar color="primary" fontSize={20} />}
                    className="rounded-b-none w-full"
                  />
                  <Tab
                    value="1"
                    label={
                      <Clock
                        color={!dateState.startHour ? "secondary" : "primary"}
                        fontSize={20}
                      />
                    }
                    disabled={!dateState.startHour}
                    className="rounded-b-none w-full"
                  />
                </Tabs>
              )}
            </>
          );
        };
        return (
          <>
            <div className="px-4 pt-4 border-b border-divider sticky top-0 bg-background-paper z-10">
              <IconButton
                variant="text"
                color="error"
                size="sm"
                tabIndex={-1}
                onClick={handlerClose}
                className="absolute top-1 right-1 bg-error-main/25"
              >
                <X fontSize={13} />
              </IconButton>

              {info()}
              {tabs()}
            </div>
            <Carousel
              activeIndex={dateState.activeIndex}
              classNames={{ root: "w-[302px]" }}
            >
              <div
                className={`relative max-h-[calc(100dvh-240px)] overflow-auto px-4 pt-4 w-full ${
                  isClearable ? "" : "pb-4"
                }`}
              >
                <IconButton
                  type="button"
                  variant="text"
                  size="sm"
                  onClick={handlePrevMonth}
                  aria-label="Bulan sebelumnya"
                  className="rotate-90 sm:rotate-0 absolute top-1 right-12 bg-background-paper z-10"
                  tabIndex={-1}
                >
                  <ChevronLeft fontSize={20} />
                </IconButton>

                <IconButton
                  type="button"
                  variant="text"
                  size="sm"
                  onClick={handleNextMonth}
                  aria-label="Bulan berikutnya"
                  className="rotate-90 sm:rotate-0 absolute top-1 right-3 bg-background-paper z-10"
                  tabIndex={-1}
                >
                  <ChevronRight fontSize={20} />
                </IconButton>
                {renderContent()}
              </div>
              {showTimeSelect && (
                <div
                  style={{ maxHeight: "calc(100dvh - 170.5px)" }}
                  className="flex justify-center items-stretch h-full "
                >
                  <div className="h-full flex p-1">
                    <TimeSelector
                      hourValue={dateState.startHour}
                      minuteValue={dateState.startMinute}
                      dateType="start"
                      handleTimeChange={handleTimeChange}
                      registerHourRef={(dateType, el) =>
                        el ? hourInputRefs.current.set(dateType, el) : undefined
                      }
                      registerMinuteRef={(dateType, el) =>
                        el
                          ? minuteInputRefs.current.set(dateType, el)
                          : undefined
                      }
                      onFocus={(focusedElement, activeInput) => {
                        activeInputRef.current = activeInput;
                        setDateState((p) => ({ ...p, focusedElement }));
                      }}
                      disabled={!dateState.startHour}
                      label={selectsRange ? "Start" : undefined}
                      sm={sm}
                    />
                  </div>
                  {selectsRange && (
                    <>
                      <span className="flex items-center">&ndash;</span>
                      <div className="h-full flex p-1 border-t border-divider">
                        <TimeSelector
                          hourValue={dateState.endHour}
                          minuteValue={dateState.endMinute}
                          dateType="end"
                          handleTimeChange={handleTimeChange}
                          registerHourRef={(dateType, el) => {
                            return el
                              ? hourInputRefs.current.set(dateType, el)
                              : undefined;
                          }}
                          registerMinuteRef={(dateType, el) => {
                            return el
                              ? minuteInputRefs.current.set(dateType, el)
                              : undefined;
                          }}
                          onFocus={(focusedElement, activeInput) => {
                            activeInputRef.current = activeInput;
                            setDateState((p) => ({ ...p, focusedElement }));
                          }}
                          disabled={!dateState.endDate}
                          label={"End"}
                          sm={sm}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </Carousel>

            <div className="pb-3 pt-1 px-4 sticky bottom-0 bg-background-paper border-t border-divider flex justify-between">
              <div>
                {isClearable && (
                  <Button
                    type="button"
                    ref={clearButtonRef}
                    onClick={(e) => {
                      handleClear(e);
                      setDateState((p) => ({ ...p, activeIndex: 0 }));
                    }}
                    tabIndex={0}
                    aria-label="Hapus tanggal"
                    color="error"
                    variant="text"
                    size="sm"
                    className="px-2"
                  >
                    Hapus
                  </Button>
                )}
              </div>
              <div>
                <Button
                  type="button"
                  onClick={handlerClose}
                  tabIndex={0}
                  variant="text"
                  size="sm"
                  className="px-2 self-end"
                >
                  Setel
                </Button>

                {!selectsRange && (
                  <Button
                    type="button"
                    ref={todayButtonRef}
                    onClick={(e) => {
                      handleToday(e);
                      setDateState((p) => ({ ...p, activeIndex: 0 }));
                    }}
                    tabIndex={0}
                    aria-label="Hapus tanggal"
                    variant="text"
                    size="sm"
                    className="px-2"
                  >
                    Hari ini
                  </Button>
                )}
              </div>
            </div>
          </>
        );
      }

      return (
        <div className="flex">
          <div className="flex-1">
            <div
              className={`relative overflow-hidden px-4 pt-4 ${isClearable ? "" : "pb-4"}`}
            >
              <IconButton
                type="button"
                variant="text"
                size="sm"
                onClick={handlePrevMonth}
                aria-label="Bulan sebelumnya"
                className="rotate-90 sm:rotate-0 absolute top-3 left-3 bg-background-paper z-10"
                tabIndex={-1}
              >
                <ChevronLeft fontSize={20} />
              </IconButton>

              <IconButton
                type="button"
                variant="text"
                size="sm"
                onClick={handleNextMonth}
                aria-label="Bulan berikutnya"
                className="rotate-90 sm:rotate-0 absolute top-3 right-3 bg-background-paper z-10"
                tabIndex={-1}
              >
                <ChevronRight fontSize={20} />
              </IconButton>
              {renderContent()}
            </div>

            <div>
              <div className="px-4 pb-4 flex">
                {isClearable && (
                  <Button
                    type="button"
                    ref={clearButtonRef}
                    onClick={handleClear}
                    tabIndex={0}
                    aria-label="Hapus tanggal"
                    color="error"
                    variant="text"
                    size="sm"
                    className="px-2"
                  >
                    Hapus
                  </Button>
                )}
                {!selectsRange && (
                  <div className="flex-1 text-right">
                    <Button
                      type="button"
                      ref={todayButtonRef}
                      onClick={(e) => {
                        handleToday(e);
                        setDateState((p) => ({ ...p, activeIndex: 0 }));
                      }}
                      tabIndex={0}
                      aria-label="Hapus tanggal"
                      variant="text"
                      size="sm"
                      className="px-2"
                    >
                      Hari ini
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showTimeSelect && (
            <div
              style={{
                maxHeight: sm
                  ? isClearable
                    ? 625
                    : 590
                  : isClearable
                    ? 335.5
                    : 310,
              }}
              className="border-l border-divider"
            >
              <div className={`${selectsRange ? "h-1/2" : "h-full"} flex p-1`}>
                <TimeSelector
                  hourValue={dateState.startHour}
                  minuteValue={dateState.startMinute}
                  dateType="start"
                  handleTimeChange={handleTimeChange}
                  registerHourRef={(dateType, el) =>
                    el ? hourInputRefs.current.set(dateType, el) : undefined
                  }
                  registerMinuteRef={(dateType, el) =>
                    el ? minuteInputRefs.current.set(dateType, el) : undefined
                  }
                  onFocus={(focusedElement, activeInput) => {
                    activeInputRef.current = activeInput;
                    setDateState((p) => ({ ...p, focusedElement }));
                  }}
                  disabled={!dateState.startHour}
                  sm={sm}
                />
              </div>
              {selectsRange && (
                <div className="h-1/2 flex p-1">
                  <TimeSelector
                    hourValue={dateState.endHour}
                    minuteValue={dateState.endMinute}
                    dateType="end"
                    handleTimeChange={handleTimeChange}
                    registerHourRef={(dateType, el) => {
                      return el
                        ? hourInputRefs.current.set(dateType, el)
                        : undefined;
                    }}
                    registerMinuteRef={(dateType, el) => {
                      return el
                        ? minuteInputRefs.current.set(dateType, el)
                        : undefined;
                    }}
                    onFocus={(focusedElement, activeInput) => {
                      activeInputRef.current = activeInput;
                      setDateState((p) => ({ ...p, focusedElement }));
                    }}
                    disabled={!dateState.endDate}
                    sm={sm}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      );
    },
    [
      dateState.focusedElement,
      dateState.startHour,
      dateState.startMinute,
      dateState.endHour,
      dateState.endMinute,
      dateState.endDate,
      dateState.currentMonth,
      dateState.currentYear,
      dateState.slideDirection,
      dateState.startDate,
      dateState.activeIndex,
      handlePrevMonth,
      handleNextMonth,
      clearButtonRef,
      handleClear,
      todayButtonRef,
      showTimeSelect,
      selectsRange,
      handleTimeChange,
      handleDateChange,
      monthButtonsRef,
      yearButtonsRef,
      monthsShown,
      renderMonthView,
      handlerClose,
      setDateState,
      hourInputRefs,
      minuteInputRefs,
      activeInputRef,
      handleToday,
    ],
  );

  return { renderCalendarContent };
};

const Effects = (
  setDateState: React.Dispatch<React.SetStateAction<DateState>>,
  animationTimeoutRef: React.RefObject<ReturnType<typeof setTimeout> | null>,
  selectsRange: boolean,
  value?: string,
  name?: string,
) => {
  // Parse initial value if provided
  useEffect(() => {
    if (!value) {
      setDateState({
        startDate: null,
        endDate: null,
        hoveredDate: null,
        currentMonth: today.getMonth(),
        currentYear: today.getFullYear(),
        slideDirection: null,
        focusedElement: "calendar",
        startDay: "",
        startMonth: "",
        startYear: "",
        startHour: "",
        startMinute: "",
        endDay: "",
        endMonth: "",
        endYear: "",
        endHour: "",
        endMinute: "",
        activeIndex: 0,
      });
      return;
    }

    try {
      if (selectsRange && value.includes("/")) {
        const [startStr, endStr] = value.split("/");
        const startDate = new Date(startStr);
        const endDate = new Date(endStr);

        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          setDateState((prev) => ({
            ...prev,
            startDate,
            endDate,
            currentMonth: startDate.getMonth(),
            currentYear: startDate.getFullYear(),
            startDay: startDate.getDate().toString().padStart(2, "0"),
            startMonth: (startDate.getMonth() + 1).toString().padStart(2, "0"),
            startYear: startDate.getFullYear().toString(),
            startHour: startDate.getHours().toString().padStart(2, "0"),
            startMinute: startDate.getMinutes().toString().padStart(2, "0"),
            endDay: endDate.getDate().toString().padStart(2, "0"),
            endMonth: (endDate.getMonth() + 1).toString().padStart(2, "0"),
            endYear: endDate.getFullYear().toString(),
            endHour: endDate.getHours().toString().padStart(2, "0"),
            endMinute: endDate.getMinutes().toString().padStart(2, "0"),
          }));
        }
      } else {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          setDateState((prev) => ({
            ...prev,
            startDate: date,
            currentMonth: date.getMonth(),
            currentYear: date.getFullYear(),
            startDay: date.getDate().toString().padStart(2, "0"),
            startMonth: (date.getMonth() + 1).toString().padStart(2, "0"),
            startYear: date.getFullYear().toString(),
            startHour: date.getHours().toString().padStart(2, "0"),
            startMinute: date.getMinutes().toString().padStart(2, "0"),
          }));
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Invalid date format", error);
    }
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (animationTimeoutRef.current)
        clearTimeout(animationTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, selectsRange, name]);
};

// ===== TYPES =====
export interface InputDateProps extends TextFieldProps {
  id?: string;
  value?: string;
  min?: string;
  max?: string;
  selectsRange?: boolean;
  showTimeSelect?: boolean;
  showTimeInput?: boolean;
  disabledTimeInput?: boolean;
  isClearable?: boolean;
  monthsShown?: 1 | 2;
  customTrigger?: (options: {
    value: string;
    clear: (e: React.MouseEvent) => void;
  }) => React.ReactNode;
}

export interface DateState {
  startDate: Date | null;
  endDate: Date | null;
  hoveredDate: Date | null;
  currentMonth: number;
  currentYear: number;
  slideDirection: "left" | "right" | null;
  focusedElement:
    | "calendar"
    | "monthSelector"
    | "yearSelector"
    | "monthButton"
    | "yearButton"
    | "hourInput"
    | "minuteInput"
    | "prevButton"
    | "nextButton";
  startDay: string;
  startMonth: string;
  startYear: string;
  startHour: string;
  startMinute: string;
  endDay: string;
  endMonth: string;
  endYear: string;
  endHour: string;
  endMinute: string;
  activeIndex: number;
}

type DateChangeType =
  "day" | "month" | "year" | "date" | "selector-month" | "selector-year";
type DateInputType = "start" | "end";

// ===== MAIN COMPONENT =====
const InputDate = forwardRef<DateInputRef, InputDateProps>((props, ref) => {
  const {
    id,
    name,
    value,
    min,
    max,
    selectsRange = false,
    showTimeSelect = false,
    isClearable = false,
    showTimeInput = false,
    disabledTimeInput = false,
    monthsShown = 1,
    onChange,
    customTrigger,
    ...rest
  } = props;

  // Refs untuk elemen yang bisa difokuskan
  const calendarDayRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const monthButtonRef = useRef<HTMLButtonElement>(null);
  const yearButtonRef = useRef<HTMLButtonElement>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const hourInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const minuteInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const monthButtonsRef = useRef<Map<number, HTMLButtonElement>>(new Map());
  const yearButtonsRef = useRef<Map<number, HTMLButtonElement>>(new Map());
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const todayButtonRef = useRef<HTMLButtonElement>(null);
  const focusedDateRef = useRef<Date | null>(null);
  const activeInputRef = useRef<"start" | "end">("start");
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const dayRangeRef = useRef<HTMLInputElement>(null);
  const monthRangeRef = useRef<HTMLInputElement>(null);
  const yearRangeRef = useRef<HTMLInputElement>(null);
  const hourRangeRef = useRef<HTMLInputElement>(null);
  const minuteRangeRef = useRef<HTMLInputElement>(null);

  // State untuk tanggal dan UI
  const [dateState, setDateState] = useState<DateState>(() => {
    if (!value) {
      return {
        startDate: null,
        endDate: null,
        hoveredDate: null,
        currentMonth: today.getMonth(),
        currentYear: today.getFullYear(),
        slideDirection: null,
        focusedElement: "calendar",
        startDay: "",
        startMonth: "",
        startYear: "",
        startHour: "",
        startMinute: "",
        endDay: "",
        endMonth: "",
        endYear: "",
        endHour: "",
        endMinute: "",
        activeIndex: 0,
      };
    }

    try {
      if (selectsRange && value.includes("/")) {
        const [startStr, endStr] = value.split("/");
        const startDate = new Date(startStr);
        const endDate = new Date(endStr);

        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          return {
            hoveredDate: null,
            slideDirection: null,
            focusedElement: "calendar",
            activeIndex: 0,
            startDate,
            endDate,
            currentMonth: startDate.getMonth(),
            currentYear: startDate.getFullYear(),
            startDay: startDate.getDate().toString().padStart(2, "0"),
            startMonth: (startDate.getMonth() + 1).toString().padStart(2, "0"),
            startYear: startDate.getFullYear().toString(),
            startHour: startDate.getHours().toString().padStart(2, "0"),
            startMinute: startDate.getMinutes().toString().padStart(2, "0"),
            endDay: endDate.getDate().toString().padStart(2, "0"),
            endMonth: (endDate.getMonth() + 1).toString().padStart(2, "0"),
            endYear: endDate.getFullYear().toString(),
            endHour: endDate.getHours().toString().padStart(2, "0"),
            endMinute: endDate.getMinutes().toString().padStart(2, "0"),
          };
        }
      } else {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return {
            endDate: null,
            hoveredDate: null,
            slideDirection: null,
            focusedElement: "calendar",
            endDay: "",
            endMonth: "",
            endYear: "",
            endHour: "",
            endMinute: "",
            activeIndex: 0,

            startDate: date,
            currentMonth: date.getMonth(),
            currentYear: date.getFullYear(),
            startDay: date.getDate().toString().padStart(2, "0"),
            startMonth: (date.getMonth() + 1).toString().padStart(2, "0"),
            startYear: date.getFullYear().toString(),
            startHour: date.getHours().toString().padStart(2, "0"),
            startMinute: date.getMinutes().toString().padStart(2, "0"),
          };
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Invalid date format", error);
    }
    // Always return a valid DateState object as fallback
    return {
      startDate: null,
      endDate: null,
      hoveredDate: null,
      currentMonth: today.getMonth(),
      currentYear: today.getFullYear(),
      slideDirection: null,
      focusedElement: "calendar",
      startDay: "",
      startMonth: "",
      startYear: "",
      startHour: "",
      startMinute: "",
      endDay: "",
      endMonth: "",
      endYear: "",
      endHour: "",
      endMinute: "",
      activeIndex: 0,
    };
  });

  // Refs lainnya
  const calendarRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const sm = !useMediaQuery("sm");
  const closePopoverRef = useRef<() => void>(() => {});

  // ===== HELPER FUNCTIONS =====
  const {
    daysInMonth,
    formatToISOString,
    getFirstDayOfMonth,
    isDateDisabled,
    isDateHovered,
    isDateInRange,
    safeOnChange,
  } = HelperFunction(activeInputRef, dateState, onChange, min, max);

  // ===== EVENT HANDLERS =====
  const customHandlerClose = useCallback(() => {
    closePopoverRef.current();
    dayRef.current?.focus();
    setTimeout(() => {
      setDateState((p) => ({
        ...p,
        slideDirection: null,
        currentMonth: p.startDate ? p.startDate.getMonth() : today.getMonth(),
        currentYear: p.startDate
          ? p.startDate.getFullYear()
          : today.getFullYear(),
        focusedElement: "calendar",
        activeIndex: 0,
      }));
    }, 400);
  }, [dayRef, setDateState]);

  const {
    handleClear,
    handleToday,
    handleDateChange,
    handleMouseEnterDate,
    handleNextMonth,
    handlePrevMonth,
    handleTimeChange,
    toggleMonthSelector,
    toggleYearSelector,
  } = EventHandler(
    dateState,
    setDateState,
    daysInMonth,
    isDateDisabled,
    calendarDayRefs,
    animationTimeoutRef,
    formatToISOString,
    safeOnChange,
    () => {},
    dayRef,
    monthButtonsRef,
    yearButtonsRef,
    selectsRange,
    showTimeSelect,
    focusedDateRef,
    activeInputRef,
    name,
  );

  // ===== FOCUS MANAGEMENT & KEYBOARD NAVIGATION =====
  const { handleKeyDown } = FocusManagement(
    true,
    customHandlerClose,
    dateState,
    setDateState,
    monthButtonRef,
    yearButtonRef,
    calendarDayRefs,
    hourInputRefs,
    minuteInputRefs,
    clearButtonRef,
    todayButtonRef,
    prevButtonRef,
    nextButtonRef,
    monthButtonsRef,
    yearButtonsRef,
    animationTimeoutRef,
    isClearable,
    selectsRange,
    showTimeSelect,
    handleDateChange,
    handlePrevMonth,
    handleNextMonth,
    isDateDisabled,
    focusedDateRef,
    activeInputRef,
    handleMouseEnterDate,
  );

  // ===== RENDER FUNCTIONS =====
  const { renderCalendarContent } = RenderFunction(
    dateState,
    setDateState,
    calendarDayRefs,
    prevButtonRef,
    nextButtonRef,
    monthButtonRef,
    yearButtonRef,
    hourInputRefs,
    minuteInputRefs,
    monthButtonsRef,
    yearButtonsRef,
    monthsShown,
    showTimeSelect,
    selectsRange,
    daysInMonth,
    getFirstDayOfMonth,
    isDateInRange,
    isDateHovered,
    isDateDisabled,
    handleMouseEnterDate,
    handlePrevMonth,
    handleNextMonth,
    toggleMonthSelector,
    toggleYearSelector,
    handleDateChange,
    handleTimeChange,
    activeInputRef,
    clearButtonRef,
    todayButtonRef,
    handleClear,
    handleToday,
    customHandlerClose,
  );

  // ===== EFFECTS =====
  Effects(setDateState, animationTimeoutRef, selectsRange, value, name);

  // ===== RENDER =====

  return (
    <Popover
      position="bottom-left"
      interaction="click"
      classNames={{ popover: "p-0 overflow-hidden bg-bg-paper min-w-[24rem]" }}
      trigger={
        customTrigger ? (
          customTrigger({
            value: value || "",
            clear: (e) => {
              handleClear(e);
              setDateState((p) => ({ ...p, activeIndex: 0 }));
            },
          })
        ) : (
          <DateInput
            ref={ref}
            id={id}
            monthNames={monthNames}
            selectsRange={selectsRange}
            dateState={dateState}
            formatToISOString={formatToISOString}
            handleDateChange={handleDateChange}
            handleTimeChange={handleTimeChange}
            handleClear={(e) => {
              handleClear(e);
              setDateState((p) => ({ ...p, activeIndex: 0 }));
            }}
            showTimeSelect={showTimeSelect}
            isClearable={isClearable}
            sm={sm}
            dayRef={dayRef}
            hourRef={hourRef}
            minuteRef={minuteRef}
            monthRef={monthRef}
            yearRef={yearRef}
            dayRangeRef={dayRangeRef}
            monthRangeRef={monthRangeRef}
            yearRangeRef={yearRangeRef}
            hourRangeRef={hourRangeRef}
            minuteRangeRef={minuteRangeRef}
            name={name}
            showTimeInput={showTimeInput}
            disabledTimeInput={disabledTimeInput}
            {...rest}
          />
        )
      }
    >
      {(closePopover) => {
        closePopoverRef.current = closePopover;

        return (
          <div
            ref={calendarRef}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                e.preventDefault();
                customHandlerClose();
              } else {
                handleKeyDown(e);
              }
            }}
            className="w-full outline-none"
            tabIndex={0}
            aria-label="Kalender"
          >
            {renderCalendarContent(sm, isClearable)}
          </div>
        );
      }}
    </Popover>
  );
});

InputDate.displayName = "InputDate";
export default InputDate;
