import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/_exam/exam/$testId/")({
  component: ExamSessionPage,
});

function ExamSessionPage() {
  const { testId } = Route.useParams();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* KARTU KONTROL SOAL */}
      <div className="p-8 rounded-3xl bg-bg-paper border border-divider shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-divider pb-4">
          <div>
            <span className="text-xs font-bold text-primary-main uppercase tracking-wider">
              Sesi Pengerjaan Aktif
            </span>
            <h1 className="text-xl font-extrabold text-text-primary mt-1 uppercase">
              ID Tes: {testId}
            </h1>
          </div>
          <span className="text-xs font-semibold text-text-secondary">
            Soal 1 dari 25
          </span>
        </div>

        {/* Simulasi Pertanyaan Psikotes */}
        <div className="space-y-4 py-4">
          <p className="text-base font-medium text-text-primary leading-relaxed">
            Pilihlah pernyataan di bawah ini yang paling mencerminkan
            kecenderungan diri Anda dalam menghadapi situasi tekanan kerja
            kelompok:
          </p>

          <div className="space-y-3">
            {[
              "Saya cenderung mengambil alih kepemimpinan tim.",
              "Saya lebih suka mendengarkan dan mendukung anggota lain.",
              "Saya fokus merinci tugas secara sistematis.",
            ].map((opt, idx) => (
              <label
                key={idx}
                className="flex items-center gap-3 p-4 rounded-2xl border border-divider hover:border-primary-main/50 bg-bg-default cursor-pointer transition-all"
              >
                <input
                  type="radio"
                  name="answer"
                  className="text-primary-main focus:ring-primary-main"
                />
                <span className="text-sm font-medium text-text-primary">
                  {opt}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigasi Soal Berikutnya */}
        <div className="flex items-center justify-between pt-4 border-t border-divider">
          <button
            disabled
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-text-disabled bg-divider/10 cursor-not-allowed"
          >
            Sebelumnya
          </button>

          <Link
            to="/portal"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary-main text-primary-contrast hover:opacity-90 transition-all shadow-sm"
          >
            Selanjutnya &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
