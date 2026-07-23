import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/_individu/portal/")({
  component: PortalDashboard,
});

export function PortalDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. BANNER UTAMA (Clinical-Modern Hero Card) */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-linear-to-br from-primary-main/10 via-primary-main/5 to-transparent border border-primary-main/20 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-main/10 text-primary-main mb-3">
            Portal Peserta Individu
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Selamat Datang kembali!
          </h1>
          <p className="text-sm sm:text-base text-text-secondary mt-2 leading-relaxed">
            Siapkan diri Anda dalam lingkungan yang tenang dan kondusif sebelum
            memulai rangkaian evaluasi psikologi hari ini.
          </p>
        </div>

        {/* Dekorasi Ilustrasi Abstrak Lembut di Sudut Kanan */}
        <div className="absolute -right-5 -bottom-7.5 w-48 h-48 bg-primary-main/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* 2. STATISTIK RINGKAS (Opsional untuk memotivasi peserta) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-bg-paper border border-divider shadow-sm">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Tes Tersedia
          </p>
          <p className="text-2xl font-extrabold text-text-primary mt-1">
            1{" "}
            <span className="text-xs font-normal text-text-secondary">
              Aktif
            </span>
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-bg-paper border border-divider shadow-sm">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Selesai
          </p>
          <p className="text-2xl font-extrabold text-success-main mt-1">4</p>
        </div>
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-bg-paper border border-divider shadow-sm flex items-center justify-between sm:block">
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Status Akun
            </p>
            <p className="text-sm font-bold text-success-main mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success-main animate-pulse"></span>
              Terverifikasi
            </p>
          </div>
        </div>
      </div>

      {/* 3. GRID MENU UTAMA (Action Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kartu 1: Mulai & Pilih Tes */}
        <Link
          to="/test"
          className="group relative p-6 sm:p-8 rounded-3xl bg-bg-paper border border-divider hover:border-primary-main/60 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-primary-main/10 text-primary-main flex items-center justify-center text-xl mb-5 group-hover:scale-110 group-hover:bg-primary-main group-hover:text-primary-contrast transition-all duration-300 shadow-sm">
              📋
            </div>
            <h3 className="text-lg font-bold text-text-primary group-hover:text-primary-main transition-colors">
              Mulai & Pilih Tes
            </h3>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              Jelajahi inventaris tes mandiri yang tersedia atau selesaikan
              penugasan asesmen psikologi Anda.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm font-bold text-primary-main">
            <span>Akses Katalog</span>
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>

        {/* Kartu 2: Riwayat & Hasil */}
        <Link
          to="/test-history"
          className="group relative p-6 sm:p-8 rounded-3xl bg-bg-paper border border-divider hover:border-info-main/60 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-info-main/10 text-info-main flex items-center justify-center text-xl mb-5 group-hover:scale-110 group-hover:bg-info-main group-hover:text-white transition-all duration-300 shadow-sm">
              📊
            </div>
            <h3 className="text-lg font-bold text-text-primary group-hover:text-info-main transition-colors">
              Riwayat & Hasil Asesmen
            </h3>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              Tinjau kembali arsip evaluasi yang telah tuntas dikerjakan dan
              lihat rangkuman laporan psikogram Anda.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm font-bold text-info-main">
            <span>Buka Riwayat</span>
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
}
