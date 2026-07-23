import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/_individu/test-history/")({
  component: TestHistoryPage,
});

export function TestHistoryPage() {
  // Simulasi data riwayat tes (Nanti dapat dihubungkan ke TanStack Query / API)
  const historyItems = [
    {
      id: "hist-01",
      title: "Evaluasi Kepribadian DISC",
      category: "Psikologi Kerja",
      completedDate: "20 Mei 2026",
      scoreSummary: "Tipe Dominant-Steady (DS)",
      status: "Selesai",
      reportAvailable: true,
    },
    {
      id: "hist-02",
      title: "Tes Kemampuan Kognitif & Logika",
      category: "Kecerdasan Umum",
      completedDate: "12 April 2026",
      scoreSummary: "Skor IQ Estimasi: 115 (Above Average)",
      status: "Selesai",
      reportAvailable: true,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER HALAMAN */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-divider">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Riwayat & Hasil Asesmen
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Arsip lengkap seluruh tes psikologi yang telah Anda selesaikan
            beserta ringkasan hasilnya.
          </p>
        </div>
        <Link
          to="/portal"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-text-secondary bg-divider/20 hover:bg-divider/40 transition-colors w-fit"
        >
          &larr; Kembali ke Portal
        </Link>
      </div>

      {/* DAFTAR RIWAYAT TES */}
      {historyItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-bg-paper border border-divider hover:border-info-main/40 transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-info-main/10 text-info-main">
                    {item.category}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success-main/10 text-success-main">
                    {item.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-text-primary">
                  {item.title}
                </h3>

                <p className="text-sm font-semibold text-text-secondary">
                  Hasil:{" "}
                  <span className="text-text-primary">{item.scoreSummary}</span>
                </p>

                <p className="text-xs text-text-disabled">
                  Diselesaikan pada: {item.completedDate}
                </p>
              </div>

              {/* Tombol Unduh / Lihat Laporan */}
              <div className="flex items-center gap-3">
                {item.reportAvailable ? (
                  <button
                    onClick={() => alert("Mengunduh laporan psikogram...")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-bg-default border border-divider text-text-primary hover:bg-divider/20 transition-all shadow-sm"
                  >
                    <span>📄 Unduh Laporan</span>
                  </button>
                ) : (
                  <span className="text-xs font-medium text-text-disabled italic">
                    Laporan sedang divalidasi
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Kondisi Kosong (Empty State) */
        <div className="text-center py-16 px-4 rounded-3xl bg-bg-paper border border-divider">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-divider/10 text-text-secondary flex items-center justify-center text-2xl mb-4">
            📭
          </div>
          <h3 className="text-base font-bold text-text-primary">
            Belum Ada Riwayat Tes
          </h3>
          <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
            Anda belum menyelesaikan asesmen apapun. Mulai kerjakan tes yang
            tersedia dari katalog Anda.
          </p>
          <Link
            to="/test"
            className="inline-block mt-6 px-6 py-2.5 rounded-xl text-xs font-bold bg-primary-main text-primary-contrast shadow-sm"
          >
            Lihat Katalog Tes
          </Link>
        </div>
      )}
    </div>
  );
}
