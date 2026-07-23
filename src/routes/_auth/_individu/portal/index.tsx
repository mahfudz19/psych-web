import { createFileRoute, Link } from "@tanstack/react-router";
// Tambahkan useAuth jika Anda ingin menyapa pengguna dengan namanya
// import { useAuth } from "../../../../hooks/useAuth";

export const Route = createFileRoute("/_auth/_individu/portal/")({
  component: PortalDashboard,
});

export function PortalDashboard() {
  // const { user } = useAuth(); // (Opsional) Buka komentar jika hook tersedia

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* 1. HEADER & UCAPAN SELAMAT DATANG (Personal & Menenangkan) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-divider">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary-main/10 text-primary-main mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-main animate-pulse"></span>
            Portal Kandidat Aktif
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Selamat Datang! {/* Ganti dengan: Selamat Datang, {user?.name}! */}
          </h1>
          <p className="text-sm text-text-secondary mt-2 max-w-2xl leading-relaxed">
            Persiapkan diri Anda dalam lingkungan yang tenang dan bebas
            distraksi sebelum memulai rangkaian evaluasi psikologi hari ini.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KOLOM KIRI: TUGAS AKTIF & STATISTIK (Prioritas Utama) */}
        <div className="lg:col-span-2 space-y-6">
          {/* A. KARTU ASESMEN MENUNGGU (Call to Action Utama) */}
          <div className="p-1 rounded-3xl bg-linear-to-br from-primary-main via-primary-main/80 to-info-main shadow-lg">
            <div className="p-6 sm:p-8 rounded-[22px] bg-bg-paper relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-warning-main/10 text-warning-main uppercase tracking-wider">
                    Perlu Diselesaikan
                  </span>
                </div>
                <h2 className="text-xl font-bold text-text-primary">
                  Evaluasi Kepribadian DISC
                </h2>
                <p className="text-xs text-text-secondary mt-1.5 flex items-center gap-3">
                  <span>⏱️ Estimasi: 30 Menit</span>
                  <span>📋 24 Pertanyaan</span>
                </p>
              </div>

              <Link
                to="/test"
                className="relative z-10 w-full sm:w-auto text-center px-8 py-3.5 rounded-xl text-sm font-bold bg-primary-main text-primary-contrast shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Mulai Sekarang &rarr;
              </Link>

              {/* Ornamen Latar */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-primary-main/5 rounded-bl-full pointer-events-none"></div>
            </div>
          </div>

          {/* B. GRID KARTU MENU (Katalog & Riwayat) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/test"
              className="group p-6 rounded-3xl bg-bg-paper border border-divider hover:border-primary-main/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-bg-default border border-divider flex items-center justify-center text-xl mb-4 group-hover:bg-primary-main/10 group-hover:border-primary-main/20 transition-colors">
                  📚
                </div>
                <h3 className="text-base font-bold text-text-primary group-hover:text-primary-main transition-colors">
                  Katalog Tes Tersedia
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                  Jelajahi seluruh inventaris asesmen mandiri dan pilih tes yang
                  sesuai dengan kebutuhan Anda.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-2 text-[11px] font-bold text-primary-main uppercase tracking-wider">
                <span>Lihat Katalog</span>
                <span className="transform group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
            </Link>

            <Link
              to="/test-history"
              className="group p-6 rounded-3xl bg-bg-paper border border-divider hover:border-info-main/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-bg-default border border-divider flex items-center justify-center text-xl mb-4 group-hover:bg-info-main/10 group-hover:border-info-main/20 transition-colors">
                  📊
                </div>
                <h3 className="text-base font-bold text-text-primary group-hover:text-info-main transition-colors">
                  Riwayat & Laporan
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                  Tinjau kembali arsip evaluasi Anda dan unduh laporan psikogram
                  resmi.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-2 text-[11px] font-bold text-info-main uppercase tracking-wider">
                <span>Buka Riwayat</span>
                <span className="transform group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* KOLOM KANAN: PANEL SAMPING (Statistik & Informasi Ekstra) */}
        <div className="space-y-6">
          {/* Panel Statistik */}
          <div className="p-6 rounded-3xl bg-bg-paper border border-divider shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-divider pb-3">
              Rangkuman Aktivitas
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-success-main/10 text-success-main flex items-center justify-center text-sm">
                    ✓
                  </div>
                  <span className="text-sm font-semibold text-text-secondary">
                    Tes Selesai
                  </span>
                </div>
                <span className="text-lg font-black text-text-primary">4</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-warning-main/10 text-warning-main flex items-center justify-center text-sm">
                    ⏳
                  </div>
                  <span className="text-sm font-semibold text-text-secondary">
                    Tes Tertunda
                  </span>
                </div>
                <span className="text-lg font-black text-text-primary">1</span>
              </div>
            </div>
          </div>

          {/* Tips Persiapan (Memberikan Kesan Klinis yang Baik) */}
          <div className="p-6 rounded-3xl bg-bg-default border border-divider">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>💡</span> Tips Persiapan
            </h3>
            <ul className="space-y-3">
              <li className="text-xs text-text-secondary leading-relaxed flex items-start gap-2">
                <span className="text-primary-main mt-0.5">•</span>
                Pastikan koneksi internet Anda stabil sebelum memulai ujian.
              </li>
              <li className="text-xs text-text-secondary leading-relaxed flex items-start gap-2">
                <span className="text-primary-main mt-0.5">•</span>
                Kerjakan tes secara jujur, tidak ada jawaban benar atau salah
                dalam tes kepribadian.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
