import React, {
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";
import type { TabProps } from "./Tab";

export interface TabsProps {
  value: string;
  onChange?: (value: string) => void;
  children: ReactElement<any> | ReactElement<any>[];
  className?: string;
}

export default function Tabs({
  value,
  onChange,
  children,
  className = "",
}: TabsProps) {
  const tabs = React.Children.toArray(children) as ReactElement<
    TabProps<any>
  >[];

  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
  };

  useLayoutEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.props.value === value);
    if (activeIndex === -1 || !containerRef.current) return;

    const activeTabEl = tabRefs.current[activeIndex];
    const containerEl = containerRef.current;
    if (!activeTabEl) return;

    if (indicatorRef.current) {
      indicatorRef.current.style.transform = `translateX(${activeTabEl.offsetLeft}px)`;
      indicatorRef.current.style.width = `${activeTabEl.offsetWidth}px`;
    }

    const tabLeft = activeTabEl.offsetLeft;
    const tabRight = tabLeft + activeTabEl.offsetWidth;
    const containerScrollLeft = containerEl.scrollLeft;
    const containerWidth = containerEl.clientWidth;

    const BUTTON_BUFFER = 50;
    let targetScroll = containerScrollLeft;

    if (tabLeft < containerScrollLeft + BUTTON_BUFFER) {
      targetScroll = Math.max(0, tabLeft - BUTTON_BUFFER);
    } else if (
      tabRight >
      containerScrollLeft + containerWidth - BUTTON_BUFFER
    ) {
      targetScroll = tabRight - containerWidth + BUTTON_BUFFER;
    }

    if (isFirstRender.current) {
      containerEl.scrollTo({ left: targetScroll, behavior: "auto" });
      isFirstRender.current = false;

      requestAnimationFrame(() => {
        if (indicatorRef.current) {
          indicatorRef.current.classList.add("transition-all", "duration-300");
        }
        updateScrollButtons();
      });
    } else {
      containerEl.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  }, [value]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container) {
      updateScrollButtons();
      container.addEventListener("scroll", updateScrollButtons);
      window.addEventListener("resize", updateScrollButtons);

      return () => {
        container.removeEventListener("scroll", updateScrollButtons);
        window.removeEventListener("resize", updateScrollButtons);
      };
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (tabs.length === 0) return null;

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <button
        type="button"
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        aria-hidden={!canScrollLeft}
        className={`shrink-0 flex items-center justify-center bg-bg-paper border shadow-sm rounded-full text-text-secondary hover:text-text-primary transition-all duration-300 ease-in-out overflow-hidden ${
          canScrollLeft
            ? "w-8 h-8 opacity-100 border-divider mr-2"
            : "w-0 h-8 opacity-0 border-transparent mr-0"
        }`}
        aria-label="Scroll left"
      >
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div
        ref={containerRef}
        className="flex-1 flex overflow-x-auto p-1 bg-divider/20 rounded-2xl relative scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-none]"
      >
        <div
          ref={indicatorRef}
          className="absolute top-1 bottom-1 bg-bg-paper rounded-xl shadow-sm ease-out"
        />

        {tabs.map((tab, index) => {
          const {
            value: tabValue,
            label,
            component,
            onClick,
            className: customClassName,
            ...restProps
          } = tab.props;

          const Component = component || "button";
          const isActive = tabValue === value;
          const isButton = Component === "button";

          return (
            <Component
              key={tabValue}
              ref={(el: HTMLElement | null) => {
                tabRefs.current[index] = el;
              }}
              type={isButton ? "button" : undefined}
              onClick={(e: React.MouseEvent) => {
                onChange?.(tabValue);
                if (onClick) onClick(e);
              }}
              className={`relative z-10 py-2.5 px-5 text-sm font-bold transition-colors duration-300 rounded-xl focus:outline-none whitespace-nowrap ${
                isActive
                  ? "text-primary-main"
                  : "text-text-secondary hover:text-text-primary"
              } ${customClassName || ""}`}
              {...restProps}
            >
              {label}
            </Component>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        aria-hidden={!canScrollRight}
        className={`shrink-0 flex items-center justify-center bg-bg-paper border shadow-sm rounded-full text-text-secondary hover:text-text-primary transition-all duration-300 ease-in-out overflow-hidden ${
          canScrollRight
            ? "w-8 h-8 opacity-100 border-divider ml-2"
            : "w-0 h-8 opacity-0 border-transparent ml-0"
        }`}
        aria-label="Scroll right"
      >
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
