import { useMemo, useState } from "react";
import {
  analyzeRows,
  blankRow,
  computeCoverage,
  formatGaps,
  formatStandard,
  NORM_EDUCATION,
  parsePaste,
  rowsFromEntries,
  targetFromScoreType,
  toNum,
  type DraftRow,
} from "../norm-utils";
import Input from "../../../../../../../../../components/ui/Input";
import Select from "../../../../../../../../../components/ui/Select";
import Button from "../../../../../../../../../components/ui/Button";
import Textarea from "../../../../../../../../../components/ui/Textarea";
import DialogConfirmAction from "../../../../../../../../../components/reusebale-components/dialog/DialogConfirmAction";
import Label from "../../../../../../../../../components/ui/Label";
import type {
  CategoryCutoff,
  NormGender,
  NormMethod,
  NormTable,
  NormTargetScoreType,
} from "../../../../-api/test-definitions.type";
import IconButton from "../../../../../../../../../components/ui/IconButton";
import { Plus, X } from "lucide-react";
import InputDate from "../../../../../../../../../components/ui/InputDate";
import {
  useActivateTestNormMutation,
  useArchiveTestNormMutation,
  useCreateTestNormMutation,
  useDeleteTestNormMutation,
  useUpdateTestNormMutation,
} from "../../../../-api/test-definitions.query";
import Alert from "../../../../../../../../../components/ui/Alert";
import AlertTitle from "../../../../../../../../../components/ui/Alert/AlertTitle";
import AlertDescription from "../../../../../../../../../components/ui/Alert/AlertDescription";

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

interface Props {
  testId: string;
  mode: "create" | "edit";
  norm?: NormTable;
  scale: NormScaleInfo;
  readOnly: boolean;
  onCancel: () => void;
  canActivate?: boolean;
  canArchive?: Boolean;
  canDelete?: boolean;
}

interface DraftCutoff {
  from: string;
  to: string;
  label: string;
}

const MAX_GENERATED_ROWS = 500;

const TARGET_LABEL: Record<string, string> = {
  SW: "Skor Standar (SW)",
  WS: "Nilai Bobot (WS)",
  IQ: "IQ",
  T_SCORE: "T-Score",
  STEN: "Sten",
  STANINE: "Stanine",
  PERCENTILE: "Persentil",
};

const hasData = (rows: DraftRow[]) =>
  rows.some(
    (r) => r.rawMin || r.rawMax || r.standard || r.category || r.percentile,
  );

const dateOnly = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");
const toIso = (date: string) => (date ? `${date}T00:00:00Z` : null);

export default function NormForm({
  testId,
  mode,
  norm,
  scale,
  readOnly,
  onCancel,
  canActivate,
  canArchive,
  canDelete,
}: Props) {
  const isEdit = mode === "edit";
  const status = isEdit ? norm?.status : undefined;

  const createMutation = useCreateTestNormMutation(testId);
  const updateMutation = useUpdateTestNormMutation(testId);
  const deleteMutation = useDeleteTestNormMutation(testId);
  const activateMutation = useActivateTestNormMutation(testId);
  const archiveMutation = useArchiveTestNormMutation(testId);

  const target: NormTargetScoreType | null =
    norm?.targetScoreType ?? targetFromScoreType(scale.scoreType);

  const rMin = scale.rawMin ?? null;
  const rMax = scale.rawMax ?? null;
  const hasRange = rMin !== null && rMax !== null;

  // --- identitas & kelompok ---
  const [name, setName] = useState<string>(norm?.name ?? "");
  const [normVersion, setNormVersion] = useState<string>(
    isEdit ? (norm?.normVersion ?? "") : "",
  );
  const [method, setMethod] = useState<NormMethod>(norm?.method ?? "LOOKUP");
  const [ageMin, setAgeMin] = useState<string>(
    norm?.criteria.ageMin?.toString() ?? "",
  );
  const [ageMax, setAgeMax] = useState<string>(
    norm?.criteria.ageMax?.toString() ?? "",
  );
  const [gender, setGender] = useState<NormGender>(
    norm?.criteria.gender ?? "ANY",
  );
  const [education, setEducation] = useState<string>(
    norm?.criteria.education ?? "ANY",
  );

  // --- isi konversi ---
  const [rows, setRows] = useState<DraftRow[]>(
    norm && norm.entries.length > 0
      ? rowsFromEntries(norm.entries)
      : [blankRow()],
  );
  const [mean, setMean] = useState<string>(norm?.mean?.toString() ?? "");
  const [sd, setSd] = useState<string>(norm?.sd?.toString() ?? "");
  const [cutoffs, setCutoffs] = useState<DraftCutoff[]>(
    (norm?.categoryCutoffs ?? []).map((c) => ({
      from: String(c.from),
      to: String(c.to),
      label: c.label,
    })),
  );

  // --- lanjutan ---
  const [sampleSize, setSampleSize] = useState<string>(
    norm?.sampleSize?.toString() ?? "",
  );
  const [source, setSource] = useState<string>(norm?.source ?? "");
  const [validFrom, setValidFrom] = useState<string>(dateOnly(norm?.validFrom));
  const [validUntil, setValidUntil] = useState<string>(
    dateOnly(norm?.validUntil),
  );

  // --- UI ---
  const [showCutoffs, setShowCutoffs] = useState<boolean>(
    (norm?.categoryCutoffs.length ?? 0) > 0,
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteErrors, setPasteErrors] = useState<string[]>([]);
  const [testRaw, setTestRaw] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);

  const markDirty = () => setDirty(true);
  const disabled = readOnly || isSubmitting;

  // --- analisis tabel ---
  const { errors: rowErrors, parsed } = useMemo(
    () => analyzeRows(rows),
    [rows],
  );

  const coverage = useMemo(() => {
    if (method !== "LOOKUP" || rMin === null || rMax === null) return null;
    return computeCoverage(
      parsed
        .filter((p) => p.std)
        .map((p) => ({ rawMin: p.rawMin, rawMax: p.rawMax })),
      rMin,
      rMax,
    );
  }, [method, parsed, rMin, rMax]);

  // --- uji konversi ---
  const testNum = toNum(testRaw);
  let testResult = "";
  let testIsGap = false;
  if (testNum !== null) {
    if (method === "LOOKUP") {
      const hit = parsed.find(
        (p) => p.std && testNum >= p.rawMin && testNum <= p.rawMax,
      );
      if (hit && hit.std) {
        testResult = `${target ?? ""} ${formatStandard(hit.std)}${hit.category ? ` · ${hit.category}` : ""}`;
      } else {
        testResult = "tidak ada norma (celah)";
        testIsGap = true;
      }
    } else {
      const m = toNum(mean);
      const s = toNum(sd);
      testResult =
        m !== null && s !== null && s > 0
          ? `z = ${((testNum - m) / s).toFixed(2)}`
          : "isi mean dan SD dulu";
    }
  }

  // -------------------------------------------------------------------------
  // HANDLER TABEL
  // -------------------------------------------------------------------------

  const updateRow = (index: number, patch: Partial<DraftRow>) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
    markDirty();
  };

  const addRow = () => {
    setRows((prev) => {
      const last = prev[prev.length - 1];
      const lastMax = last ? toNum(last.rawMax) : null;
      return [
        ...prev,
        { ...blankRow(), rawMin: lastMax !== null ? String(lastMax + 1) : "" },
      ];
    });
    markDirty();
  };

  const removeRow = (index: number) => {
    setRows((prev) =>
      prev.length <= 1 ? [blankRow()] : prev.filter((_, i) => i !== index),
    );
    markDirty();
  };

  const generateRows = () => {
    if (rMin === null || rMax === null) return;
    const span = rMax - rMin + 1;
    if (span < 1 || span > MAX_GENERATED_ROWS) {
      setErrors([
        `Rentang skor mentah terlalu besar untuk dibuat otomatis (maksimal ${MAX_GENERATED_ROWS} baris)`,
      ]);
      return;
    }
    if (
      hasData(rows) &&
      !window.confirm("Isi tabel saat ini akan diganti. Lanjutkan?")
    )
      return;
    setRows(
      Array.from({ length: span }, (_, i) => ({
        ...blankRow(),
        rawMin: String(rMin + i),
        rawMax: String(rMin + i),
      })),
    );
    setErrors([]);
    markDirty();
  };

  const applyPaste = (replace: boolean) => {
    const result = parsePaste(pasteText);
    setPasteErrors(result.errors);
    if (result.rows.length === 0) return;
    if (
      replace &&
      hasData(rows) &&
      !window.confirm("Isi tabel saat ini akan diganti. Lanjutkan?")
    )
      return;
    setRows((prev) =>
      replace
        ? result.rows
        : [...prev.filter((r) => hasData([r])), ...result.rows],
    );
    if (result.errors.length === 0) {
      setShowPaste(false);
      setPasteText("");
    }
    markDirty();
  };

  const updateCutoff = (index: number, patch: Partial<DraftCutoff>) => {
    setCutoffs((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    );
    markDirty();
  };

  // -------------------------------------------------------------------------
  // SUBMIT
  // -------------------------------------------------------------------------

  const buildPayload = (): NormPayload | null => {
    const errs: string[] = [];

    if (!name.trim()) errs.push("Nama norma wajib diisi");
    if (!normVersion.trim()) errs.push("Versi norma wajib diisi");
    if (!target) errs.push("Jenis skor skala ini tidak membutuhkan norma");

    const aMin = toNum(ageMin);
    const aMax = toNum(ageMax);
    if (
      ageMin.trim() &&
      (aMin === null || !Number.isInteger(aMin) || aMin < 0)
    ) {
      errs.push("Usia dari harus bilangan bulat tidak negatif");
    }
    if (
      ageMax.trim() &&
      (aMax === null || !Number.isInteger(aMax) || aMax < 0)
    ) {
      errs.push("Usia sampai harus bilangan bulat tidak negatif");
    }
    if (aMin !== null && aMax !== null && aMin > aMax) {
      errs.push("Usia dari tidak boleh lebih besar dari usia sampai");
    }

    let entries: NormEntryPayload[] = [];
    let meanValue: number | null = null;
    let sdValue: number | null = null;

    if (method === "LOOKUP") {
      if (parsed.length === 0) errs.push("Tabel konversi masih kosong");
      if (rowErrors.size > 0)
        errs.push(`Ada ${rowErrors.size} baris bermasalah (ditandai merah)`);
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
      meanValue = toNum(mean);
      sdValue = toNum(sd);
      if (meanValue === null) errs.push("Rata-rata (mean) wajib diisi");
      if (sdValue === null || sdValue <= 0)
        errs.push("Simpangan baku (SD) wajib diisi dan lebih dari 0");
    }

    const cutoffPayload: CategoryCutoff[] = [];
    cutoffs.forEach((c, i) => {
      if (!c.from.trim() && !c.to.trim() && !c.label.trim()) return;
      const f = toNum(c.from);
      const t = toNum(c.to);
      if (f === null || t === null || !c.label.trim()) {
        errs.push(
          `Batas kategori baris ${i + 1}: dari, sampai, dan label wajib diisi`,
        );
      } else if (f > t) {
        errs.push(
          `Batas kategori baris ${i + 1}: dari tidak boleh lebih besar dari sampai`,
        );
      } else {
        cutoffPayload.push({ from: f, to: t, label: c.label.trim() });
      }
    });

    const ss = toNum(sampleSize);
    if (sampleSize.trim() && (ss === null || !Number.isInteger(ss) || ss < 1)) {
      errs.push("Ukuran sampel harus bilangan bulat minimal 1");
    }
    if (validFrom && validUntil && validFrom > validUntil) {
      errs.push("Berlaku dari tidak boleh setelah berlaku sampai");
    }

    if (errs.length > 0 || !target) {
      setErrors(errs);
      return null;
    }
    setErrors([]);

    return {
      ...(isEdit ? {} : { scaleId: scale.id }),
      normVersion: normVersion.trim(),
      name: name.trim(),
      targetScoreType: target,
      method,
      criteria: { ageMin: aMin, ageMax: aMax, gender, education },
      entries,
      mean: meanValue,
      sd: sdValue,
      categoryCutoffs: cutoffPayload,
      sampleSize: ss,
      source: source.trim() || null,
      validFrom: toIso(validFrom),
      validUntil: toIso(validUntil),
    };
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    const onSubmit = async (payload: NormPayload): Promise<boolean> => {
      try {
        if (mode === "edit" && norm) {
          const { scaleId: _omit, ...rest } = payload;
          await updateMutation.mutateAsync({
            normId: norm.id,
            payload: rest,
          });
        } else {
          await createMutation.mutateAsync(payload);
        }
        return true;
      } catch {
        return false;
      }
    };
    e.preventDefault();
    if (readOnly) return;
    const payload = buildPayload();
    if (!payload) return;
    setIsSubmitting(true);
    try {
      const ok = await onSubmit(payload);
      if (ok) setDirty(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // ALASAN AKTIFKAN DINONAKTIFKAN
  // -------------------------------------------------------------------------

  let activateBlocked: string | null = null;
  if (dirty) activateBlocked = "Simpan perubahan dulu sebelum mengaktifkan";
  else if (rowErrors.size > 0)
    activateBlocked = "Masih ada baris yang bermasalah";
  else if (coverage && !coverage.covered) {
    activateBlocked = `Skor mentah ${formatGaps(coverage.gaps)} belum punya konversi`;
  }

  // -------------------------------------------------------------------------
  // TAMPILAN
  // -------------------------------------------------------------------------

  return (
    <form
      onSubmit={handleSubmit}
      onChange={markDirty}
      className="flex flex-col"
      noValidate
    >
      <div className="max-h-[63.5vh] space-y-5 overflow-y-auto p-4">
        {readOnly && (
          <Alert severity="warning" variant="standard">
            <AlertTitle>Tes ini tidak berstatus DRAFT</AlertTitle>
            <AlertDescription>
              {status === "DRAFT" || !status
                ? "Tes ini sudah diarsipkan, jadi norma tidak bisa diubah."
                : `Norma berstatus ${status} tidak bisa diubah. Gunakan "Salin sebagai versi baru" untuk menggantinya.`}
            </AlertDescription>
          </Alert>
        )}

        {/* IDENTITAS */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_120px_minmax(0,180px)]">
          <div>
            <Label
              htmlFor="norm-name"
              required
              tooltip="Nama yang dilihat admin. Contoh: Norma TIU 5 Umum, atau Norma IST SE usia 25-29."
            >
              Nama norma
            </Label>
            <Input
              id="norm-name"
              type="text"
              value={name}
              disabled={disabled}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label
              htmlFor="norm-version"
              required
              tooltip="Dicatat di setiap hasil agar hasil lama bisa dihitung ulang. Contoh: 2024.1."
              className="whitespace-nowrap"
            >
              Versi norma
            </Label>
            <Input
              id="norm-version"
              type="text"
              value={normVersion}
              disabled={disabled}
              onChange={(e) => setNormVersion(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label
              htmlFor="norm-target"
              tooltip="Jenis skor hasil konversi. Diturunkan otomatis dari jenis skor skala, jadi tidak bisa salah."
            >
              Skor tujuan
            </Label>
            <Input
              id="norm-target"
              type="text"
              value={target ? (TARGET_LABEL[target] ?? target) : "-"}
              disabled
              className="w-full"
            />
          </div>
        </div>

        {/* KELOMPOK PEMBANDING */}
        <div>
          <Label tooltip="Norma ini dipakai untuk peserta yang sesuai kelompok ini (usia, jenis kelamin, pendidikan). Kosongkan untuk berlaku bagi semua.">
            Kelompok pembanding
          </Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <Label className="text-xs font-normal capitalize">
                Usia dari
              </Label>
              <Input
                type="number"
                min="0"
                value={ageMin}
                disabled={disabled}
                onChange={(e) => setAgeMin(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-xs font-normal capitalize">
                Usia sampai
              </Label>
              <Input
                type="number"
                min="0"
                value={ageMax}
                disabled={disabled}
                onChange={(e) => setAgeMax(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-xs font-normal capitalize">
                Jenis kelamin
              </Label>
              <Select
                value={gender}
                disabled={disabled}
                onChange={(e) => setGender(e.target.value as NormGender)}
                className="w-full"
                aria-label="Jenis kelamin"
              >
                <option value="ANY">Semua</option>
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-normal capitalize">
                Pendidikan
              </Label>
              <Select
                value={education}
                disabled={disabled}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full"
                aria-label="Pendidikan"
              >
                <option value="ANY">Semua</option>
                {NORM_EDUCATION.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* METODE */}
        <div className="space-y-3 border-t border-divider pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label tooltip="Tabel = daftar baris skor mentah ke skor standar. Mean/SD = norma berupa rata-rata dan simpangan baku.">
              Isi konversi
            </Label>
            <div className="inline-flex overflow-hidden rounded-lg border border-divider text-sm">
              {(["LOOKUP", "MEAN_SD"] as NormMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setMethod(m);
                    markDirty();
                  }}
                  className={`px-3 py-1.5 ${
                    method === m
                      ? "bg-primary-main/10 text-primary-main"
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {m === "LOOKUP" ? "Tabel" : "Mean / SD"}
                </button>
              ))}
            </div>
          </div>

          {method === "LOOKUP" ? (
            <>
              {!readOnly && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPaste((v) => !v)}
                  >
                    Tempel dari spreadsheet
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={generateRows}
                    disabled={!hasRange}
                  >
                    Buat baris per skor
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={addRow}
                    startIcon={<Plus size={16} />}
                  >
                    Baris
                  </Button>
                </div>
              )}
              {!hasRange && (
                <p className="mt-1 text-xs text-text-secondary">
                  Skala ini belum punya rentang skor mentah, jadi cakupan tidak
                  bisa diperiksa dan &quot;Buat baris per skor&quot; tidak
                  tersedia. Isi di tab Scales.
                </p>
              )}

              {showPaste && !readOnly && (
                <div className="space-y-2 rounded-xl border border-divider p-3">
                  <p className="mt-1 text-xs text-text-secondary">
                    Satu baris per konversi. Kolom: skor mentah (24 atau 23-24),
                    skor standar (14 atau 17-20), kategori (opsional), persentil
                    (opsional). Pisahkan dengan tab (salinan dari spreadsheet),
                    titik koma, atau koma. Baris judul di atas diabaikan.
                  </p>
                  <Textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    rows={6}
                    spellCheck={false}
                    placeholder={"29-30\t17-20\tBS\n27-28\t16\tB"}
                    className="font-mono"
                  />
                  {pasteErrors.length > 0 && (
                    <ul className="list-disc space-y-0.5 pl-4 text-xs text-error-main">
                      {pasteErrors.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => applyPaste(true)}
                    >
                      Ganti isi tabel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outlined"
                      onClick={() => applyPaste(false)}
                    >
                      Tambahkan ke tabel
                    </Button>
                  </div>
                </div>
              )}

              <div className="max-h-80 overflow-auto rounded-lg border border-divider">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-white text-xs text-text-secondary dark:bg-gray-900">
                    <tr>
                      <th className="px-2 py-2 font-medium">Mentah dari</th>
                      <th className="px-2 py-2 font-medium">sampai</th>
                      <th className="px-2 py-2 font-medium">Skor standar</th>
                      <th className="px-2 py-2 font-medium">Kategori</th>
                      <th className="px-2 py-2 font-medium">Persentil</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => {
                      const problem = rowErrors.get(i);
                      return (
                        <tr
                          key={i}
                          title={problem}
                          className={problem ? "bg-error-main/10" : undefined}
                        >
                          <td className="px-1 py-1">
                            <Input
                              type="number"
                              value={r.rawMin}
                              readOnly={readOnly}
                              onChange={(e) =>
                                updateRow(i, { rawMin: e.target.value })
                              }
                              size="sm"
                              className="w-full"
                              aria-label={`Mentah dari, baris ${i + 1}`}
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Input
                              type="number"
                              value={r.rawMax}
                              readOnly={readOnly}
                              onChange={(e) =>
                                updateRow(i, { rawMax: e.target.value })
                              }
                              size="sm"
                              className="w-full"
                              aria-label={`Mentah sampai, baris ${i + 1}`}
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Input
                              type="text"
                              value={r.standard}
                              readOnly={readOnly}
                              placeholder="14 atau 17-20"
                              onChange={(e) =>
                                updateRow(i, { standard: e.target.value })
                              }
                              size="sm"
                              className="w-full"
                              aria-label={`Skor standar, baris ${i + 1}`}
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Input
                              type="text"
                              value={r.category}
                              readOnly={readOnly}
                              onChange={(e) =>
                                updateRow(i, { category: e.target.value })
                              }
                              size="sm"
                              className="w-full"
                              aria-label={`Kategori, baris ${i + 1}`}
                            />
                          </td>
                          <td className="px-1 py-1">
                            <Input
                              type="number"
                              value={r.percentile}
                              readOnly={readOnly}
                              onChange={(e) =>
                                updateRow(i, { percentile: e.target.value })
                              }
                              size="sm"
                              className="w-full"
                              aria-label={`Persentil, baris ${i + 1}`}
                            />
                          </td>
                          <td className="px-1 py-1 text-center">
                            {!readOnly && (
                              <IconButton
                                type="button"
                                onClick={() => removeRow(i)}
                                size="sm"
                                aria-label={`Hapus baris ${i + 1}`}
                                variant="ghost"
                                color="error"
                              >
                                <X size={16} />
                              </IconButton>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {rowErrors.size > 0 && (
                <p className="text-xs text-error-main">
                  {rowErrors.size} baris bermasalah. Arahkan kursor ke baris
                  merah untuk melihat sebabnya.
                </p>
              )}

              {/* CAKUPAN */}
              {coverage && rMin !== null && rMax !== null && (
                <div>
                  <p className="mb-1 text-xs text-text-secondary">
                    Cakupan skor mentah {rMin}-{rMax}
                  </p>
                  <div className="flex h-3 overflow-hidden rounded-md border border-divider">
                    {coverage.segments.map((s) => (
                      <div
                        key={`${s.from}-${s.to}`}
                        style={{ flex: s.to - s.from + 1 }}
                        title={`${s.from}-${s.to}: ${s.covered ? "tercakup" : "belum ada konversi"}`}
                        className={
                          s.covered ? "bg-green-500/60" : "bg-yellow-500"
                        }
                      />
                    ))}
                  </div>
                  {coverage.covered ? (
                    <p className="mt-1 text-xs text-green-700">
                      Seluruh rentang skor mentah tercakup.
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-yellow-700">
                      Celah: skor mentah {formatGaps(coverage.gaps)} belum punya
                      konversi. Norma belum bisa diaktifkan.
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="norm-mean"
                    required
                    tooltip="Rata-rata skor mentah kelompok pembanding."
                  >
                    Rata-rata (mean)
                  </Label>
                  <Input
                    id="norm-mean"
                    type="number"
                    step="any"
                    value={mean}
                    disabled={disabled}
                    onChange={(e) => setMean(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="norm-sd"
                    required
                    tooltip="Simpangan baku skor mentah kelompok pembanding. Harus lebih dari 0."
                  >
                    Simpangan baku (SD)
                  </Label>
                  <Input
                    id="norm-sd"
                    type="number"
                    step="any"
                    value={sd}
                    disabled={disabled}
                    onChange={(e) => setSd(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                Skor mentah diubah menjadi z-score. Cara z-score menjadi{" "}
                {target ? (TARGET_LABEL[target] ?? target) : "skor tujuan"}{" "}
                ditentukan oleh scorer, bukan oleh norma ini.
              </p>
            </div>
          )}

          {/* UJI KONVERSI */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-black/3 px-3 py-2 text-sm dark:bg-white/5">
            <span className="font-medium">Uji konversi</span>
            <span>skor mentah</span>
            <Input
              type="number"
              value={testRaw}
              onChange={(e) => setTestRaw(e.target.value)}
              aria-label="Skor mentah untuk diuji"
              size="sm"
              className="w-20"
            />
            {testResult && (
              <>
                <span>menjadi</span>
                <span className={testIsGap ? "text-yellow-700" : "font-medium"}>
                  {testResult}
                </span>
              </>
            )}
          </div>
        </div>

        {/* BATAS KATEGORI */}
        <div className="border-t border-divider pt-3">
          <button
            type="button"
            onClick={() => setShowCutoffs((v) => !v)}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            {showCutoffs ? "▾" : "▸"} Batas kategori (opsional)
          </button>
          {showCutoffs && (
            <div className="mt-3 space-y-2">
              <p className="mt-1 text-xs text-text-secondary">
                Batas kategori pada skor standar. Contoh TIU 5: BS = 17 sampai
                20, B = 13 sampai 16.
              </p>
              {cutoffs.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={c.from}
                    readOnly={readOnly}
                    placeholder="Dari"
                    onChange={(e) => updateCutoff(i, { from: e.target.value })}
                    size="sm"
                    className="w-full"
                    aria-label={`Batas kategori ${i + 1} dari`}
                  />
                  <Input
                    type="number"
                    value={c.to}
                    readOnly={readOnly}
                    placeholder="Sampai"
                    onChange={(e) => updateCutoff(i, { to: e.target.value })}
                    size="sm"
                    className="w-full"
                    aria-label={`Batas kategori ${i + 1} sampai`}
                  />
                  <Input
                    type="text"
                    value={c.label}
                    readOnly={readOnly}
                    placeholder="Label (BS, B, S...)"
                    onChange={(e) => updateCutoff(i, { label: e.target.value })}
                    size="sm"
                    className="w-full"
                    aria-label={`Label batas kategori ${i + 1}`}
                  />
                  {!readOnly && (
                    <div>
                      <IconButton
                        type="button"
                        onClick={() => {
                          setCutoffs((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          );
                          markDirty();
                        }}
                        className="text-text-secondary hover:text-error-main"
                        aria-label={`Hapus batas kategori ${i + 1}`}
                        size="sm"
                        color="error"
                        variant="ghost"
                      >
                        <X size={16} />
                      </IconButton>
                    </div>
                  )}
                </div>
              ))}
              {!readOnly && (
                <div className="text-right">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    startIcon={<Plus size={16} />}
                    onClick={() => {
                      setCutoffs((prev) => [
                        ...prev,
                        { from: "", to: "", label: "" },
                      ]);
                      markDirty();
                    }}
                  >
                    Batas
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* LANJUTAN */}
        <div className="border-t border-divider pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            {showAdvanced ? "▾" : "▸"} Lanjutan (sumber, ukuran sampel, masa
            berlaku)
          </button>
          {showAdvanced && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
                <div>
                  <Label
                    htmlFor="norm-source"
                    tooltip="Dari mana norma ini berasal. Contoh: Manual TIU 5, LPSP3 Fakultas Psikologi UI."
                  >
                    Sumber norma
                  </Label>
                  <Input
                    id="norm-source"
                    type="text"
                    value={source}
                    disabled={disabled}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="norm-sample"
                    tooltip="Jumlah orang pada sampel norma, sebagai bukti kualitas."
                    className="whitespace-nowrap"
                  >
                    Ukuran sampel
                  </Label>
                  <Input
                    id="norm-sample"
                    type="number"
                    min="1"
                    value={sampleSize}
                    disabled={disabled}
                    onChange={(e) => setSampleSize(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="norm-from"
                    tooltip="Awal masa berlaku. Kosongkan untuk berlaku sejak disimpan."
                  >
                    Berlaku dari
                  </Label>
                  <InputDate
                    id="norm-from"
                    type="date"
                    value={validFrom}
                    disabled={disabled}
                    onChange={(e) => setValidFrom(e.target.value)}
                    isClearable
                    fullWidth
                  />
                </div>
                <div>
                  <Label
                    htmlFor="norm-until"
                    tooltip="Akhir masa berlaku. Kosongkan jika tanpa akhir."
                  >
                    Berlaku sampai
                  </Label>
                  <InputDate
                    id="norm-until"
                    type="date"
                    value={validUntil}
                    disabled={disabled}
                    onChange={(e) => setValidUntil(e.target.value)}
                    isClearable
                    fullWidth
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KETERANGAN OTOMATIS */}
      <div className="space-y-1 border-t border-divider bg-black/2 px-4 py-3 text-xs text-text-secondary">
        <p className="font-medium">Tidak diisi di form ini (diatur server):</p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>
            <span className="font-mono">testId</span> (dari URL) dan{" "}
            <span className="font-mono">scaleId</span> ({scale.code}) mengarah
            ke <span className="font-mono">test_definitions</span> dan{" "}
            <span className="font-mono">test_scales</span>
          </li>
          <li>
            <span className="font-mono">sectionId</span> diisi dari section
            milik skala, <span className="font-mono">status</span> awal selalu
            DRAFT
          </li>
        </ul>
      </div>

      {/* ERROR */}
      {errors.length > 0 && (
        <div className="mx-4 mt-3 rounded-xl border border-error-main/40 bg-error-main/5 px-4 py-3 text-sm text-error-main">
          <ul className="list-disc space-y-0.5 pl-4">
            {errors.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-divider p-4">
        <div>
          {isEdit && status === "DRAFT" && !readOnly && canDelete && norm && (
            <DialogConfirmAction
              title="Hapus Norma"
              description={`Yakin ingin menghapus norma ${norm?.name ?? ""}?`}
              onConfirm={() => deleteMutation.mutate(norm.id)}
              trigger={(open) => (
                <Button type="button" variant="outlined" onClick={open}>
                  Hapus
                </Button>
              )}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {readOnly ? "Tutup" : "Batal"}
          </Button>

          {readOnly && status === "ACTIVE" && canArchive && norm && (
            <DialogConfirmAction
              title="Arsipkan Norma"
              description="Norma yang diarsipkan tidak dipakai lagi untuk perhitungan baru. Hasil lama tetap menunjuk versi norma ini."
              onConfirm={() => archiveMutation.mutate(norm.id)}
              trigger={(open) => (
                <Button type="button" onClick={open}>
                  Arsipkan
                </Button>
              )}
            />
          )}

          {!readOnly && (
            <Button type="submit" variant="outlined" disabled={isSubmitting}>
              {isSubmitting
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan perubahan"
                  : "Simpan draf"}
            </Button>
          )}

          {!readOnly && isEdit && status === "DRAFT" && canActivate && norm && (
            <DialogConfirmAction
              title="Aktifkan Norma"
              description="Setelah aktif, norma ini dipakai untuk perhitungan dan tidak bisa diubah lagi. Server akan memeriksa kelengkapan dan tumpang tindih dengan norma aktif lain."
              onConfirm={() => activateMutation.mutate(norm.id)}
              trigger={(open) => (
                <Button
                  type="button"
                  onClick={open}
                  disabled={activateBlocked !== null || isSubmitting}
                >
                  Aktifkan
                </Button>
              )}
            />
          )}
        </div>
      </div>
      {!readOnly && isEdit && status === "DRAFT" && activateBlocked && (
        <p className="px-4 pb-3 text-right text-xs text-text-secondary">
          Aktifkan belum tersedia: {activateBlocked}.
        </p>
      )}
    </form>
  );
}
