import { Children, useRef } from "react";
import { twMerge } from "tailwind-merge";
import CarouselAutoScrollUp from "./CarouselAutoScrollUp";
import CarouselClient from "./Client";

interface CarouselProps {
  activeIndex: number;
  children: React.ReactNode;
  className?: string;
  noAutoHeight?: boolean;
  autoScrollUp?: boolean;
  classNames?: { root?: string; container?: string; child?: string };
  deepAutoHeight?: boolean;
}

const Carousel: React.FC<CarouselProps> = (props) => {
  const childHeights = useRef<Record<number, number>>({});
  const {
    activeIndex,
    children,
    className,
    noAutoHeight = false,
    autoScrollUp,
    classNames,
    deepAutoHeight,
  } = props;

  if (autoScrollUp)
    return <CarouselAutoScrollUp {...props} autoScrollUp={autoScrollUp} />;
  if (deepAutoHeight) return <CarouselClient {...props} />;

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
          height: noAutoHeight ? "auto" : childHeights[activeIndex],
          transition: `transform 300ms ease-in-out${childHeights[activeIndex] ? ", height 300ms ease-in-out" : ""}`,
        }}
      >
        {Children.map(children, (child, index) => (
          <div
            key={index}
            className={twMerge("w-full shrink-0", classNames?.child)}
            ref={(element) => {
              if (element)
                childHeights[index] = Math.ceil(
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

export default Carousel;
