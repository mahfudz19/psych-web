import { useId, type ReactNode } from "react";

// Definisikan opsi posisi yang tersedia
export type PopoverPosition =
  "bottom-right" | "bottom-left" | "right-center" | "left-center" | "top-right";

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  position?: PopoverPosition;
  interaction?: "click" | "focus";
}

const POSITION_PRESETS: Record<
  PopoverPosition,
  { wrapper: string; animateOnFocus: string; animateOnClick: string }
> = {
  "bottom-right": {
    wrapper: "absolute right-0 mt-3",
    animateOnFocus:
      "origin-top-right transition-all duration-200 ease-out scale-95 opacity-0 invisible group-focus-within:scale-100 group-focus-within:opacity-100 group-focus-within:visible",
    animateOnClick:
      "origin-top-right transition-all duration-200 ease-out scale-95 opacity-0 invisible peer-checked:scale-100 peer-checked:opacity-100 peer-checked:visible",
  },
  "bottom-left": {
    wrapper: "absolute left-0 mt-3",
    animateOnFocus:
      "origin-top-left transition-all duration-200 ease-out scale-95 opacity-0 invisible group-focus-within:scale-100 group-focus-within:opacity-100 group-focus-within:visible",
    animateOnClick:
      "origin-top-left transition-all duration-200 ease-out scale-95 opacity-0 invisible peer-checked:scale-100 peer-checked:opacity-100 peer-checked:visible",
  },
  "right-center": {
    wrapper:
      "absolute left-0 bottom-full mb-2 lg:bottom-auto lg:left-[calc(100%+8px)] lg:top-1/2 lg:mb-0 lg:transform lg:-translate-y-1/2", // Password Popover responsive
    animateOnFocus:
      "origin-bottom lg:origin-left transition-all duration-300 pointer-events-none opacity-0 invisible scale-95 lg:scale-95 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:scale-100",
    animateOnClick:
      "origin-bottom lg:origin-left transition-all duration-300 opacity-0 invisible scale-95 lg:scale-95 peer-checked:opacity-100 peer-checked:visible peer-checked:scale-100",
  },
  "left-center": {
    wrapper: "absolute right-full mr-2 top-1/2 transform -translate-y-1/2",
    animateOnFocus:
      "origin-right transition-all duration-200 ease-out scale-95 opacity-0 invisible group-focus-within:scale-100 group-focus-within:opacity-100 group-focus-within:visible",
    animateOnClick:
      "origin-right transition-all duration-200 ease-out scale-95 opacity-0 invisible peer-checked:scale-100 peer-checked:opacity-100 peer-checked:visible",
  },
  "top-right": {
    wrapper: "absolute right-0 bottom-full mb-3",
    animateOnFocus:
      "origin-bottom-right transition-all duration-200 ease-out scale-95 opacity-0 invisible group-focus-within:scale-100 group-focus-within:opacity-100 group-focus-within:visible",
    animateOnClick:
      "origin-bottom-right transition-all duration-200 ease-out scale-95 opacity-0 invisible peer-checked:scale-100 peer-checked:opacity-100 peer-checked:visible",
  },
};

export default function Popover({
  trigger,
  children,
  position = "bottom-right",
  interaction = "click",
}: PopoverProps) {
  const popoverId = useId();

  const closePopover = () => {
    if (interaction === "click") {
      const checkbox = document.getElementById(popoverId) as HTMLInputElement;
      if (checkbox) checkbox.checked = false;
    }
  };

  const preset = POSITION_PRESETS[position];
  const animationClass =
    interaction === "click" ? preset.animateOnClick : preset.animateOnFocus;

  return (
    <div className={`relative ${interaction === "focus" ? "group" : ""}`}>
      {interaction === "click" && (
        <>
          <input type="checkbox" id={popoverId} className="peer hidden" />
          <label
            htmlFor={popoverId}
            className="fixed inset-0 z-40 hidden peer-checked:block cursor-default"
            aria-hidden="true"
          ></label>
        </>
      )}

      {interaction === "click" ? (
        <label
          htmlFor={popoverId}
          className="cursor-pointer relative z-30 block"
        >
          {trigger}
        </label>
      ) : (
        <div className="relative z-30 block">{trigger}</div>
      )}

      <div
        className={`bg-bg-paper rounded-3xl shadow-xl border border-divider p-2 z-50 ${preset.wrapper} ${animationClass}`}
      >
        {typeof children === "function" ? children(closePopover) : children}
      </div>
    </div>
  );
}
