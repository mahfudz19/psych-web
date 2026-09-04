"use client";
import { Children, useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

interface CarouselProps {
  activeIndex: number;
  children: React.ReactNode;
  className?: string;
  noAutoHeight?: boolean;
  autoScrollUp: true;
  classNames?: { root?: string; container?: string; child?: string };
}

const CarouselAutoScrollUp: React.FC<CarouselProps> = (props) => {
  const childHeights = useRef<Record<number, number>>({});
  const {
    activeIndex,
    children,
    className,
    noAutoHeight = false,
    autoScrollUp,
    classNames,
  } = props;

  useEffect(() => {
    if (autoScrollUp) window?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeIndex, autoScrollUp]);

  return (
    <div
      className={twMerge(
        "relative w-full overflow-hidden",
        className,
        classNames?.root,
      )}
    >
      <div
        className={twMerge("w-full flex items-start", classNames?.container)}
        style={{
          transform: `translateX(-${activeIndex * 100}%)`,
          height: noAutoHeight
            ? "auto"
            : childHeights.current[activeIndex]
              ? `${childHeights.current[activeIndex]}px`
              : "auto",
          transition: `transform 300ms ease-in-out${childHeights.current[activeIndex] ? ", height 300ms ease-in-out" : ""}`,
        }}
      >
        {Children.map(children, (child, index) => (
          <div
            key={index}
            className={twMerge("w-full shrink-0", classNames?.child)}
            ref={(element) => {
              if (element)
                childHeights.current[index] = Math.ceil(
                  element.getBoundingClientRect().height,
                );
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselAutoScrollUp;
