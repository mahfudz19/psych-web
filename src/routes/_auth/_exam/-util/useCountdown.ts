import { useEffect, useRef, useState } from "react";

export function useCountdown(
  deadlineAt: string | null | undefined,
  serverTime: string | null | undefined,
  onZero?: () => void,
): number | null {
  const [offset, setOffset] = useState<number>(() => {
    const t = serverTime ? Date.parse(serverTime) : NaN;
    return Number.isNaN(t) ? 0 : t - Date.now();
  });
  const [remaining, setRemaining] = useState<number | null>(null);
  const firedRef = useRef(false);
  const onZeroRef = useRef(onZero);

  useEffect(() => {
    onZeroRef.current = onZero;
  }, [onZero]);

  // Sinkronkan ulang selisih jam setiap ada serverTime baru.
  useEffect(() => {
    const t = serverTime ? Date.parse(serverTime) : NaN;
    if (!Number.isNaN(t)) setOffset(t - Date.now());
  }, [serverTime]);

  useEffect(() => {
    const deadline = deadlineAt ? Date.parse(deadlineAt) : NaN;
    if (Number.isNaN(deadline)) {
      setRemaining(null);
      return;
    }

    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((deadline - (Date.now() + offset)) / 1000),
      );
      setRemaining(left);
      if (left === 0 && !firedRef.current) {
        firedRef.current = true;
        onZeroRef.current?.();
      }
    };

    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [deadlineAt, offset]);

  return remaining;
}
