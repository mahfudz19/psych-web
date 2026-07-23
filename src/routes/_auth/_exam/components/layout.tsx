import { Link, Outlet } from "@tanstack/react-router";

export default function ExamRootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-default text-text-primary selection:bg-primary-main/20">
      {/* HEADER KHUSUS UJIAN (Minimalis & Bebas Distraksi) */}
      <header className="h-16 bg-bg-paper border-b border-divider px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-sm font-extrabold tracking-tight text-primary-main">
            @psych-web{" "}
            <span className="text-xs font-normal text-text-secondary ml-2">
              | Sesi Asesmen
            </span>
          </span>
        </div>

        {/* Indikator Tengah: Countdown Timer / Progres (Placeholder) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-warning-main/10 text-warning-main text-xs font-bold border border-warning-main/20">
          <span>⏱️ Waktu Tersisa: 29:45</span>
        </div>

        {/* Aksi Keluar / Akhiri Sesi Darurat */}
        <div>
          <Link
            to="/portal"
            className="px-4 py-2 rounded-xl text-xs font-bold text-error-main bg-error-main/10 hover:bg-error-main/20 transition-colors"
            onClick={(e) => {
              if (
                !window.confirm(
                  "Apakah Anda yakin ingin keluar? Progres ujian yang belum dikirim mungkin akan hilang.",
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            Keluar Ujian
          </Link>
        </div>
      </header>

      {/* AREA UTAMA SOAL UJIAN */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
