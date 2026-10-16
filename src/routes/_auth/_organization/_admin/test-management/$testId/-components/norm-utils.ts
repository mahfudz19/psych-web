// ---------------------------------------------------------------------------
// KONSTANTA & JENIS SKOR
// ---------------------------------------------------------------------------

import type {
  NormCriteria,
  NormEntry,
  NormTable,
  NormTargetScoreType,
} from "../../-api/test-norms.type";

export const NORM_EDUCATION = [
  "SD",
  "SMP",
  "SMA",
  "SMK",
  "D3",
  "S1",
  "S2",
  "S3",
  "OTHER",
] as const;

/** Skala hanya butuh norma jika jenis skornya RAW_TO_... */
export function needsNorm(scoreType?: string | null): boolean {
  return Boolean(scoreType) && String(scoreType).startsWith("RAW_TO_");
}

const TARGETS: Record<string, NormTargetScoreType> = {
  RAW_TO_SW: "SW",
  RAW_TO_WS: "WS",
  RAW_TO_IQ: "IQ",
  RAW_TO_T: "T_SCORE",
  RAW_TO_STEN: "STEN",
  RAW_TO_PERCENTILE: "PERCENTILE",
};

/** Skor tujuan norma diturunkan dari jenis skor skala. */
export function targetFromScoreType(
  scoreType?: string | null,
): NormTargetScoreType | null {
  return scoreType ? (TARGETS[scoreType] ?? null) : null;
}

// ---------------------------------------------------------------------------
// BARIS TABEL
// ---------------------------------------------------------------------------

/** Satu baris tabel di form. Semua berupa teks agar admin bebas mengetik. */
export interface DraftRow {
  rawMin: string;
  rawMax: string;
  /** Angka tunggal ("14") atau rentang ("17-20") */
  standard: string;
  percentile: string;
  category: string;
}

export const blankRow = (): DraftRow => ({
  rawMin: "",
  rawMax: "",
  standard: "",
  percentile: "",
  category: "",
});

export function toNum(text: string): number | null {
  const t = text.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isNaN(n) ? null : n;
}

export interface ParsedStandard {
  standard: number | null;
  standardMin: number | null;
  standardMax: number | null;
}

/** "14" menjadi tunggal, "17-20" menjadi rentang. Selain itu null. */
export function parseStandard(text: string): ParsedStandard | null {
  const t = text.trim();
  if (t === "") return null;
  if (/^-?\d+(\.\d+)?$/.test(t)) {
    return { standard: Number(t), standardMin: null, standardMax: null };
  }
  const m = /^(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)$/.exec(t);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a <= b) return { standard: null, standardMin: a, standardMax: b };
  }
  return null;
}

export function formatStandard(p: ParsedStandard | NormEntry): string {
  if (p.standard !== null && p.standard !== undefined)
    return String(p.standard);
  if (p.standardMin !== null && p.standardMax !== null)
    return `${p.standardMin}-${p.standardMax}`;
  return "";
}

export function rowsFromEntries(entries: NormEntry[]): DraftRow[] {
  return entries.map((e) => ({
    rawMin: String(e.rawMin),
    rawMax: String(e.rawMax),
    standard: formatStandard(e),
    percentile:
      e.percentile === null || e.percentile === undefined
        ? ""
        : String(e.percentile),
    category: e.category ?? "",
  }));
}

export interface ParsedRow {
  index: number;
  rawMin: number;
  rawMax: number;
  std: ParsedStandard | null;
  percentile: number | null;
  category: string | null;
}

/**
 * Memeriksa semua baris. Baris yang sepenuhnya kosong diabaikan.
 * Mengembalikan pesan masalah per nomor baris (mulai dari 0) dan baris yang terbaca.
 */
export function analyzeRows(rows: DraftRow[]) {
  const errors = new Map<number, string>();
  const parsed: ParsedRow[] = [];

  rows.forEach((r, index) => {
    const blank =
      !r.rawMin.trim() &&
      !r.rawMax.trim() &&
      !r.standard.trim() &&
      !r.category.trim() &&
      !r.percentile.trim();
    if (blank) return;

    const rawMin = toNum(r.rawMin);
    const rawMax = toNum(r.rawMax);
    if (rawMin === null || rawMax === null) {
      errors.set(index, "Skor mentah dari dan sampai wajib berupa angka");
      return;
    }
    if (rawMin > rawMax) {
      errors.set(index, "Mentah dari tidak boleh lebih besar dari sampai");
      return;
    }

    const std = parseStandard(r.standard);
    if (!std)
      errors.set(
        index,
        "Skor standar tidak valid (angka, atau rentang seperti 17-20)",
      );

    const percentile = toNum(r.percentile);
    if (r.percentile.trim() && percentile === null) {
      errors.set(index, "Persentil harus berupa angka");
    }

    parsed.push({
      index,
      rawMin,
      rawMax,
      std,
      percentile,
      category: r.category.trim() || null,
    });
  });

  // Rentang yang bertumpuk
  const sorted = [...parsed].sort(
    (a, b) => a.rawMin - b.rawMin || a.rawMax - b.rawMax,
  );
  let widest: ParsedRow | null = null;
  for (const cur of sorted) {
    if (widest && cur.rawMin <= widest.rawMax) {
      if (!errors.has(cur.index))
        errors.set(cur.index, `Bertumpuk dengan baris ${widest.index + 1}`);
      if (!errors.has(widest.index))
        errors.set(widest.index, `Bertumpuk dengan baris ${cur.index + 1}`);
    }
    if (!widest || cur.rawMax > widest.rawMax) widest = cur;
  }

  return { errors, parsed };
}

// ---------------------------------------------------------------------------
// CAKUPAN
// ---------------------------------------------------------------------------

export interface CoverageSegment {
  from: number;
  to: number;
  covered: boolean;
}

/**
 * Menghitung bagian skor mentah [min, max] yang sudah dan belum tercakup.
 * Dihitung per bilangan bulat, sesuai skor mentah pada tes pilihan atau benar/salah.
 */
export function computeCoverage(
  ranges: { rawMin: number; rawMax: number }[],
  min: number,
  max: number,
) {
  const sorted = [...ranges].sort((a, b) => a.rawMin - b.rawMin);
  const gaps: { from: number; to: number }[] = [];
  let cursor = min;
  for (const r of sorted) {
    if (r.rawMax < cursor) continue;
    if (r.rawMin > cursor)
      gaps.push({ from: cursor, to: Math.min(r.rawMin - 1, max) });
    cursor = Math.max(cursor, r.rawMax + 1);
    if (cursor > max) break;
  }
  if (cursor <= max) gaps.push({ from: cursor, to: max });

  const segments: CoverageSegment[] = [];
  let start = min;
  for (const g of gaps) {
    if (g.from > start)
      segments.push({ from: start, to: g.from - 1, covered: true });
    segments.push({ from: g.from, to: g.to, covered: false });
    start = g.to + 1;
  }
  if (start <= max) segments.push({ from: start, to: max, covered: true });

  return { covered: gaps.length === 0, gaps, segments };
}

/** Apakah norma sudah mencakup seluruh rentang skor mentah skalanya? */
export function isNormCovered(
  norm: NormTable,
  scale: { rawMin?: number | null; rawMax?: number | null },
): boolean {
  if (norm.method === "MEAN_SD") return true;
  if (norm.coverage) return norm.coverage.covered;
  if (scale.rawMin === null || scale.rawMin === undefined) return true;
  if (scale.rawMax === null || scale.rawMax === undefined) return true;
  return computeCoverage(norm.entries, scale.rawMin, scale.rawMax).covered;
}

export function formatGaps(
  gaps: { from: number; to: number }[],
  limit = 4,
): string {
  const parts = gaps
    .slice(0, limit)
    .map((g) => (g.from === g.to ? `${g.from}` : `${g.from}-${g.to}`));
  return (
    parts.join(", ") +
    (gaps.length > limit ? `, dan ${gaps.length - limit} lainnya` : "")
  );
}

// ---------------------------------------------------------------------------
// TEMPEL DARI SPREADSHEET
// ---------------------------------------------------------------------------

/**
 * Format tiap baris: skor mentah, skor standar, kategori (opsional), persentil (opsional).
 * Skor mentah boleh angka ("24") atau rentang ("23-24"), skor standar boleh angka atau
 * rentang ("17-20"). Pemisah kolom: tab (hasil salin spreadsheet), titik koma, atau koma.
 * Baris judul di paling atas diabaikan.
 */
export function parsePaste(text: string): {
  rows: DraftRow[];
  errors: string[];
} {
  const rows: DraftRow[] = [];
  const errors: string[] = [];

  text.split(/\r?\n/).forEach((line, idx) => {
    if (!line.trim()) return;
    const sep = line.includes("\t") ? "\t" : line.includes(";") ? ";" : ",";
    const cells = line.split(sep).map((c) => c.trim());
    const first = cells[0] ?? "";

    const range = /^(\d+)\s*[-–—]\s*(\d+)$/.exec(first);
    const single = /^\d+$/.test(first);
    if (!range && !single) {
      if (idx === 0) return; // baris judul
      errors.push(`Baris ${idx + 1}: skor mentah "${first}" tidak dikenali`);
      return;
    }
    if (!parseStandard(cells[1] ?? "")) {
      errors.push(
        `Baris ${idx + 1}: skor standar "${cells[1] ?? ""}" tidak dikenali`,
      );
      return;
    }
    rows.push({
      rawMin: range ? range[1] : first,
      rawMax: range ? range[2] : first,
      standard: cells[1],
      category: cells[2] ?? "",
      percentile: cells[3] ?? "",
    });
  });

  return { rows, errors };
}

// ---------------------------------------------------------------------------
// TAMPILAN
// ---------------------------------------------------------------------------

/** Label ringkas kelompok pembanding, misalnya "25-29 · Perempuan" atau "Umum". */
export function criteriaLabel(c: NormCriteria): string {
  const parts: string[] = [];
  if (c.ageMin !== null && c.ageMax !== null)
    parts.push(`${c.ageMin}-${c.ageMax}`);
  else if (c.ageMin !== null) parts.push(`${c.ageMin}+`);
  else if (c.ageMax !== null) parts.push(`s/d ${c.ageMax}`);
  if (c.gender === "MALE") parts.push("Laki-laki");
  if (c.gender === "FEMALE") parts.push("Perempuan");
  if (c.education && c.education !== "ANY") parts.push(c.education);
  return parts.length > 0 ? parts.join(" · ") : "Umum";
}
