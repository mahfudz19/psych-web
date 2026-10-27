import { toNum, type analyzeRows } from "../norm-utils";
import type {
  CategoryCutoff,
  NormGender,
  NormMethod,
  NormTargetScoreType,
} from "../../../../-api/test-definitions.type";
import type {
  DraftCutoff,
  NormEntryPayload,
  NormPayload,
  NormScaleInfo,
} from "./types";

type Analysis = ReturnType<typeof analyzeRows>;

interface BuildInput {
  form: FormData;
  method: NormMethod;
  analysis: Analysis;
  cutoffs: DraftCutoff[];
  scale: NormScaleInfo;
  target: NormTargetScoreType | null;
  isEdit: boolean;
}

export type BuildResult =
  { ok: true; payload: NormPayload } | { ok: false; errors: string[] };

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const toIso = (date: string) => (date ? `${date}T00:00:00Z` : null);

function optionalInt(
  raw: string,
  label: string,
  errs: string[],
  min: number,
): number | null {
  if (!raw) return null;
  const n = toNum(raw);
  if (n === null || !Number.isInteger(n) || n < min) {
    errs.push(
      `${label} harus bilangan bulat ${min === 0 ? "tidak negatif" : `minimal ${min}`}`,
    );
    return null;
  }
  return n;
}

export function buildNormPayload({
  form,
  method,
  analysis,
  cutoffs,
  scale,
  target,
  isEdit,
}: BuildInput): BuildResult {
  const errs: string[] = [];

  const name = text(form, "name");
  const normVersion = text(form, "normVersion");
  if (!name) errs.push("Nama norma wajib diisi");
  if (!normVersion) errs.push("Versi norma wajib diisi");
  if (!target) errs.push("Jenis skor skala ini tidak membutuhkan norma");

  // --- kelompok pembanding ---
  const ageMin = optionalInt(text(form, "ageMin"), "Usia dari", errs, 0);
  const ageMax = optionalInt(text(form, "ageMax"), "Usia sampai", errs, 0);
  if (ageMin !== null && ageMax !== null && ageMin > ageMax) {
    errs.push("Usia dari tidak boleh lebih besar dari usia sampai");
  }
  const gender = (text(form, "gender") || "ANY") as NormGender;
  const education = text(form, "education") || "ANY";

  // --- isi konversi ---
  let entries: NormEntryPayload[] = [];
  let mean: number | null = null;
  let sd: number | null = null;

  if (method === "LOOKUP") {
    const { parsed, errors: rowErrors } = analysis;
    if (parsed.length === 0) errs.push("Tabel konversi masih kosong");
    if (rowErrors.size > 0) {
      errs.push(`Ada ${rowErrors.size} baris bermasalah (ditandai merah)`);
    }
    entries = parsed.flatMap((p) =>
      p.std
        ? [
            {
              rawMin: p.rawMin,
              rawMax: p.rawMax,
              standard: p.std.standard,
              standardMin: p.std.standardMin,
              standardMax: p.std.standardMax,
              percentile: p.percentile,
              category: p.category,
            },
          ]
        : [],
    );
  } else {
    mean = toNum(text(form, "mean"));
    sd = toNum(text(form, "sd"));
    if (mean === null) errs.push("Rata-rata (mean) wajib diisi");
    if (sd === null || sd <= 0) {
      errs.push("Simpangan baku (SD) wajib diisi dan lebih dari 0");
    }
  }

  // --- batas kategori ---
  const categoryCutoffs: CategoryCutoff[] = [];
  cutoffs.forEach((c, i) => {
    if (!c.from.trim() && !c.to.trim() && !c.label.trim()) return;
    const from = toNum(c.from);
    const to = toNum(c.to);
    if (from === null || to === null || !c.label.trim()) {
      errs.push(
        `Batas kategori baris ${i + 1}: dari, sampai, dan label wajib diisi`,
      );
    } else if (from > to) {
      errs.push(
        `Batas kategori baris ${i + 1}: dari tidak boleh lebih besar dari sampai`,
      );
    } else {
      categoryCutoffs.push({ from, to, label: c.label.trim() });
    }
  });

  // --- lanjutan ---
  const sampleSize = optionalInt(
    text(form, "sampleSize"),
    "Ukuran sampel",
    errs,
    1,
  );
  const validFrom = text(form, "validFrom");
  const validUntil = text(form, "validUntil");
  if (validFrom && validUntil && validFrom > validUntil) {
    errs.push("Berlaku dari tidak boleh setelah berlaku sampai");
  }

  if (errs.length > 0 || !target) return { ok: false, errors: errs };

  return {
    ok: true,
    payload: {
      ...(isEdit ? {} : { scaleId: scale.id }),
      normVersion,
      name,
      targetScoreType: target,
      method,
      criteria: { ageMin, ageMax, gender, education },
      entries,
      mean,
      sd,
      categoryCutoffs,
      sampleSize,
      source: text(form, "source") || null,
      validFrom: toIso(validFrom),
      validUntil: toIso(validUntil),
    },
  };
}
