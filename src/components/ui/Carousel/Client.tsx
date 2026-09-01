"use client";
import {
  Children,
  useEffect,
  useRef,
  useState,
  useCallback,
  type RefObject,
} from "react";
import { twMerge } from "tailwind-merge";

interface CarouselProps {
  activeIndex: number;
  children: React.ReactNode;
  autoScrollUp?: boolean;
  noAutoHeight?: boolean;
  reranderNewHight?: boolean; // Props baru yang Anda minta
  classNames?: { root?: string; container?: string; child?: string };
}

const useMeasureActiveChild = (
  containerRef: RefObject<HTMLDivElement | null>,
  activeIndex: number,
  enabled: boolean,
  rerenderFlag: boolean | undefined,
  onChange: (height: number | undefined) => void,
) => {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // stable debounce timer ref
  const debounceRef = useRef<number | null>(null);
  // single observers used and reused
  const roRef = useRef<ResizeObserver | null>(null);
  const moRef = useRef<MutationObserver | null>(null);
  const imageRemoversRef = useRef<Array<() => void>>([]);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return onChangeRef.current(undefined);
    const active = container.children[activeIndex] as HTMLElement | undefined;
    if (!active) return onChangeRef.current(undefined);
    const h = Math.ceil(
      active.getBoundingClientRect().height || active.offsetHeight || 0,
    );
    onChangeRef.current(h);
  }, [activeIndex, containerRef]);

  useEffect(() => {
    if (!enabled) {
      onChangeRef.current(undefined);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const observeActive = () => {
      const active = container.children[activeIndex] as HTMLElement | undefined;
      // cleanup previous listeners
      roRef.current?.disconnect();
      moRef.current?.disconnect();
      imageRemoversRef.current.forEach((off) => off());
      imageRemoversRef.current = [];
      if (!active) return;

      // debounce wrapper
      const debounced = () => {
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
          measure();
          debounceRef.current = null;
        }, 80);
      };

      // ResizeObserver
      roRef.current = new ResizeObserver(debounced);
      roRef.current.observe(active);

      // MutationObserver for subtree changes
      moRef.current = new MutationObserver(debounced);
      moRef.current.observe(active, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      // image load listeners
      const imgs = Array.from(active.querySelectorAll("img"));
      imageRemoversRef.current = imgs.map((img) => {
        const fn = debounced;
        img.addEventListener("load", fn);
        return () => img.removeEventListener("load", fn);
      });

      // initial measure next frame
      requestAnimationFrame(debounced);
    };

    observeActive();

    return () => {
      roRef.current?.disconnect();
      moRef.current?.disconnect();
      imageRemoversRef.current.forEach((off) => off());
      imageRemoversRef.current = [];
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // only re-run when activeIndex or enabled or rerenderFlag changes
  }, [activeIndex, enabled, rerenderFlag, measure, containerRef]);
};

const CarouselClient: React.FC<CarouselProps> = (props) => {
  const {
    activeIndex,
    children,
    noAutoHeight = false,
    reranderNewHight,
    classNames,
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);
  const [hasMeasured, setHasMeasured] = useState(false);

  useMeasureActiveChild(
    containerRef,
    activeIndex,
    !noAutoHeight,
    reranderNewHight,
    (newHeight) => {
      setHeight(newHeight ?? 0);
      if (!hasMeasured) setHasMeasured(true);
    },
  );

  return (
    <div
      className={twMerge("relative w-full overflow-hidden", classNames?.root)}
      style={{
        height,
        transition: hasMeasured ? "height 300ms ease-in-out" : "none",
      }}
    >
      <div
        ref={containerRef}
        className={twMerge(
          "w-full flex transition-transform duration-300 ease-in-out items-start",
          classNames?.container,
        )}
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {Children.map(children, (child, index) => (
          <div
            key={`${index}`}
            className={twMerge("w-full shrink-0", classNames?.child)}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselClient;
