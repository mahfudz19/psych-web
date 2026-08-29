import React, { type ReactNode, useRef } from "react";
import Popover, { type PopoverPosition } from "../Popover";
import Ripple from "../Ripple";
import type { color } from "../Type";

export interface MenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
  rippleColor?: color;
}

export function MenuItem({
  children,
  onClick,
  className = "",
  icon,
  rippleColor = "primary",
}: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`w-full relative overflow-hidden flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-text-secondary focus:outline-none transition-colors text-left ${className}`}
    >
      <span className="relative z-10 flex items-center gap-3 w-full">
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="flex-1 truncate">{children}</span>
      </span>

      <Ripple color={rippleColor} />
    </button>
  );
}

export interface MenuProps {
  trigger: ReactNode;
  position?: PopoverPosition;
  widthClass?: string;
  children: (close: () => void) => ReactNode;
}

export default function MenuCore({
  trigger,
  position = "bottom-right",
  widthClass = "w-64",
  children,
}: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  type TriggerProps = { onClick?: (e: React.MouseEvent) => void };

  const triggerWithFocus = React.isValidElement<TriggerProps>(trigger)
    ? React.cloneElement(trigger, {
        onClick: (e: React.MouseEvent) => {
          if (trigger.props.onClick) trigger.props.onClick(e);

          setTimeout(() => {
            if (menuRef.current) {
              const firstItem = menuRef.current.querySelector<HTMLElement>(
                '[role="menuitem"]:not(:disabled), button:not(:disabled), a[href]',
              );
              firstItem?.focus();
            }
          }, 50);
        },
      })
    : trigger;

  return (
    <Popover trigger={triggerWithFocus} position={position} interaction="click">
      {(close) => {
        const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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
            className={`${widthClass} flex flex-col gap-0.5 outline-none`}
          >
            {children(close)}
          </div>
        );
      }}
    </Popover>
  );
}

export function MenuHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-3 py-3 border-b border-divider ${className}`}>
      {children}
    </div>
  );
}

export function MenuDivider() {
  return <div className="my-1 border-t border-divider" />;
}
