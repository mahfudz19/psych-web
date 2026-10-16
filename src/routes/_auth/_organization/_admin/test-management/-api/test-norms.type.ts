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
