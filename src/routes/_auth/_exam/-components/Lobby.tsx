import type {
  AttemptSection,
  AttemptState,
  SectionStatus,
} from "../-api/exam.types";
import { formatLimit } from "../-api/exam.types";

const STATUS_LABEL: Record<SectionStatus, string> = {
  NOT_STARTED: "Belum dimulai",
  IN_PROGRESS: "Sedang berjalan",
  COMPLETED: "Selesai",
  EXPIRED: "Waktu habis",
};

const STATUS_STYLE: Record<SectionStatus, string> = {
  NOT_STARTED: "bg-divider text-text-secondary",
  IN_PROGRESS: "bg-warning-main/10 text-warning-main",
  COMPLETED: "bg-success-main/10 text-success-main",
  EXPIRED: "bg-error-main/10 text-error-main",
};

interface LobbyProps {
  attempt: AttemptState;
  nextSection: AttemptSection | null;
  allDone: boolean;
  resuming: AttemptSection | null;
  starting: boolean;
  startError: string | null;
  onStart: (sectionId: string) => void;
  finishing: boolean;
  finishError: string | null;
  onFinish: () => void;
}

export default function Lobby({
  attempt,
  nextSection,
  allDone,
  resuming,
  starting,
  startError,
  onStart,
  finishing,
  finishError,
  onFinish,
}: LobbyProps) {
  const sections = [...attempt.sections].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* DAFTAR SUBTES */}
      <ol className="space-y-2">
        {sections.map((s) => (
          <li
            key={s.sectionId}
            className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${
              nextSection?.sectionId === s.sectionId ||
              resuming?.sectionId === s.sectionId
                ? "border-primary-main/50 bg-primary-main/5"
                : "border-divider bg-bg-paper"
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-divider/40 text-xs font-bold text-text-primary">
                {s.order}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-text-primary">
                  {s.name}
                </p>
                <p className="text-[11px] text-text-secondary">
                  {s.itemCount} soal · {formatLimit(s.timeLimitSeconds)}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[s.status]}`}
            >
              {STATUS_LABEL[s.status]}
            </span>
          </li>
        ))}
      </ol>

      {/* MEMULIHKAN SUBTES YANG SEDANG BERJALAN */}
      {resuming && (
        <div className="space-y-3 rounded-3xl border border-divider bg-bg-paper p-6">
          <p className="text-sm font-bold text-text-primary">
            Memulihkan subtes “{resuming.name}”...
          </p>
          <p className="text-xs leading-relaxed text-text-secondary">
            Subtes ini sedang berjalan. Waktunya tetap dihitung sejak Anda
            memulainya.
          </p>
          {startError && (
            <div className="flex items-center justify-between gap-3 text-xs text-error-main">
              <span>{startError}</span>
              <button
                type="button"
                onClick={() => onStart(resuming.sectionId)}
                disabled={starting}
                className="shrink-0 font-bold hover:underline"
              >
                Coba lagi
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUBTES BERIKUTNYA */}
      {!resuming && nextSection && (
        <div className="space-y-4 rounded-3xl border border-divider bg-bg-paper p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Subtes berikutnya
            </p>
            <h2 className="mt-1 text-lg font-bold text-text-primary">
              {nextSection.name}
            </h2>
          </div>

          {nextSection.instructions ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">
              {nextSection.instructions}
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-text-secondary">
              Petunjuk subtes ini ditampilkan di bagian atas layar setelah Anda
              memulai.
            </p>
          )}

          <ul className="space-y-1.5 text-xs text-text-secondary">
            <li>📝 {nextSection.itemCount} soal</li>
            <li>⏱️ {formatLimit(nextSection.timeLimitSeconds)}</li>
            {nextSection.navigationPolicy === "FORWARD_ONLY" && (
              <li>➡️ Anda tidak dapat kembali ke soal sebelumnya.</li>
            )}
          </ul>

          {nextSection.timeLimitSeconds ? (
            <div className="rounded-2xl border border-warning-main/30 bg-warning-main/5 p-4 text-xs leading-relaxed text-text-primary">
              <span className="font-bold">Perhatian:</span> waktu mulai berjalan
              saat Anda menekan tombol di bawah, dan tidak berhenti walau
              halaman ditutup. Pastikan Anda siap dan koneksi stabil.
            </div>
          ) : (
            <p className="text-xs text-text-secondary">
              Subtes ini tidak dibatasi waktu. Jawaban Anda tersimpan otomatis.
            </p>
          )}

          {startError && (
            <p className="text-sm text-error-main">{startError}</p>
          )}

          <button
            type="button"
            onClick={() => onStart(nextSection.sectionId)}
            disabled={starting}
            className="w-full rounded-xl bg-primary-main px-8 py-3.5 text-sm font-bold text-primary-contrast shadow-md transition-all hover:opacity-90 disabled:opacity-60 sm:w-auto"
          >
            {starting ? "Memulai..." : "Mulai Subtes →"}
          </button>
        </div>
      )}

      {/* SEMUA SUBTES SELESAI */}
      {!resuming && !nextSection && allDone && (
        <div className="space-y-4 rounded-3xl border border-divider bg-bg-paper p-6 text-center shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-text-primary">
            Semua subtes sudah dikerjakan
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-text-secondary">
            Tekan tombol di bawah untuk mengirim jawaban Anda dan menyelesaikan
            tes.
          </p>
          {finishError && (
            <p className="text-sm text-error-main">{finishError}</p>
          )}
          <button
            type="button"
            onClick={onFinish}
            disabled={finishing}
            className="rounded-xl bg-primary-main px-8 py-3.5 text-sm font-bold text-primary-contrast shadow-md transition-all hover:opacity-90 disabled:opacity-60"
          >
            {finishing ? "Menyelesaikan..." : "Selesaikan Tes"}
          </button>
        </div>
      )}
    </>
  );
}
