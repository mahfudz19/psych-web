import type {
  NormGender,
  NormMethod,
  NormTargetScoreType,
  CategoryCutoff,
} from "../../../../-api/test-definitions.type";

export interface NormEntryPayload {
  rawMin: number;
  rawMax: number;
  standard: number | null;
  standardMin: number | null;
  standardMax: number | null;
  percentile: number | null;
  category: string | null;
}

export interface NormPayload {
  scaleId?: string;
  normVersion: string;
  name: string;
  targetScoreType: NormTargetScoreType;
  method: NormMethod;
  criteria: {
    ageMin: number | null;
    ageMax: number | null;
    gender: NormGender;
    education: string;
  };
  entries: NormEntryPayload[];
  mean: number | null;
  sd: number | null;
  categoryCutoffs: CategoryCutoff[];
  sampleSize: number | null;
  source: string | null;
  validFrom: string | null;
  validUntil: string | null;
}

export interface NormScaleInfo {
  id: string;
  code: string;
  name: string;
  scoreType?: string | null;
  rawMin?: number | null;
  rawMax?: number | null;
}

export interface DraftCutoff {
  from: string;
  to: string;
  label: string;
}
