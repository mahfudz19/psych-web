import { useCallback, useEffect, useRef, useState } from "react";
import { useSaveAnswers, useSubmitSection } from "../-api/exam.api";
import type {
  SaveAnswersRequest,
  SubmitSectionRequest,
} from "../-api/exam.api";
import type {
  AnswerMap,
  AnswerResponse,
  SaveResult,
  SectionRun,
} from "../-api/exam.types";
import {
  UNSUPPORTED_TYPES,
  formatClock,
  isAnswered,
  unwrap,
} from "../-api/exam.types";
import ItemView from "./ItemRenderer";
import { useCountdown } from "../-util/useCountdown";

interface Props {
  attemptId: string;
  testName: string;
  run: SectionRun;
  onFinished: () => void;
}

type SaveState = "idle" | "saving" | "saved" | "error";

interface ExampleLike {
  content?: {
    text?: string | null;
    images?: { label?: string; url?: string }[];
  };
  options?: { key?: string; label?: string | null }[];
  answer?: string[];
  explanation?: string | null;
}

function ExamplesBlock({ examples }: { examples: unknown[] }) {
  return (
    <div className="space-y-3">
      {examples.map((raw, i) => {
        const ex = raw as ExampleLike;
        return (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-divider bg-bg-default p-3 text-sm"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Contoh {i + 1}
            </p>
            {ex.content?.text && (
              <p className="text-text-primary">{ex.content.text}</p>
            )}
            {ex.content?.images && ex.content.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ex.content.images.map((img, idx) =>
                  img.url ? (
                    <img
                      key={idx}
                      src={img.url}
                      alt={`Gambar ${img.label ?? ""}`}
                      className="max-h-28 rounded-lg border border-divider bg-white object-contain"
                    />
                  ) : null,
                )}
              </div>
            )}
            {ex.options && ex.options.length > 0 && (
              <ul className="text-text-secondary">
                {ex.options.map((o, idx) => (
                  <li key={idx}>
                    {o.key}
                    {o.label ? `. ${o.label}` : ""}
                  </li>
                ))}
              </ul>
            )}
            {ex.answer && ex.answer.length > 0 && (
              <p className="font-semibold text-success-main">
                Jawaban: {ex.answer.join(", ")}
              </p>
            )}
            {ex.explanation && (
              <p className="text-xs text-text-secondary">{ex.explanation}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SectionPlayer(props: Props) {
  const { attemptId, testName, run, onFinished } = props;
  const { section, items } = run;
  const { mutateAsync: saveAsync } = useSaveAnswers();
  const { mutateAsync: submitAsync } = useSubmitSection();

  const [answers, setAnswers] = useState<AnswerMap>(() =>
    Object.fromEntries(run.answers.map((a) => [a.itemId, a.response])),
  );
  const [index, setIndex] = useState(0);
  const [serverTime, setServerTime] = useState<string | null>(
    section.serverTime,
  );
  const [deadlineAt, setDeadlineAt] = useState<string | null>(
    section.deadlineAt,
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [dirtyTick, setDirtyTick] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(
    (Boolean(section.instructions) || section.examples.length > 0) &&
      run.answers.length === 0,
  );

  const answersRef = useRef<AnswerMap>(answers);
  const dirtyRef = useRef<Set<string>>(new Set());
  const versionsRef = useRef<Record<string, number>>({});
  const revisionRef = useRef<number | undefined>(undefined);
  const savingRef = useRef(false);
  const submittingRef = useRef(false);
  const spentRef = useRef<Record<string, number>>({});
  const shownAtRef = useRef(Date.now());
  const currentIdRef = useRef<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    currentIdRef.current = items[index]?.id ?? null;
  }, [index, items]);

  const elapsedFor = (itemId: string): number => {
    const base = spentRef.current[itemId] ?? 0;
    return itemId === currentIdRef.current
      ? base + (Date.now() - shownAtRef.current)
      : base;
  };

  const buildAnswers = (ids: string[]) =>
    ids.map((itemId) => ({
      itemId,
      response: answersRef.current[itemId] ?? null,
      responseTimeMs: elapsedFor(itemId),
    }));

  const updateAnswer = (itemId: string, value: AnswerResponse | null) => {
    versionsRef.current[itemId] = (versionsRef.current[itemId] ?? 0) + 1;
    dirtyRef.current.add(itemId);
    answersRef.current = { ...answersRef.current, [itemId]: value };
    setAnswers(answersRef.current);
    setSaveState("idle");
    setDirtyTick((t) => t + 1);
  };

  const saveNow = useCallback(async () => {
    if (
      savingRef.current ||
      submittingRef.current ||
      dirtyRef.current.size === 0
    )
      return;
    savingRef.current = true;
    const ids = [...dirtyRef.current];
    const sentVersions = Object.fromEntries(
      ids.map((id) => [id, versionsRef.current[id] ?? 0]),
    );
    setSaveState("saving");
    try {
      const res = await saveAsync({
        attemptId,
        sectionId: section.id,
        payload: {
          answers: buildAnswers(ids),
          revision: revisionRef.current,
        } as SaveAnswersRequest,
      });
      const data = unwrap<SaveResult>(res);
      if (data) {
        if (typeof data.revision === "number")
          revisionRef.current = data.revision;
        if (data.serverTime) setServerTime(data.serverTime);
        if (data.deadlineAt) setDeadlineAt(data.deadlineAt);
      }
      // Hanya bersihkan soal yang tidak berubah lagi selama proses simpan.
      for (const id of ids) {
        if ((versionsRef.current[id] ?? 0) === sentVersions[id])
          dirtyRef.current.delete(id);
      }
      setSaveState(dirtyRef.current.size === 0 ? "saved" : "idle");
    } catch {
      setSaveState("error");
    } finally {
      savingRef.current = false;
    }
  }, [attemptId, section.id, saveAsync]);

  useEffect(() => {
    if (dirtyTick === 0) return;
    const t = setTimeout(() => void saveNow(), 1200);
    return () => clearTimeout(t);
  }, [dirtyTick, saveNow]);

  useEffect(() => {
    const id = setInterval(() => {
      if (dirtyRef.current.size > 0) void saveNow();
    }, 5000);
    return () => clearInterval(id);
  }, [saveNow]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void saveNow();
    };
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current.size > 0) e.preventDefault();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [saveNow]);

  const finishSection = async (auto: boolean) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    const ids = [...dirtyRef.current];
    try {
      await submitAsync({
        attemptId,
        sectionId: section.id,
        payload:
          ids.length > 0
            ? ({ answers: buildAnswers(ids) } as SubmitSectionRequest)
            : undefined,
      });
      dirtyRef.current.clear();
      onFinished();
    } catch {
      if (auto) {
        // Waktu habis: server mungkin sudah menutup subtes sendiri. Muat ulang status saja.
        onFinished();
      } else {
        submittingRef.current = false;
        setSubmitting(false);
        setSubmitError(
          "Subtes belum bisa diselesaikan. Periksa koneksi Anda lalu coba lagi.",
        );
      }
    }
  };

  const remaining = useCountdown(deadlineAt, serverTime, () => {
    setConfirmOpen(false);
    void finishSection(true);
  });
  const timeUp = remaining === 0;

  const forwardOnly = section.navigationPolicy === "FORWARD_ONLY";

  const goTo = (next: number) => {
    if (next < 0 || next >= items.length || next === index) return;
    if (forwardOnly && next !== index + 1) return;
    const leaving = items[index];
    if (leaving) {
      spentRef.current[leaving.id] =
        (spentRef.current[leaving.id] ?? 0) + (Date.now() - shownAtRef.current);
    }
    shownAtRef.current = Date.now();
    setIndex(next);
    void saveNow();
  };

  const answerable = items.filter((it) => !UNSUPPORTED_TYPES.includes(it.type));
  const answeredCount = answerable.filter((it) =>
    isAnswered(it, answers[it.id]),
  ).length;
  const unanswered = answerable.length - answeredCount;
  const item = items[index];
  const isLast = index === items.length - 1;

  const timerClass =
    remaining === null
      ? "text-text-secondary"
      : remaining <= 60
        ? "text-error-main animate-pulse"
        : remaining <= 300
          ? "text-warning-main"
          : "text-text-primary";

  const saveText =
    saveState === "saving"
      ? "Menyimpan..."
      : saveState === "error"
        ? "Gagal menyimpan, mencoba lagi"
        : dirtyRef.current.size > 0
          ? "Belum tersimpan"
          : saveState === "saved"
            ? "Tersimpan"
            : "";

  return (
    <>
      {/* BAR ATAS: nama subtes, status simpan, timer */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-4 rounded-2xl border border-divider bg-bg-paper/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-bold uppercase tracking-wider text-primary-main">
            {testName}
          </p>
          <h1 className="truncate text-base font-extrabold text-text-primary">
            {section.name}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {saveText && (
            <span
              className={`hidden text-[11px] sm:inline ${
                saveState === "error"
                  ? "text-error-main"
                  : "text-text-secondary"
              }`}
              aria-live="polite"
            >
              {saveText}
            </span>
          )}
          <div className="text-right" aria-live="off">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              {remaining === null ? "Waktu" : "Sisa waktu"}
            </p>
            <p className={`font-mono text-lg font-black ${timerClass}`}>
              {remaining === null ? "Bebas" : formatClock(remaining)}
            </p>
          </div>
        </div>
      </div>

      {(section.instructions || section.examples.length > 0) && (
        <div className="rounded-2xl border border-divider bg-bg-paper">
          <button
            type="button"
            onClick={() => setShowInstructions((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold text-text-primary"
            aria-expanded={showInstructions}
          >
            <span>Petunjuk pengerjaan</span>
            <span className="text-text-secondary">
              {showInstructions ? "▾" : "▸"}
            </span>
          </button>
          {showInstructions && (
            <div className="space-y-3 border-t border-divider px-4 py-3">
              {section.instructions && (
                <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                  {section.instructions}
                </p>
              )}
              {section.showExamplesFirst && section.examples.length > 0 && (
                <ExamplesBlock examples={section.examples} />
              )}
            </div>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="space-y-4 rounded-3xl border border-divider bg-bg-paper p-8 text-center">
          <p className="text-sm text-text-secondary">
            Subtes ini belum memiliki soal.
          </p>
          <button
            type="button"
            onClick={() => void finishSection(false)}
            disabled={submitting}
            className="rounded-xl bg-primary-main px-6 py-2.5 text-xs font-bold text-primary-contrast"
          >
            Lanjutkan
          </button>
        </div>
      ) : (
        <>
          {/* PROGRES */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-text-secondary">
              <span>
                Soal {index + 1} dari {items.length}
              </span>
              <span>{answeredCount} terjawab</span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-divider"
              role="progressbar"
              aria-valuenow={answeredCount}
              aria-valuemin={0}
              aria-valuemax={answerable.length}
              aria-label="Soal yang sudah terjawab"
            >
              <div
                className="h-full rounded-full bg-primary-main transition-all duration-300"
                style={{
                  width: `${answerable.length > 0 ? (answeredCount / answerable.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* SOAL */}
          <div className="rounded-3xl border border-divider bg-bg-paper p-6 shadow-sm sm:p-8">
            <ItemView
              key={item.id}
              item={item}
              displayNumber={index + 1}
              value={answers[item.id]}
              onChange={(v) => updateAnswer(item.id, v)}
              disabled={submitting}
            />
          </div>

          {/* NAVIGATOR NOMOR */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Navigasi soal
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((it, i) => {
                const done = isAnswered(it, answers[it.id]);
                const current = i === index;
                const locked = forwardOnly && !current;
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => goTo(i)}
                    disabled={locked}
                    aria-label={`Soal ${i + 1}${done ? ", sudah dijawab" : ", belum dijawab"}`}
                    aria-current={current ? "step" : undefined}
                    className={`h-9 w-9 rounded-lg border text-xs font-bold transition-all ${
                      current
                        ? "border-primary-main bg-primary-main text-primary-contrast"
                        : done
                          ? "border-success-main/40 bg-success-main/10 text-success-main"
                          : "border-divider bg-bg-default text-text-secondary"
                    } ${locked ? "cursor-not-allowed opacity-50" : "hover:border-primary-main/60"}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            {forwardOnly && (
              <p className="text-[11px] text-text-secondary">
                Pada subtes ini Anda hanya bisa maju. Soal yang sudah dilewati
                tidak bisa dibuka lagi.
              </p>
            )}
          </div>

          {/* TOMBOL */}
          <div className="flex items-center justify-between border-t border-divider pt-4">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0 || forwardOnly || submitting}
              className="rounded-xl bg-divider/10 px-5 py-2.5 text-xs font-bold text-text-primary disabled:cursor-not-allowed disabled:text-text-disabled"
            >
              Sebelumnya
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={submitting}
                className="rounded-xl bg-primary-main px-6 py-2.5 text-xs font-bold text-primary-contrast shadow-sm transition-all hover:opacity-90"
              >
                Selesaikan Subtes
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                disabled={submitting}
                className="rounded-xl bg-primary-main px-6 py-2.5 text-xs font-bold text-primary-contrast shadow-sm transition-all hover:opacity-90"
              >
                Selanjutnya &rarr;
              </button>
            )}
          </div>

          {/* Selesaikan lebih awal dari soal mana pun (hanya jika boleh bebas bernavigasi) */}
          {!isLast && !forwardOnly && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={submitting}
                className="text-xs font-semibold text-text-secondary underline-offset-2 hover:text-primary-main hover:underline"
              >
                Selesaikan subtes sekarang
              </button>
            </div>
          )}
        </>
      )}

      {confirmOpen && !timeUp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="w-full max-w-md space-y-4 rounded-3xl bg-bg-paper p-6 shadow-xl">
            <h2
              id="confirm-title"
              className="text-lg font-bold text-text-primary"
            >
              Selesaikan subtes ini?
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              {unanswered > 0
                ? `Masih ada ${unanswered} soal yang belum terjawab. `
                : "Semua soal sudah terjawab. "}
              Setelah diselesaikan, subtes ini tidak bisa dibuka lagi.
            </p>
            {submitError && (
              <p className="text-sm text-error-main">{submitError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
                className="rounded-xl bg-divider/10 px-5 py-2.5 text-xs font-bold text-text-primary"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => void finishSection(false)}
                disabled={submitting}
                className="rounded-xl bg-primary-main px-5 py-2.5 text-xs font-bold text-primary-contrast"
              >
                {submitting ? "Menyimpan..." : "Ya, selesaikan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {timeUp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="timeup-title"
        >
          <div className="w-full max-w-sm space-y-2 rounded-3xl bg-bg-paper p-6 text-center shadow-xl">
            <h2
              id="timeup-title"
              className="text-lg font-bold text-text-primary"
            >
              Waktu subtes habis
            </h2>
            <p className="text-sm text-text-secondary">
              Jawaban Anda sedang disimpan. Mohon tunggu sebentar.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
