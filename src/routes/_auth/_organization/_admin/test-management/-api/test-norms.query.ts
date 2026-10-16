import type { NormTable } from "./test-norms.type";

const MOCK_SCALE_ID = "";

function mockNorms(scaleId: string): NormTable[] {
  const base = {
    testId: "mock",
    testVersion: "1.0.0",
    scaleId,
    sectionId: null,
    method: "LOOKUP" as const,
    mean: null,
    sd: null,
    categoryCutoffs: [],
    sampleSize: null,
    validFrom: "2026-10-04T00:00:00Z",
    validUntil: null,
    createdAt: "2026-10-04T09:00:00Z",
    updatedAt: "2026-10-04T09:00:00Z",
  };
  const row = (
    rawMin: number,
    rawMax: number,
    standard: number,
    category: string,
  ) => ({
    rawMin,
    rawMax,
    standard,
    standardMin: null,
    standardMax: null,
    percentile: null,
    category,
  });
  return [
    {
      ...base,
      id: "mock-norm-1",
      name: "Norma contoh usia 20-24",
      normVersion: "2024.1",
      targetScoreType: "WS",
      criteria: { ageMin: 20, ageMax: 24, gender: "ANY", education: "ANY" },
      entries: [row(0, 10, 5, "K"), row(11, 20, 10, "S"), row(21, 30, 15, "B")],
      source: "Data contoh",
      status: "ACTIVE",
    },
    {
      ...base,
      id: "mock-norm-2",
      name: "Norma contoh usia 25-29 (ada celah)",
      normVersion: "2024.1",
      targetScoreType: "WS",
      criteria: { ageMin: 25, ageMax: 29, gender: "ANY", education: "ANY" },
      entries: [row(0, 10, 5, "K"), row(15, 30, 12, "S")],
      source: null,
      status: "DRAFT",
    },
  ];
}

export function useGetTestNorms(_testId: string): {
  data?: { data: NormTable[] };
  isLoading: boolean;
} {
  return {
    isLoading: false,
    data: { data: MOCK_SCALE_ID ? mockNorms(MOCK_SCALE_ID) : [] },
  };
}

const logOnly = (name: string) => (normId: string) => {
  console.log(`[${name}] belum tersambung ke API. normId:`, normId);
};

export function useDeleteTestNormMutation(_testId: string): {
  mutate: (normId: string) => void;
} {
  return { mutate: logOnly("useDeleteTestNormMutation") };
}

export function useActivateTestNormMutation(_testId: string): {
  mutate: (normId: string) => void;
} {
  return { mutate: logOnly("useActivateTestNormMutation") };
}

export function useArchiveTestNormMutation(_testId: string): {
  mutate: (normId: string) => void;
} {
  return { mutate: logOnly("useArchiveTestNormMutation") };
}
