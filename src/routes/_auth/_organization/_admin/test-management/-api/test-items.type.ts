export type ItemType =
  | "SINGLE_CHOICE"
  | "MULTI_CHOICE"
  | "TRUE_FALSE"
  | "YES_NO"
  | "LIKERT"
  | "FORCED_CHOICE"
  | "MOST_LEAST"
  | "RANKING"
  | "NUMERIC_INPUT"
  | "TEXT_INPUT"
  | "DRAWING";

export type ItemStatus = "ACTIVE" | "RETIRED";

export interface TestItemOption {
  key: string;
  label: string | null;
  imageUrl: string | null;
  order: number;
  /**
   * Bentuk lain (scaleMappings, most/least) baru dipakai tahap berikutnya,
   * jadi bentuknya dibiarkan longgar di sini.
   */
  scoring:
    | ({ points: number } & Record<string, unknown>)
    | Record<string, unknown>
    | null;
}

export interface TestItemContent {
  text: string | null;
  images: { label: string; url: string }[];
  audioUrl: string | null;
}

export interface TestItemAnswerKey {
  correct?: string[];
  accepted?: string[];
}

/** Bentuk respons soal dari API admin (GET /tests/{testId}/items). */
export interface TestItem {
  id: string;
  testId: string;
  testVersion: string;
  sectionId: string;
  number: number;
  type: ItemType;
  content: TestItemContent;
  options: TestItemOption[];
  groupId: string | null;
  scaleId: string | null;
  reverseScored: boolean;
  weight: number;
  scoredInTotal: boolean;
  consistencyGroup: string | null;
  answerKey: TestItemAnswerKey | null;
  timeLimitSeconds: number | null;
  constraints: Record<string, unknown>;
  difficulty: number | null;
  isExample: boolean;
  status: ItemStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PageInfo {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ItemListParams {
  /** Wajib. Hook sebaiknya tidak memanggil API jika kosong (enabled: !!sectionId). */
  sectionId?: string;
  scaleId?: string;
  type?: string;
  page: number;
  size: number;
}
