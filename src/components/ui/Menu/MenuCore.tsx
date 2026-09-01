import {
  cloneElement,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  useRef,
} from "react";
import type { MenuProps } from ".";
import Popover from "../Popover";
import { twMerge } from "tailwind-merge";

export default function MenuCore({
  trigger,
  position = "bottom-right",
  widthClass = "w-64",
  children,
}: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  type TriggerProps = { onClick?: (e: MouseEvent) => void };

  const triggerWithFocus = isValidElement<TriggerProps>(trigger)
    ? cloneElement(trigger, {
        onClick: (e: React.MouseEvent) => {
          if (trigger.props.onClick) trigger.props.onClick(e);

          setTimeout(() => {
            if (menuRef.current) {
              const activeItem = menuRef.current.querySelector<HTMLElement>(
                '.active, [aria-selected="true"], [aria-current="page"], [data-active="true"]',
              );

              if (activeItem && !activeItem.hasAttribute("disabled")) {
                activeItem.focus();
              } else {
                const firstItem = menuRef.current.querySelector<HTMLElement>(
                  '[role="menuitem"]:not(:disabled), button:not(:disabled), a[href]',
                );
                firstItem?.focus();
              }
            }
          }, 50);
        },
      })
    : trigger;

  return (
    <Popover trigger={triggerWithFocus} position={position} interaction="click">
      {(close) => {
        const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
          if (!menuRef.current) return;

          const items = Array.from(
            menuRef.current.querySelectorAll<HTMLElement>(
              '[role="menuitem"]:not(:disabled), button:not(:disabled), a[href]',
            ),
          );

          if (items.length === 0) return;

          const currentIndex = items.findIndex(
            (el) => el === document.activeElement,
          );

          switch (e.key) {
            case "ArrowDown":
              e.preventDefault();
              const nextIndex =
                currentIndex < items.length - 1 ? currentIndex + 1 : 0;
              items[nextIndex]?.focus();
              break;
            case "ArrowUp":
              e.preventDefault();
              const prevIndex =
                currentIndex > 0 ? currentIndex - 1 : items.length - 1;
              items[prevIndex]?.focus();
              break;
            case "Home":
              e.preventDefault();
              items[0]?.focus();
              break;
            case "End":
              e.preventDefault();
              items[items.length - 1]?.focus();
              break;
            case "Escape":
            case "Tab":
              e.preventDefault();
              close();

              setTimeout(() => {
                const triggerElement = document.querySelector(
                  '[aria-expanded="true"]',
                ) as HTMLElement;
                triggerElement?.focus();
              }, 10);
              break;
          }
        };

        return (
          <div
            ref={menuRef}
            role="menu"
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            className={twMerge(
              "flex flex-col gap-0.5 outline-none",
              widthClass,
            )}
          >
            {children(close)}
          </div>
        );
      }}
    </Popover>
  );
}
