import type {
  NavigationPolicy,
  SectionStatus,
} from "../$testId/-components/SectionManagement/SectionForm";
import type { BaseListParams } from "../../../../../../components/reusebale-components/DataTable";

// --- ENUMS ---
export type TestCategory =
  | "ABILITY"
  | "PERSONALITY_FORCED_CHOICE"
  | "PERSONALITY_SCALE"
  | "INTEREST"
  | "SPEED_ENDURANCE"
  | "PROJECTIVE"
  | "MANAGEMENT";

export type TestStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type ScoringMode = "AUTO" | "MANUAL" | "HYBRID";
export type ResultViewType =
  "RADAR" | "BAR" | "PROFILE" | "TYPE_CARD" | "IQ_CARD" | "NARRATIVE_ONLY";
export type PausePolicy = "FREE" | "BETWEEN_SECTIONS_ONLY" | "NONE";
export type ItemOrderPolicy = "FIXED" | "RANDOMIZED";
export type ResultAccessLevel = "STANDARD" | "RESTRICTED";
export type TestPurpose = "SELF_DISCOVERY" | "RECRUITMENT";
export type MinimumEducation = "SD" | "SMP" | "SMA" | "D3" | "S1" | "S2" | "S3";
export type TestScaleType = "DIMENSION" | "SUBTEST" | string;

// --- SUB-OBJECT INTERFACES ---
export interface TargetAgeRange {
  min: number | null;
  max: number | null;
}

export interface LicenseInfo {
  owner?: string;
  status: "LICENSED" | "UNLICENSED" | "UNKNOWN" | string;
  validUntil?: string;
}

// --- 1. TEST DEFINITION ---
export interface TestDefinition {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  category: TestCategory;
  description?: string;
  instructions?: string;
  purposes?: TestPurpose[];
  version?: string;
  status: TestStatus;
  scoringMode?: ScoringMode;
  scorerKey?: string;
  scoringConfig?: Record<string, any>;
  resultViewType?: ResultViewType;
  totalItems?: number;
  totalDurationSeconds?: number | null;
  estimatedMinutes?: number;
  pausePolicy?: PausePolicy;
  disconnectGraceSeconds?: number;
  itemOrderPolicy?: ItemOrderPolicy;
  targetAge?: TargetAgeRange;
  minEducation?: MinimumEducation | null;
  language?: string;
  requiredFeature?: string;
  resultAccessLevel?: ResultAccessLevel;
  config?: Record<string, any>;
  license?: LicenseInfo;
  thumbnailUrl?: string | null;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface TestStats {
  sections: number;
  scales: number;
  items: number;
  norms: number;
}

export interface TestSectionProgress {
  sectionId: string;
  code: string;
  expectedItems: number;
  enteredItems: number;
}

export interface TestDefinitionDetail {
  test: TestDefinition;
  stats: TestStats;
  progress: TestSectionProgress[];
}

export type TestDefinitionCreatePayload = Omit<
  TestDefinition,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>;

export type TestDefinitionUpdatePayload = Omit<
  TestDefinitionCreatePayload,
  "code"
>;

// --- 2. TEST SECTION ---
export interface TestSection {
  id: string;
  testId?: string;
  code: string;
  order: number;
  name: string;
  instructions?: string;
  examples?: string;
  showExamplesFirst?: boolean;
  timeLimitSeconds?: number | null;
  itemCount?: number;
  navigationPolicy?: string;
  defaultItemType?: string;
  stimulusPhase?: Record<string, unknown> | null;
  config?: Record<string, any>;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  scaleIds?: string[];
}

export type TestSectionCreatePayload = {
  code?: string;
  order: number;
  name: string;
  instructions: string;
  examples: unknown[];
  showExamplesFirst: boolean;
  timeLimitSeconds: number | null;
  itemCount: number;
  navigationPolicy: NavigationPolicy;
  defaultItemType: string;
  stimulusPhase: Record<string, unknown> | null;
  config: Record<string, unknown>;
  status: SectionStatus;
};

export type TestSectionUpdatePayload = Omit<
  TestSectionCreatePayload,
  "code"
> & { id: string };

// --- 3. TEST SCALE ---
export interface TestScale {
  id: string;
  testId?: string;
  code: string;
  name: string;
  type: string; // DIMENSION, SUBTEST, dll
  role?: string;
  parentScaleId?: string | null;
  sectionId?: string | null;
  order?: number;
  description?: string;
  lowLabel?: string;
  highLabel?: string;
  rawMin?: number | null;
  rawMax?: number | null;
  scoreType?: string;
  composite?: Record<string, any>;
  isReported?: boolean;
  isValidityScale?: boolean;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TestScaleCreatePayload = Omit<
  TestScale,
  "id" | "testId" | "createdAt" | "updatedAt"
>;

export type TestScaleUpdatePayload = Omit<TestScaleCreatePayload, "code">;

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
  | "DRAWING"
  | "MATRIX_TASK";

export type ItemStatus = "ACTIVE" | "RETIRED";

export interface TestItemOption {
  key: string;
  label: string | null;
  imageUrl: string | null;
  order: number;
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

export interface ItemListParams extends BaseListParams {
  sectionId?: string;
  scaleId?: string;
}

export interface TestItemCreatePayload {
  sectionId: string;
  number: number;
  type: ItemType;
  content: TestItemContent;
  options?: TestItemOption[];
  groupId?: string | null;
  scaleId?: string | null;
  reverseScored?: boolean;
  weight?: number;
  scoredInTotal?: boolean;
  consistencyGroup?: string | null;
  answerKey?: TestItemAnswerKey | null;
  timeLimitSeconds?: number | null;
  constraints?: Record<string, unknown> | null;
  difficulty?: number | null;
  isExample?: boolean;
  status?: ItemStatus;
  tags?: string[];
}

export interface TestItemUpdatePayload {
  number: number;
  content: TestItemContent;
  options?: TestItemOption[];
  groupId?: string | null;
  scaleId?: string | null;
  reverseScored?: boolean;
  weight?: number;
  scoredInTotal?: boolean;
  consistencyGroup?: string | null;
  answerKey?: TestItemAnswerKey | null;
  timeLimitSeconds?: number | null;
  constraints?: Record<string, unknown> | null;
  difficulty?: number | null;
  isExample?: boolean;
  status?: ItemStatus;
  tags?: string[];
}

export type NormTargetScoreType =
  "SW" | "WS" | "IQ" | "T_SCORE" | "STEN" | "STANINE" | "PERCENTILE";

export type NormMethod = "LOOKUP" | "MEAN_SD";
export type NormStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type NormGender = "ANY" | "MALE" | "FEMALE";

export interface NormCriteria {
  ageMin: number | null;
  ageMax: number | null;
  gender: NormGender;
  /** "ANY" atau salah satu EducationLevel (SD, SMP, SMA, SMK, D3, S1, S2, S3, OTHER) */
  education: string;
}

/** Satu baris tabel konversi. Isi `standard` ATAU pasangan `standardMin` dan `standardMax`. */
export interface NormEntry {
  rawMin: number;
  rawMax: number;
  standard: number | null;
  standardMin: number | null;
  standardMax: number | null;
  percentile: number | null;
  category: string | null;
}

export interface CategoryCutoff {
  from: number;
  to: number;
  label: string;
}

export interface NormCoverage {
  rawMin: number | null;
  rawMax: number | null;
  covered: boolean;
  gaps: { from: number; to: number }[];
}

/** Bentuk respons norma dari API admin (GET /tests/{testId}/norms). */
export interface NormTable {
  id: string;
  testId: string;
  testVersion: string;
  scaleId: string;
  sectionId: string | null;
  normVersion: string;
  name: string;
  targetScoreType: NormTargetScoreType;
  method: NormMethod;
  criteria: NormCriteria;
  entries: NormEntry[];
  mean: number | null;
  sd: number | null;
  categoryCutoffs: CategoryCutoff[];
  sampleSize: number | null;
  source: string | null;
  validFrom: string | null;
  validUntil: string | null;
  status: NormStatus;
  coverage?: NormCoverage | null;
  createdAt: string;
  updatedAt: string;
}
