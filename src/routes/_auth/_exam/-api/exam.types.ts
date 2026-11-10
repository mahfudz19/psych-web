export interface ExamItemOption {
  key: string;
  label: string | null;
  imageUrl: string | null;
  order: number;
}

export interface ExamItem {
  id: string;
  number: number;
  /** Dibiarkan string agar tipe soal baru tidak merusak halaman. Tipe tak dikenal ditampilkan sebagai "belum didukung". */
  type: string;
  content: {
    text: string | null;
    images: { label: string; url: string }[];
    audioUrl: string | null;
  };
  options: ExamItemOption[];
  constraints: Record<string, unknown>;
  groupId: string | null;
  timeLimitSeconds: number | null;
}

/** Bentuk jawaban per tipe soal (sesuai rancangan collection attempt_answers). */
export type AnswerResponse =
  | { keys: string[] } // SINGLE_CHOICE, LIKERT, TRUE_FALSE, YES_NO, FORCED_CHOICE, MULTI_CHOICE
  | { most: string; least: string } // MOST_LEAST
  | { ranking: string[] } // RANKING
  | { value: string }; // NUMERIC_INPUT, TEXT_INPUT

export type AnswerMap = Record<string, AnswerResponse | null>;

export type SectionStatus =
  "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "EXPIRED";
export type NavigationPolicy = "FREE" | "FORWARD_ONLY";

export interface AttemptSection {
  sectionId: string;
  code: string;
  order: number;
  name: string;
  itemCount: number;
  answeredCount: number;
  timeLimitSeconds: number | null;
  navigationPolicy: NavigationPolicy;
  status: SectionStatus;
  startedAt: string | null;
  deadlineAt: string | null;
  completedAt: string | null;
  /** Belum dikirim API. Jika ditambahkan ke sectionStates, petunjuk tampil sebelum timer dimulai. */
  instructions?: string | null;
}

export interface AttemptState {
  id: string;
  testId: string;
  testVersion: string;
  testCode: string;
  testName: string;
  attemptNumber: number;
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED" | "EXPIRED";
  startedAt: string | null;
  completedAt: string | null;
  currentSectionId: string | null;
  sections: AttemptSection[];
  serverTime: string | null;
}

export interface SectionInfo {
  id: string;
  code: string;
  name: string;
  instructions: string | null;
  examples: unknown[];
  showExamplesFirst: boolean;
  timeLimitSeconds: number | null;
  navigationPolicy: NavigationPolicy;
  itemCount: number;
  startedAt: string | null;
  deadlineAt: string | null;
  serverTime: string | null;
}

export interface SavedAnswer {
  itemId: string;
  response: AnswerResponse | null;
  answeredAt?: string | null;
}

export interface SectionRun {
  section: SectionInfo;
  items: ExamItem[];
  answers: SavedAnswer[];
}

export interface SaveResult {
  savedCount: number;
  revision: number;
  deadlineAt: string | null;
  serverTime: string | null;
}

// ---------------------------------------------------------------------------
// FUNGSI BANTU
// ---------------------------------------------------------------------------

/** Mengambil isi dari respons berbentuk `{ data: ... }`, atau respons itu sendiri jika tanpa pembungkus. */
export function unwrap<T>(res: unknown): T | null {
  if (res === null || res === undefined) return null;
  if (typeof res === "object" && "data" in (res as object)) {
    const inner = (res as { data?: unknown }).data;
    return (inner ?? null) as T | null;
  }
  return res as T;
}

/** Tipe soal yang belum punya tampilan pengerjaan. */
export const UNSUPPORTED_TYPES = ["DRAWING", "MATRIX_TASK"];

export function numConstraint(item: ExamItem, key: string): number | null {
  const v = item.constraints?.[key];
  return typeof v === "number" ? v : null;
}

/** Apakah jawaban sudah lengkap menurut tipe soalnya? */
export function isAnswered(
  item: ExamItem,
  value: AnswerResponse | null | undefined,
): boolean {
  if (!value) return false;
  switch (item.type) {
    case "MOST_LEAST":
      return (
        "most" in value &&
        value.most !== "" &&
        value.least !== "" &&
        value.most !== value.least
      );
    case "RANKING":
      return "ranking" in value && value.ranking.length === item.options.length;
    case "NUMERIC_INPUT":
    case "TEXT_INPUT":
      return "value" in value && value.value.trim() !== "";
    case "MULTI_CHOICE": {
      const min = numConstraint(item, "minSelect") ?? 1;
      return "keys" in value && value.keys.length >= min;
    }
    default:
      return "keys" in value && value.keys.length > 0;
  }
}

/** 125 detik menjadi "02:05", 3725 detik menjadi "1:02:05". */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatLimit(seconds: number | null | undefined): string {
  if (!seconds) return "Tanpa batas waktu";
  if (seconds % 60 === 0) return `${seconds / 60} menit`;
  return `${Math.floor(seconds / 60)} menit ${seconds % 60} detik`;
}
