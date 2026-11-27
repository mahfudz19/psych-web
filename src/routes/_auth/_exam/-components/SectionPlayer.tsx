// saat waktu habis ui/ux langsung berpindah section, user tidak sempat melihat apa yang terjadi termasuk modal nya hanya muncul di bawa sedetik lalu pindah ke section berikutnya
// tidak boleh Menggunakan bantuan luar / tab lain: Secara aturan tes, peserta tidak boleh membuka kamus, search engine, atau berpindah tab (jika kamu menerapkan anti-cheat seperti deteksi tab switch atau fullscreen mode).
// tidak boleh copy paste
// UI harusnya berpindah ke item yang belum di kerjakan (saat ini jika di refresh UI masih tetap di item 1 walaupun item tersebut sudah di kerjakan)
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  useSaveAnswers,
  useStartSection,
  useSubmitSection,
} from "../-api/exam.api";
import type {
  SaveAnswersRequest,
  SubmitSectionRequest,
} from "../-api/exam.api";
import type {
  AnswerMap,
  AnswerResponse,
  ExamItem,
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
import type { TestExample } from "../../_organization/_admin/test-management/-api/test-definitions.type";
import type { WordListContent } from "../../_organization/_admin/test-management/$testId/-components/SectionForm";

interface SectionPlayerProps {
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
  answer?: string[] | string;
  explanation?: string | null;
}

/* ============================================================================
 * HOOK LOKAL: Mengelola jawaban, autosave, tracking waktu, & submit subtes
 * ========================================================================== */
function useSectionSession(
  attemptId: string,
  run: SectionRun,
  onFinished: () => void,
) {
  const { section, items } = run;
  const { mutateAsync: saveAsync } = useSaveAnswers();
  const { mutateAsync: submitAsync } = useSubmitSection();

  const [answers, setAnswers] = useState<AnswerMap>(() =>
    Object.fromEntries(run.answers.map((a) => [a.itemId, a.response])),
  );
  const [index, setIndex] = useState(() => {
    const initialMap = Object.fromEntries(
      run.answers.map((a) => [a.itemId, a.response]),
    );
    const firstUnanswered = items.findIndex(
      (it) => !isAnswered(it, initialMap[it.id]),
    );
    return firstUnanswered >= 0 ? firstUnanswered : 0;
  });
  const [serverTime, setServerTime] = useState<string | null>(
    section.serverTime,
  );
  const [deadlineAt, setDeadlineAt] = useState<string | null>(
    section.deadlineAt,
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [dirtyTick, setDirtyTick] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const answersRef = useRef<AnswerMap>(answers);
  const dirtyRef = useRef<Set<string>>(new Set());
  const versionsRef = useRef<Record<string, number>>({});
  const revisionRef = useRef<number | undefined>(undefined);
  const savingRef = useRef(false);
  const submittingRef = useRef(false);
  const spentRef = useRef<Record<string, number>>({});
  const shownAtRef = useRef(Date.now());
  const currentIdRef = useRef<string | null>(items[0]?.id ?? null);

  const forwardOnly = section.navigationPolicy === "FORWARD_ONLY";

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
    ) {
      return;
    }

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
        if ((versionsRef.current[id] ?? 0) === sentVersions[id]) {
          dirtyRef.current.delete(id);
        }
      }
      setSaveState(dirtyRef.current.size === 0 ? "saved" : "idle");
    } catch {
      setSaveState("error");
    } finally {
      savingRef.current = false;
    }
  }, [attemptId, section.id, saveAsync]);

  // Debounce autosave
  useEffect(() => {
    if (dirtyTick === 0) return;
    const t = setTimeout(() => void saveNow(), 1200);
    return () => clearTimeout(t);
  }, [dirtyTick, saveNow]);

  // Periodic autosave
  useEffect(() => {
    const id = setInterval(() => {
      if (dirtyRef.current.size > 0) void saveNow();
    }, 5000);
    return () => clearInterval(id);
  }, [saveNow]);

  // Save saat tab disembunyikan / cegah tutup tab saat masih ada data dirty
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
    window.scrollTo({ top: 0, behavior: "smooth" });
    void saveNow();
  };

  return {
    answers,
    index,
    serverTime,
    deadlineAt,
    saveState,
    hasUnsaved: dirtyRef.current.size > 0,
    submitting,
    submitError,
    forwardOnly,
    updateAnswer,
    finishSection,
    goTo,
  };
}

function useCountdown(
  deadlineAt: string | null | undefined,
  serverTime: string | null | undefined,
  onZero?: () => void,
): number | null {
  const [offset, setOffset] = useState<number>(() => {
    const t = serverTime ? Date.parse(serverTime) : NaN;
    return Number.isNaN(t) ? 0 : t - Date.now();
  });
  const [remaining, setRemaining] = useState<number | null>(null);
  const firedRef = useRef(false);
  const onZeroRef = useRef(onZero);

  useEffect(() => {
    onZeroRef.current = onZero;
  }, [onZero]);

  // Sinkronkan ulang selisih jam setiap ada serverTime baru.
  useEffect(() => {
    const t = serverTime ? Date.parse(serverTime) : NaN;
    if (!Number.isNaN(t)) setOffset(t - Date.now());
  }, [serverTime]);

  useEffect(() => {
    const deadline = deadlineAt ? Date.parse(deadlineAt) : NaN;
    if (Number.isNaN(deadline)) {
      setRemaining(null);
      return;
    }

    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((deadline - (Date.now() + offset)) / 1000),
      );
      setRemaining(left);
      if (left === 0 && !firedRef.current) {
        firedRef.current = true;
        onZeroRef.current?.();
      }
    };

    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [deadlineAt, offset]);

  return remaining;
}

function classAndText(
  saveState: SaveState,
  hasUnsaved: boolean,
  remaining: number | null,
) {
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
        : hasUnsaved
          ? "Belum tersimpan"
          : saveState === "saved"
            ? "Tersimpan"
            : "";
  return { timerClass, saveText };
}

/* ============================================================================
 * SUB-KOMPONEN INTERNAL
 * ========================================================================== */

const TimeCount = (props: {
  testName: string;
  sectionName: string;
  saveState: SaveState;
  hasUnsaved: boolean;
  answerable: ExamItem[];
  answeredCount: number;
  confirmOpen: boolean;
  setConfirmOpen: Dispatch<SetStateAction<boolean>>;
  session: {
    answers: AnswerMap;
    index: number;
    serverTime: string | null;
    deadlineAt: string | null;
    saveState: SaveState;
    hasUnsaved: boolean;
    submitting: boolean;
    submitError: string | null;
    forwardOnly: boolean;
    updateAnswer: (itemId: string, value: AnswerResponse | null) => void;
    finishSection: (auto: boolean) => Promise<void>;
    goTo: (next: number) => void;
  };
  requireAllAnswered?: boolean;
  onJumpToUnanswered?: () => void;
}) => {
  const {
    testName,
    sectionName,
    saveState,
    hasUnsaved,
    session,
    confirmOpen,
    setConfirmOpen,
    answerable,
    answeredCount,
    requireAllAnswered,
    onJumpToUnanswered,
  } = props;

  const remaining = useCountdown(session.deadlineAt, session.serverTime, () => {
    setConfirmOpen(false);
    void session.finishSection(true);
  });
  const timeUp = remaining === 0;

  const { saveText, timerClass } = classAndText(
    saveState,
    hasUnsaved,
    remaining,
  );

  const unanswered = answerable.length - answeredCount;

  return (
    <>
      <div className="sticky top-0 z-20 flex items-center justify-between gap-4 rounded-2xl border border-divider bg-bg-paper/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-bold uppercase tracking-wider text-primary-main">
            {testName}
          </p>
          <h1 className="truncate text-base font-extrabold text-text-primary">
            {sectionName}
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

      {/* MODAL KONFIRMASI SELESAI */}
      {confirmOpen && !timeUp && (
        <ConfirmSubmitModal
          unanswered={unanswered}
          submitting={session.submitting}
          submitError={session.submitError}
          requireAllAnswered={requireAllAnswered}
          onJumpToUnanswered={onJumpToUnanswered}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => void session.finishSection(false)}
        />
      )}

      {/* MODAL WAKTU HABIS */}
      {timeUp && <TimeUpModal />}
    </>
  );
};

const ExamplesBlock = ({ examples }: { examples: TestExample[] }) => (
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
              Jawaban:{" "}
              {Array.isArray(ex.answer) ? ex.answer?.join(", ") : ex.answer}
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

const InstructionsAccordion = (props: {
  instructions: string | null;
  examples: TestExample[];
  showExamplesFirst: boolean;
}) => {
  const { instructions, examples, showExamplesFirst } = props;
  const [open, setOpen] = useState(false);

  if (!instructions && examples.length === 0) return null;

  return (
    <div className="rounded-2xl border border-divider bg-bg-paper">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold text-text-primary"
        aria-expanded={open}
      >
        <span>Petunjuk pengerjaan</span>
        <span className="text-text-secondary">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-divider px-4 py-3">
          {instructions && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">
              {instructions}
            </p>
          )}
          {showExamplesFirst && examples.length > 0 && (
            <ExamplesBlock examples={examples} />
          )}
        </div>
      )}
    </div>
  );
};

const ProgressBar = (props: {
  currentIndex: number;
  totalItems: number;
  answeredCount: number;
  answerableCount: number;
}) => {
  const { currentIndex, totalItems, answeredCount, answerableCount } = props;
  const percentage =
    answerableCount > 0 ? (answeredCount / answerableCount) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-semibold text-text-secondary">
        <span>
          Soal {currentIndex + 1} dari {totalItems}
        </span>
        <span>{answeredCount} terjawab</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-divider"
        role="progressbar"
        aria-valuenow={answeredCount}
        aria-valuemin={0}
        aria-valuemax={answerableCount}
        aria-label="Soal yang sudah terjawab"
      >
        <div
          className="h-full rounded-full bg-primary-main transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const QuestionNavigator = (props: {
  items: SectionRun["items"];
  answers: AnswerMap;
  currentIndex: number;
  forwardOnly: boolean;
  onSelect: (index: number) => void;
}) => {
  const { items, answers, currentIndex, forwardOnly, onSelect } = props;
  const [filter, setFilter] = useState<"all" | "unanswered">("all");
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeBtnRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [currentIndex]);

  const unansweredIndices = items
    .map((it, idx) => (!isAnswered(it, answers[it.id]) ? idx : null))
    .filter((idx): idx is number => idx !== null);

  const displayed =
    filter === "all"
      ? items.map((it, i) => ({ it, i }))
      : items
          .map((it, i) => ({ it, i }))
          .filter(({ it }) => !isAnswered(it, answers[it.id]));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-divider pb-2">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Navigasi Soal
          </p>
          {!forwardOnly && items.length > 20 && (
            <div className="inline-flex rounded-lg border border-divider bg-bg-default p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-md px-2.5 py-0.5 font-semibold transition-colors ${
                  filter === "all"
                    ? "bg-primary-main text-primary-contrast shadow-xs"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Semua ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("unanswered")}
                className={`rounded-md px-2.5 py-0.5 font-semibold transition-colors ${
                  filter === "unanswered"
                    ? "bg-primary-main text-primary-contrast shadow-xs"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Belum ({unansweredIndices.length})
              </button>
            </div>
          )}
        </div>

        {/* Legenda warna */}
        <div className="flex items-center gap-3 text-[11px] text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-primary-main" />
            Aktif
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-success-main/60" />
            Terjawab
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded border border-divider bg-bg-default" />
            Belum
          </span>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto p-1 flex flex-wrap gap-2">
        {displayed.map(({ it, i }) => {
          const done = isAnswered(it, answers[it.id]);
          const current = i === currentIndex;
          const locked = forwardOnly && !current;
          return (
            <button
              key={it.id}
              ref={current ? activeBtnRef : null}
              type="button"
              onClick={() => onSelect(i)}
              disabled={locked}
              aria-label={`Soal ${i + 1}${done ? ", sudah dijawab" : ", belum dijawab"}`}
              aria-current={current ? "step" : undefined}
              className={`h-9 w-9 rounded-lg border text-xs font-bold transition-all ${
                current
                  ? "border-primary-main bg-primary-main text-primary-contrast ring-2 ring-primary-main/20"
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
          Pada subtes ini Anda hanya bisa maju. Soal yang sudah dilewati tidak
          bisa dibuka lagi.
        </p>
      )}
    </div>
  );
};

const NavigationFooter = (props: {
  currentIndex: number;
  isLast: boolean;
  forwardOnly: boolean;
  submitting: boolean;
  unanswered: number;
  requireAllAnswered?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onRequestFinish: () => void;
}) => {
  const {
    currentIndex,
    isLast,
    forwardOnly,
    submitting,
    unanswered,
    requireAllAnswered = false,
    onPrev,
    onNext,
    onRequestFinish,
  } = props;

  const finishDisabled = requireAllAnswered && unanswered > 0;

  return (
    <>
      <div className="flex items-center justify-between border-t border-divider pt-4">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0 || forwardOnly || submitting}
          className="rounded-xl bg-divider/10 px-5 py-2.5 text-xs font-bold text-text-primary disabled:cursor-not-allowed disabled:text-text-disabled"
        >
          Sebelumnya
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={onRequestFinish}
            disabled={submitting}
            className={`rounded-xl px-6 py-2.5 text-xs font-bold transition-all ${
              finishDisabled
                ? "border border-divider bg-bg-default text-text-secondary hover:border-primary-main/60"
                : "bg-primary-main text-primary-contrast shadow-sm hover:opacity-90"
            }`}
          >
            Selesaikan Subtes {unanswered > 0 ? `(${unanswered} belum)` : ""}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={submitting}
            className="rounded-xl bg-primary-main px-6 py-2.5 text-xs font-bold text-primary-contrast shadow-sm transition-all hover:opacity-90"
          >
            Selanjutnya &rarr;
          </button>
        )}
      </div>

      {/* Selesaikan lebih awal (hanya jika boleh bebas bernavigasi) */}
      {!isLast && !forwardOnly && (
        <div className="text-center">
          <button
            type="button"
            onClick={onRequestFinish}
            disabled={submitting}
            className={`text-xs font-semibold underline-offset-2 hover:underline ${
              finishDisabled
                ? "text-text-secondary hover:text-text-primary"
                : "text-text-secondary hover:text-primary-main"
            }`}
          >
            Selesaikan subtes sekarang {unanswered > 0 ? `(${unanswered} soal belum dijawab)` : ""}
          </button>
        </div>
      )}
    </>
  );
};

const ConfirmSubmitModal = (props: {
  unanswered: number;
  submitting: boolean;
  submitError: string | null;
  requireAllAnswered?: boolean;
  onJumpToUnanswered?: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  const {
    unanswered,
    submitting,
    submitError,
    requireAllAnswered = false,
    onJumpToUnanswered,
    onCancel,
    onConfirm,
  } = props;

  const isBlocked = requireAllAnswered && unanswered > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="w-full max-w-md space-y-4 rounded-3xl bg-bg-paper p-6 shadow-xl">
        <h2 id="confirm-title" className="text-lg font-bold text-text-primary">
          {isBlocked ? "Belum Bisa Dikumpulkan" : "Selesaikan subtes ini?"}
        </h2>
        <p className="text-sm leading-relaxed text-text-secondary">
          {isBlocked ? (
            <>
              Subtes ini mewajibkan seluruh soal dijawab. Masih ada{" "}
              <strong className="text-error-main">{unanswered} soal</strong> yang
              belum diisi.
            </>
          ) : unanswered > 0 ? (
            `Masih ada ${unanswered} soal yang belum terjawab. Setelah diselesaikan, subtes ini tidak bisa dibuka lagi.`
          ) : (
            "Semua soal sudah terjawab. Setelah diselesaikan, subtes ini tidak bisa dibuka lagi."
          )}
        </p>
        {submitError && (
          <p className="text-sm text-error-main">{submitError}</p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-xl bg-divider/10 px-5 py-2.5 text-xs font-bold text-text-primary"
          >
            {isBlocked ? "Tutup" : "Kembali"}
          </button>
          {isBlocked && onJumpToUnanswered && (
            <button
              type="button"
              onClick={() => {
                onCancel();
                onJumpToUnanswered();
              }}
              className="rounded-xl bg-primary-main px-5 py-2.5 text-xs font-bold text-primary-contrast"
            >
              Lompat ke Soal Kosong →
            </button>
          )}
          {!isBlocked && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className="rounded-xl bg-primary-main px-5 py-2.5 text-xs font-bold text-primary-contrast"
            >
              {submitting ? "Menyimpan..." : "Ya, selesaikan"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const TimeUpModal = () => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="timeup-title"
  >
    <div className="w-full max-w-sm space-y-2 rounded-3xl bg-bg-paper p-6 text-center shadow-xl">
      <h2 id="timeup-title" className="text-lg font-bold text-text-primary">
        Waktu subtes habis
      </h2>
      <p className="text-sm text-text-secondary">
        Jawaban Anda sedang disimpan. Mohon tunggu sebentar.
      </p>
    </div>
  </div>
);

/* ============================================================================
 * STIMULUS PHASE: Layar hafalan (misalnya daftar kata ME)
 * ========================================================================== */

const StimulusScreen = (props: {
  testName: string;
  sectionName: string;
  content: WordListContent;
  stimulusDeadlineAt: string | null;
  serverTime: string | null;
  displaySeconds: number;
  onDone: () => void;
}) => {
  const {
    testName,
    sectionName,
    stimulusDeadlineAt,
    serverTime,
    displaySeconds,
    content,
    onDone,
  } = props;

  const [confirmSkip, setConfirmSkip] = useState(false);

  // Server-synced countdown jika deadline tersedia, fallback ke local
  const serverRemaining = useCountdown(stimulusDeadlineAt, serverTime, onDone);
  const [localRemaining, setLocalRemaining] = useState(displaySeconds);
  const firedRef = useRef(false);

  useEffect(() => {
    if (stimulusDeadlineAt) return; // pakai server countdown
    const id = setInterval(() => {
      setLocalRemaining((r) => {
        const next = r - 1;
        if (next <= 0 && !firedRef.current) {
          firedRef.current = true;
          setTimeout(onDone, 0);
        }
        return Math.max(0, next);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onDone, stimulusDeadlineAt]);

  const remaining = stimulusDeadlineAt
    ? (serverRemaining ?? displaySeconds)
    : localRemaining;

  const timeUp = remaining <= 0;

  const timerClass =
    remaining <= 30
      ? "text-error-main animate-pulse"
      : remaining <= 60
        ? "text-warning-main"
        : "text-text-primary";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between rounded-2xl border border-divider bg-bg-paper px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-bold uppercase tracking-wider text-primary-main">
            {testName}
          </p>
          <h1 className="truncate text-base font-extrabold text-text-primary">
            {sectionName} — Hafalan
          </h1>
        </div>
        <div className="text-right" aria-live="off">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
            Sisa waktu hafalan
          </p>
          <p className={`font-mono text-lg font-black ${timerClass}`}>
            {formatClock(remaining)}
          </p>
        </div>
      </div>

      {/* Instruksi singkat */}
      <div className="rounded-2xl border border-divider bg-bg-paper px-4 py-3">
        <p className="text-sm font-semibold text-text-primary">
          Hafalkan kata-kata di bawah ini. Layar ini akan otomatis tertutup saat
          waktu habis dan <strong>tidak bisa dibuka lagi</strong>.
        </p>
      </div>

      {/* Grid kata — 5 kolom di desktop */}
      <div
        className="grid select-none grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        onContextMenu={(e) => e.preventDefault()}
      >
        {content.groups.map((g) => (
          <div
            key={g.category}
            className="rounded-2xl border border-divider bg-bg-paper p-4 shadow-sm"
          >
            <h3 className="mb-2 text-center text-xs font-black uppercase tracking-widest text-primary-main">
              {g.category}
            </h3>
            <ul className="space-y-1 text-center">
              {g.words.map((w) => (
                <li key={w} className="text-sm font-semibold text-text-primary">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Tombol lanjut lebih awal */}
      {!timeUp && (
        <div className="text-right">
          <button
            type="button"
            // onClick={() => alert(true)}
            onClick={() => setConfirmSkip(true)}
            className="rounded-xl bg-primary-main px-6 py-2.5 text-xs font-bold text-primary-contrast shadow-sm transition-all hover:opacity-90"
          >
            Saya Sudah Hafal, Lanjut ke Soal →
          </button>
        </div>
      )}

      {/* Modal konfirmasi skip */}
      {confirmSkip && !timeUp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md space-y-4 rounded-3xl bg-bg-paper p-6 shadow-xl">
            <h2 className="text-lg font-bold text-text-primary">
              Lanjutkan ke soal?
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Anda masih memiliki{" "}
              <strong className="text-text-primary">
                {formatClock(remaining)}
              </strong>{" "}
              untuk menghafal. Setelah lanjut, daftar kata{" "}
              <strong>tidak bisa dilihat lagi</strong>.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmSkip(false)}
                className="rounded-xl bg-divider/10 px-5 py-2.5 text-xs font-bold text-text-primary"
              >
                Kembali Menghafal
              </button>
              <button
                type="button"
                onClick={onDone}
                className="rounded-xl bg-primary-main px-5 py-2.5 text-xs font-bold text-primary-contrast"
              >
                Ya, Lanjut ke Soal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SectionPlayer(props: SectionPlayerProps) {
  const { attemptId, testName, run, onFinished } = props;

  // Local copy so we can swap in the full run after stimulus→questions transition
  const [activeRun, setActiveRun] = useState<SectionRun>(run);
  const { section, items } = activeRun;
  console.log(section);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const stimulus = section.stimulusPhase;

  const isStimulusPhase =
    stimulus != null &&
    stimulus.displaySeconds > 0 &&
    items.length === 0 &&
    section.stimulusDeadlineAt != null;

  const [phase, setPhase] = useState<
    "STIMULUS" | "TRANSITIONING" | "QUESTIONS"
  >(() => (isStimulusPhase ? "STIMULUS" : "QUESTIONS"));
  const [transitionError, setTransitionError] = useState<string | null>(null);

  const { mutateAsync: startSectionAsync } = useStartSection();

  const handleStimulusDone = useCallback(async () => {
    setPhase("TRANSITIONING");
    setTransitionError(null);
    try {
      const res = await startSectionAsync({
        attemptId,
        sectionId: section.id,
      });
      const data = unwrap<SectionRun>(res);
      if (!data?.section || !Array.isArray(data.items)) {
        throw new Error("Bentuk respons tidak dikenali");
      }
      // Normalize the new run
      setActiveRun({
        section: {
          ...data.section,
          instructions: data.section.instructions ?? null,
          examples: data.section.examples ?? [],
          showExamplesFirst: data.section.showExamplesFirst ?? true,
          deadlineAt: data.section.deadlineAt ?? null,
          stimulusDeadlineAt: data.section.stimulusDeadlineAt ?? null,
          serverTime: data.section.serverTime ?? null,
        },
        items: (data.items ?? []).map((it) => ({
          ...it,
          content: {
            text: it.content?.text ?? null,
            images: it.content?.images ?? [],
            audioUrl: it.content?.audioUrl ?? null,
          },
          options: it.options ?? [],
          constraints: it.constraints ?? {},
        })),
        answers: data.answers ?? [],
      });
      setPhase("QUESTIONS");
    } catch {
      setTransitionError(
        "Gagal memuat soal. Periksa koneksi Anda lalu coba lagi.",
      );
    }
  }, [attemptId, section.id, startSectionAsync]);

  const session = useSectionSession(attemptId, activeRun, onFinished);

  const answerable = items.filter((it) => !UNSUPPORTED_TYPES.includes(it.type));
  const answeredCount = answerable.filter((it) =>
    isAnswered(it, session.answers[it.id]),
  ).length;
  const unanswered = answerable.length - answeredCount;
  const item = items[session.index];
  const isLast = session.index === items.length - 1;
  const requireAllAnswered = Boolean(section.config?.requireAllAnswered);

  const firstUnansweredIndex = items.findIndex(
    (it) => !isAnswered(it, session.answers[it.id]),
  );
  const handleJumpToUnanswered = () => {
    if (firstUnansweredIndex >= 0) {
      session.goTo(firstUnansweredIndex);
    }
  };

  // Keyboard navigation & quick option selection (A/B or 1/2)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const tag = activeEl?.tagName?.toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        activeEl?.getAttribute("contenteditable") === "true"
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        session.goTo(session.index - 1);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        session.goTo(session.index + 1);
        return;
      }

      if (
        item &&
        ["FORCED_CHOICE", "SINGLE_CHOICE", "TRUE_FALSE", "YES_NO"].includes(
          item.type,
        )
      ) {
        const sorted = [...item.options].sort((a, b) => a.order - b.order);
        const k = e.key.toLowerCase();
        let targetIndex = -1;
        if (k === "a" || k === "1") targetIndex = 0;
        else if (k === "b" || k === "2") targetIndex = 1;
        else if (k === "c" || k === "3") targetIndex = 2;
        else if (k === "d" || k === "4") targetIndex = 3;
        else if (k === "e" || k === "5") targetIndex = 4;

        if (targetIndex >= 0 && sorted[targetIndex]) {
          e.preventDefault();
          session.updateAnswer(item.id, { keys: [sorted[targetIndex].key] });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, session]);

  // Layar stimulus (hafalan kata)
  if (phase === "STIMULUS" && stimulus) {
    return (
      <StimulusScreen
        testName={testName}
        sectionName={section.name}
        displaySeconds={stimulus.displaySeconds}
        stimulusDeadlineAt={section.stimulusDeadlineAt}
        serverTime={section.serverTime}
        content={stimulus.content as WordListContent}
        onDone={handleStimulusDone}
      />
    );
  }

  // Layar loading transisi stimulus → soal
  if (phase === "TRANSITIONING") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary-main border-t-transparent" />
          <p className="text-sm font-semibold text-text-secondary">
            Memuat soal...
          </p>
          {transitionError && (
            <div className="space-y-2">
              <p className="text-sm text-error-main">{transitionError}</p>
              <button
                type="button"
                onClick={() => void handleStimulusDone()}
                className="rounded-xl bg-primary-main px-5 py-2.5 text-xs font-bold text-primary-contrast"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BAR ATAS: nama subtes, status simpan, timer */}
      <TimeCount
        testName={testName}
        sectionName={section.name}
        saveState={session.saveState}
        hasUnsaved={session.hasUnsaved}
        answerable={answerable}
        answeredCount={answeredCount}
        confirmOpen={confirmOpen}
        setConfirmOpen={setConfirmOpen}
        session={session}
        requireAllAnswered={requireAllAnswered}
        onJumpToUnanswered={handleJumpToUnanswered}
      />

      {/* PETUNJUK PENGERJAAN & CONTOH SOAL */}
      <InstructionsAccordion
        instructions={section.instructions}
        examples={section.examples}
        showExamplesFirst={section.showExamplesFirst}
      />

      {/* KONTEN SOAL ATAU STATE KOSONG */}
      {items.length === 0 ? (
        <div className="space-y-4 rounded-3xl border border-divider bg-bg-paper p-8 text-center">
          <p className="text-sm text-text-secondary">
            Subtes ini belum memiliki soal.
          </p>
          <button
            type="button"
            onClick={() => void session.finishSection(false)}
            disabled={session.submitting}
            className="rounded-xl bg-primary-main px-6 py-2.5 text-xs font-bold text-primary-contrast"
          >
            Lanjutkan
          </button>
        </div>
      ) : (
        <>
          {/* PROGRES */}
          <ProgressBar
            currentIndex={session.index}
            totalItems={items.length}
            answeredCount={answeredCount}
            answerableCount={answerable.length}
          />

          {/* SOAL */}
          <div className="rounded-3xl border border-divider bg-bg-paper p-6 shadow-sm sm:p-8">
            <ItemView
              key={item.id}
              item={item}
              displayNumber={session.index + 1}
              value={session.answers[item.id]}
              onChange={(v) => session.updateAnswer(item.id, v)}
              disabled={session.submitting}
              section={section}
            />
          </div>

          {/* NAVIGATOR NOMOR */}
          <QuestionNavigator
            items={items}
            answers={session.answers}
            currentIndex={session.index}
            forwardOnly={session.forwardOnly}
            onSelect={session.goTo}
          />

          {/* TOMBOL NAVIGASI */}
          <NavigationFooter
            currentIndex={session.index}
            isLast={isLast}
            forwardOnly={session.forwardOnly}
            submitting={session.submitting}
            unanswered={unanswered}
            requireAllAnswered={requireAllAnswered}
            onPrev={() => session.goTo(session.index - 1)}
            onNext={() => session.goTo(session.index + 1)}
            onRequestFinish={() => setConfirmOpen(true)}
          />
        </>
      )}
    </div>
  );
}
