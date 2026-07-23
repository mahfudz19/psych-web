import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/_individu/test/")({
  component: TestCatalogPage,
});

export function TestCatalogPage() {
  // Simulasi data tes yang tersedia (Nanti bisa dihubungkan ke API / TanStack Query)
  const availableTests = [
    {
      id: "disc-personality",
      title: "Evaluasi Kepribadian DISC",
      category: "Psikologi Kerja",
      duration: "30 Menit",
      questionsCount: 24,
      status: "Wajib / Ditugaskan",
      isMandatory: true,
    },
    {
      id: "cognitive-logic",
      title: "Tes Kemampuan Kognitif & Logika",
      category: "Kecerdasan Umum",
      duration: "45 Menit",
      questionsCount: 40,
      status: "Tersedia",
      isMandatory: false,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER HALAMAN KATALOG */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-divider">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Katalog & Penugasan Tes
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Pilih asesmen yang ingin Anda kerjakan atau selesaikan daftar tes
            wajib dari institusi Anda.
          </p>
        </div>
        <Link
          to="/portal"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-text-secondary bg-divider/20 hover:bg-divider/40 transition-colors w-fit"
        >
          &larr; Kembali ke Portal
        </Link>
      </div>

      {/* DAFTAR KARTU TES */}
      <div className="grid grid-cols-1 gap-4">
        {availableTests.map((test) => (
          <div
            key={test.id}
            className="p-6 rounded-3xl bg-bg-paper border border-divider hover:border-primary-main/50 transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-main/10 text-primary-main">
                  {test.category}
                </span>
                {test.isMandatory && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-error-main/10 text-error-main">
                    {test.status}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                {test.title}
              </h3>
              <div className="flex items-center gap-4 text-xs text-text-secondary font-medium">
                <span>⏱️ {test.duration}</span>
                <span>📝 {test.questionsCount} Soal Evaluasi</span>
              </div>
            </div>

            {/* Tombol Aksi Menuju Sesi Ujian / Exam Route */}
            <div className="flex items-center gap-3">
              <Link
                to="/exam/$testId"
                params={{ testId: test.id }}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold bg-primary-main text-primary-contrast hover:opacity-90 shadow-sm transition-all"
              >
                Mulai Tes Sekarang
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
