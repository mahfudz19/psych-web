import { ArrowRight } from "lucide-react";
import type { AttemptSection, AttemptState } from "../-api/exam.types";
import { formatLimit } from "../-api/exam.types";
import Button from "../../../../components/ui/Button";

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

import { AlertCircle, Check, ChevronRight, Clock } from "lucide-react";
import { useRef } from "react";

interface SubtestListProps {
  attempt: AttemptState;
  nextSection: AttemptSection | null;
  resuming: AttemptSection | null;
}

const SubtestList = ({ attempt, nextSection, resuming }: SubtestListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sections = [...attempt.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="relative w-full">
      {/* EFFECT BLUR GRADIENT KIRI */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 bg-linear-to-r from-bg-default to-transparent" />

      {/* EFFECT BLUR GRADIENT KANAN */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 bg-linear-to-l from-bg-default to-transparent" />

      {/* HORIZONTAL STEPPER CONTAINER */}
      <div
        ref={scrollRef}
        className="no-scrollbar flex items-start gap-4 overflow-x-auto px-3 py-1 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {sections.map((s, index) => {
          const isCurrent =
            nextSection?.sectionId === s.sectionId ||
            resuming?.sectionId === s.sectionId;
          const isCompleted = s.status === "COMPLETED";
          const isExpired = s.status === "EXPIRED";
          const isInProgress = s.status === "IN_PROGRESS";

          return (
            <div
              key={s.sectionId}
              className="flex shrink-0 items-start snap-center"
            >
              {/* STEP CARD ITEM */}
              <div
                className={`relative flex w-64 flex-col gap-3 rounded-2xl border p-4 transition-all duration-200 ${
                  isCurrent
                    ? "border-primary-main bg-bg-paper shadow-md shadow-primary-main/10 ring-2 ring-primary-main/20"
                    : isCompleted
                      ? "border-divider bg-bg-paper/60 opacity-90"
                      : isExpired
                        ? "border-error-main/30 bg-error-main/5"
                        : "border-divider bg-bg-paper/40"
                }`}
              >
                {/* TOP ROW: NUMBER BADGE & STATUS */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* NODE ICON / NUMBER */}
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-transform ${
                        isCompleted
                          ? "bg-success-main text-white"
                          : isCurrent
                            ? "bg-primary-main text-primary-contrast shadow-sm scale-110"
                            : isExpired
                              ? "bg-error-main text-white"
                              : "bg-divider/60 text-text-secondary"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={14} strokeWidth={3} />
                      ) : isExpired ? (
                        <AlertCircle size={14} />
                      ) : (
                        s.order
                      )}
                    </div>

                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-disabled">
                      Subtes {s.order}
                    </span>
                  </div>

                  {/* ACTIVE INDICATOR BADGE */}
                  {isCurrent && (
                    <span className="flex items-center gap-1 rounded-full bg-primary-main/10 px-2 py-0.5 text-[10px] font-bold text-primary-main">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-main" />
                      {isInProgress ? "Berjalan" : "Berikutnya"}
                    </span>
                  )}
                </div>

                {/* MIDDLE ROW: TITLE & METRICS */}
                <div className="space-y-1">
                  <h4
                    className={`line-clamp-1 text-sm font-bold ${
                      isCurrent ? "text-primary-main" : "text-text-primary"
                    }`}
                    title={s.name}
                  >
                    {s.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                    <span>{s.itemCount} Soal</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {formatLimit(s.timeLimitSeconds)}
                    </span>
                  </div>
                </div>

                {/* BOTTOM ROW: POLICY BADGE (IF ANY) */}
                {s.navigationPolicy === "FORWARD_ONLY" && (
                  <div className="w-fit rounded-md bg-warning-main/10 px-1.5 py-0.5 text-[10px] font-medium text-warning-main">
                    Searah (Forward Only)
                  </div>
                )}
              </div>

              {/* CONNECTOR ARROW / LINE BETWEEN STEPS */}
              {index < sections.length - 1 && (
                <div className="flex h-full items-center justify-center px-1 pt-8 text-text-disabled/40">
                  <ChevronRight size={18} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
  return (
    <div>
      {/* DAFTAR SUBTES */}
      <SubtestList
        attempt={attempt}
        nextSection={nextSection}
        resuming={resuming}
      />

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
              <Button
                type="button"
                onClick={() => onStart(resuming.sectionId)}
                disabled={starting}
                className="shrink-0 font-bold hover:underline"
              >
                Coba lagi
              </Button>
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

          <Button
            type="button"
            onClick={() => onStart(nextSection.sectionId)}
            disabled={starting}
            loading={starting}
            endIcon={<ArrowRight size={16} />}
          >
            Mulai Subtes
          </Button>
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
          <Button
            type="button"
            onClick={onFinish}
            disabled={finishing}
            loading={finishing}
          >
            {finishing ? "Menyelesaikan..." : "Selesaikan Tes"}
          </Button>
        </div>
      )}
    </div>
  );
}
