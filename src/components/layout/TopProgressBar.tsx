import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function TopProgressBar() {
  // Mendeteksi apakah router sedang memuat halaman baru
  const isLoading = useRouterState({ select: (s) => s.status === "pending" });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isLoading) {
      setProgress(15); // Mulai dari 15% seketika

      // Berjalan palsu (fake progress) sampai 90%
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10; // Tambah persentase secara acak
        });
      }, 300);
    } else {
      // Saat loading selesai, penuhi sampai 100% lalu sembunyikan
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 400); // Tunggu animasi 100% selesai
      return () => clearTimeout(timeout);
    }

    return () => clearInterval(interval);
  }, [isLoading]);

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-99999 pointer-events-none">
      <div
        className="h-full bg-primary-main shadow-[0_0_10px_var(--color-primary-main)] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: isLoading ? "300ms" : "400ms",
        }}
      />
    </div>
  );
}
