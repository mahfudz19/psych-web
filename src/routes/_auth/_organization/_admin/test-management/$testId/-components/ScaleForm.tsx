import React, { useState } from "react";
import Button from "../../../../../../../components/ui/Button";
import Input from "../../../../../../../components/ui/Input";
import Select from "../../../../../../../components/ui/Select";
import Tabs from "../../../../../../../components/ui/Tabs";
import Tab from "../../../../../../../components/ui/Tabs/Tab";
import TabContent from "../../../../../../../components/ui/Tabs/TabContent";
import { FIELD_CLASS, FieldLabel, HelpText } from "./FormParts";

// ---------------------------------------------------------------------------
// TIPE
// ---------------------------------------------------------------------------

export type ScaleType =
  "DIMENSION" | "FACET" | "SUBTEST" | "VALIDITY" | "COMPOSITE" | "TYPE_POLE";
export type ScaleRole =
  "PERFORMANCE" | "EXPECTATION" | "IMPORTANCE" | "REFLECTION";
export type ScoreType =
  | "RAW_ONLY"
  | "RAW_AVERAGE"
  | "RAW_TO_SW"
  | "RAW_TO_WS"
  | "RAW_TO_IQ"
  | "RAW_TO_T"
  | "RAW_TO_STEN"
  | "RAW_TO_PERCENTILE"
  | "IPSATIVE"
  | "RANK_SUM";
export type CompositeMethod = "SUM" | "MEAN";

/**
 * Body request ke collection `test_scales`.
 * - POST /tests/{testId}/scales          -> semua field, termasuk `code`
 * - PUT  /tests/{testId}/scales/{id}     -> tanpa `code` (kode tidak bisa diubah)
 */
export interface ScalePayload {
  code?: string;
  name: string;
  type: ScaleType;
  role: ScaleRole;
  parentScaleId: string | null;
  sectionId: string | null;
  order: number | null;
  description: string;
  lowLabel: string | null;
  highLabel: string | null;
  rawMin: number | null;
  rawMax: number | null;
  scoreType: ScoreType;
  composite: { sourceScaleCodes: string[]; method: CompositeMethod } | null;
  isReported: boolean;
  isValidityScale: boolean;
  color: string | null;
}

/** Data awal untuk mode edit. Semua opsional agar cocok dengan tipe scale dari API. */
export interface ScaleFormInitial {
  id?: string;
  code?: string;
  name?: string;
  type?: string | null;
  role?: string | null;
  parentScaleId?: string | null;
  sectionId?: string | null;
  order?: number | null;
  description?: string | null;
  lowLabel?: string | null;
  highLabel?: string | null;
  rawMin?: number | null;
  rawMax?: number | null;
  scoreType?: string | null;
  composite?: Record<string, unknown> | null;
  isReported?: boolean | null;
  isValidityScale?: boolean | null;
  color?: string | null;
}

export interface SectionOption {
  id: string;
  code: string;
  name: string;
}

export interface ScaleOption {
  id: string;
  code: string;
  name: string;
  parentScaleId?: string | null;
}

interface Props {
  scale?: ScaleFormInitial;
  /** Section milik tes ini, untuk pilihan "Section" */
  sections: SectionOption[];
  /** Semua skala milik tes ini, untuk pilihan skala induk dan sumber skor gabungan */
  scales: ScaleOption[];
  onSubmit: (payload: ScalePayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

// ---------------------------------------------------------------------------
// KONSTANTA
// ---------------------------------------------------------------------------

const COLLECTION = "test_scales";
const CODE_PATTERN = /^[A-Za-z0-9_]{1,30}$/;
const COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

const SCALE_TYPES: { value: ScaleType; label: string; hint: string }[] = [
  {
    value: "DIMENSION",
    label: "Dimensi (DIMENSION)",
    hint: "Faktor utama yang diukur. Contoh: O, C, E, A, N pada Big Five.",
  },
  {
    value: "FACET",
    label: "Facet (FACET)",
    hint: "Sub-aspek di bawah dimensi. Pilih skala induknya di bawah.",
  },
  {
    value: "SUBTEST",
    label: "Subtes (SUBTEST)",
    hint: "Skala yang sama dengan satu section. Wajib memilih section. Contoh: SE, WA pada IST, atau TOTAL pada TIU 5.",
  },
  {
    value: "VALIDITY",
    label: "Validitas (VALIDITY)",
    hint: "Skala untuk memeriksa kejujuran atau konsistensi jawaban. Contoh: L, F, K pada MMPI.",
  },
  {
    value: "COMPOSITE",
    label: "Gabungan (COMPOSITE)",
    hint: "Gabungan dari skala lain. Wajib memilih skala sumber. Contoh: total IST.",
  },
  {
    value: "TYPE_POLE",
    label: "Kutub Tipe (TYPE_POLE)",
    hint: "Salah satu kutub pada tes tipologi. Contoh: E dan I pada MBTI.",
  },
];

const ROLES: { value: ScaleRole; label: string }[] = [
  { value: "PERFORMANCE", label: "Kinerja (PERFORMANCE)" },
  { value: "EXPECTATION", label: "Ekspektasi (EXPECTATION)" },
  { value: "IMPORTANCE", label: "Kepentingan (IMPORTANCE)" },
  { value: "REFLECTION", label: "Refleksi (REFLECTION)" },
];

const SCORE_TYPES: { value: ScoreType; label: string }[] = [
  { value: "RAW_ONLY", label: "Skor mentah saja (RAW_ONLY)" },
  { value: "RAW_AVERAGE", label: "Rata-rata skor mentah (RAW_AVERAGE)" },
  { value: "RAW_TO_SW", label: "Mentah ke Skor Standar (RAW_TO_SW)" },
  { value: "RAW_TO_WS", label: "Mentah ke Nilai Bobot (RAW_TO_WS)" },
  { value: "RAW_TO_IQ", label: "Mentah ke IQ (RAW_TO_IQ)" },
  { value: "RAW_TO_T", label: "Mentah ke T-Score (RAW_TO_T)" },
  { value: "RAW_TO_STEN", label: "Mentah ke Sten (RAW_TO_STEN)" },
  {
    value: "RAW_TO_PERCENTILE",
    label: "Mentah ke Persentil (RAW_TO_PERCENTILE)",
  },
  { value: "IPSATIVE", label: "Ipsatif / pilihan paksa (IPSATIVE)" },
  { value: "RANK_SUM", label: "Jumlah peringkat (RANK_SUM)" },
];

// ---------------------------------------------------------------------------
// PEMBANTU
// ---------------------------------------------------------------------------

/** Semua turunan (anak, cucu, dst.) dari sebuah skala. Dipakai agar induk tidak membentuk siklus. */
function collectDescendants(scales: ScaleOption[], rootId: string) {
  const result = new Set<string>();
  const queue = [rootId];
  while (queue.length > 0) {
    const current = queue.shift() as string;
    for (const s of scales) {
      if (s.parentScaleId === current && !result.has(s.id)) {
        result.add(s.id);
        queue.push(s.id);
      }
    }
  }
  return result;
}

function readSourceCodes(composite?: Record<string, unknown> | null): string[] {
  const raw = composite?.sourceScaleCodes;
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

// ---------------------------------------------------------------------------
// FORM
// ---------------------------------------------------------------------------

export default function ScaleForm({
  scale,
  sections,
  scales,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: Props) {
  const isEdit = Boolean(scale);
  const [activeTab, setActiveTab] = useState<string>("dasar");
  const [type, setType] = useState<ScaleType>(
    (scale?.type as ScaleType | undefined) ?? "DIMENSION",
  );
  const [isValidityScale, setIsValidityScale] = useState<boolean>(
    scale?.isValidityScale ?? false,
  );
  const [sourceCodes, setSourceCodes] = useState<string[]>(
    readSourceCodes(scale?.composite),
  );
  const [compositeMethod, setCompositeMethod] = useState<CompositeMethod>(
    scale?.composite?.method === "MEAN" ? "MEAN" : "SUM",
  );
  const [errors, setErrors] = useState<string[]>([]);

  // Skala induk: bukan dirinya sendiri dan bukan turunannya.
  const excluded = scale?.id
    ? new Set([scale.id, ...collectDescendants(scales, scale.id)])
    : new Set<string>();
  const parentOptions = scales.filter((s) => !excluded.has(s.id));

  // Sumber skor gabungan: semua skala selain dirinya sendiri.
  const sourceOptions = scales.filter((s) => s.id !== scale?.id);

  const typeHint = SCALE_TYPES.find((t) => t.value === type)?.hint;

  const handleTypeChange = (value: ScaleType) => {
    setType(value);
    if (value === "VALIDITY") setIsValidityScale(true);
  };

  const toggleSource = (code: string) =>
    setSourceCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs: string[] = [];
    const str = (key: string) => String(fd.get(key) ?? "").trim();

    /** Bilangan bulat opsional. Kosong menjadi null. */
    const intOrNull = (key: string, label: string): number | null => {
      const raw = str(key);
      if (raw === "") return null;
      const n = Number(raw);
      if (!Number.isInteger(n)) {
        errs.push(`${label} harus berupa bilangan bulat`);
        return null;
      }
      return n;
    };

    // --- kode (hanya saat create) ---
    const code = str("code");
    if (!isEdit && !CODE_PATTERN.test(code)) {
      errs.push(
        "Kode wajib diisi: huruf, angka, dan underscore (1-30 karakter)",
      );
    }

    // --- nama ---
    const name = str("name");
    if (!name) errs.push("Nama aspek wajib diisi");

    // --- relasi ---
    const sectionId = str("sectionId") || null;
    if (type === "SUBTEST" && !sectionId) {
      errs.push("Skala bertipe SUBTEST wajib memilih section");
    }
    const parentScaleId = str("parentScaleId") || null;

    // --- gabungan ---
    let composite: ScalePayload["composite"] = null;
    if (type === "COMPOSITE") {
      if (sourceCodes.length === 0) {
        errs.push(
          "Skala bertipe COMPOSITE wajib memilih minimal satu skala sumber",
        );
      } else {
        composite = { sourceScaleCodes: sourceCodes, method: compositeMethod };
      }
    }

    // --- rentang skor ---
    const rawMin = intOrNull("rawMin", "Skor mentah minimum");
    const rawMax = intOrNull("rawMax", "Skor mentah maksimum");
    if (rawMin !== null && rawMax !== null && rawMin > rawMax) {
      errs.push("Skor mentah minimum tidak boleh lebih besar dari maksimum");
    }

    // --- urutan ---
    const order = intOrNull("order", "Urutan");

    // --- warna ---
    const color = str("color") || null;
    if (color && !COLOR_PATTERN.test(color)) {
      errs.push("Warna harus berformat hex #RRGGBB, contoh #4F46E5");
    }

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);

    const payload: ScalePayload = {
      ...(isEdit ? {} : { code }),
      name,
      type,
      role: str("role") as ScaleRole,
      parentScaleId,
      sectionId,
      order,
      description: String(fd.get("description") ?? ""),
      lowLabel: str("lowLabel") || null,
      highLabel: str("highLabel") || null,
      rawMin,
      rawMax,
      scoreType: str("scoreType") as ScoreType,
      composite,
      isReported: fd.get("isReported") === "on",
      isValidityScale,
      color,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-h-[75vh]">
      {/* TABS */}
      <div className="px-4 pt-4 pb-2 border-b border-divider">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tab value="dasar" label="Dasar" />
          <Tab value="pengukuran" label="Pengukuran" />
          <Tab value="tampilan" label="Tampilan & Lanjutan" />
        </Tabs>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {/* TAB 1: DASAR */}
        <TabContent value="dasar" activeValue={activeTab} keepMounted>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel
                  htmlFor="code"
                  label="Kode Skala"
                  required={!isEdit}
                  collection={COLLECTION}
                  field="code"
                  tooltip="Kunci skala, unik dalam satu tes dan tidak bisa diubah. Skala gabungan merujuk skala lain lewat kode ini. Contoh: TOTAL, E, SE, Hs."
                />
                <Input
                  id="code"
                  name="code"
                  type="text"
                  defaultValue={scale?.code}
                  placeholder="Contoh: TOTAL"
                  disabled={isEdit}
                  className="w-full"
                />
                <HelpText>
                  Huruf, angka, underscore. Maksimal 30 karakter.
                </HelpText>
              </div>
              <div>
                <FieldLabel
                  htmlFor="name"
                  label="Nama Aspek"
                  required
                  collection={COLLECTION}
                  field="name"
                  tooltip="Nama skala yang tampil di laporan hasil. Contoh: Extraversion, Skor Total TIU 5."
                />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={scale?.name}
                  placeholder="Contoh: Extraversion"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <FieldLabel
                htmlFor="type"
                label="Tipe Skala"
                required
                collection={COLLECTION}
                field="type"
                tooltip="Jenis skala. Menentukan isian yang wajib: SUBTEST butuh section, COMPOSITE butuh skala sumber."
              />
              <Select
                id="type"
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as ScaleType)}
                className={FIELD_CLASS}
              >
                {SCALE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
              {typeHint && <HelpText>{typeHint}</HelpText>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel
                  htmlFor="sectionId"
                  label="Section"
                  required={type === "SUBTEST"}
                  collection={COLLECTION}
                  field="sectionId"
                  tooltip="Section yang dinilai skala ini. Wajib untuk tipe SUBTEST. Section otomatis mencatat skala ini di scaleIds miliknya."
                />
                <Select
                  id="sectionId"
                  name="sectionId"
                  defaultValue={scale?.sectionId ?? ""}
                  className={FIELD_CLASS}
                >
                  <option value="">-- Tidak terhubung --</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </Select>
                {sections.length === 0 && (
                  <HelpText>
                    Belum ada section. Buat section dulu di tab Sections.
                  </HelpText>
                )}
              </div>
              <div>
                <FieldLabel
                  htmlFor="parentScaleId"
                  label="Skala Induk"
                  collection={COLLECTION}
                  field="parentScaleId"
                  tooltip="Untuk hierarki, misalnya facet di bawah dimensi. Kosongkan jika skala ini berdiri sendiri."
                />
                <Select
                  id="parentScaleId"
                  name="parentScaleId"
                  defaultValue={scale?.parentScaleId ?? ""}
                  className={FIELD_CLASS}
                >
                  <option value="">-- Tanpa induk --</option>
                  {parentOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Skala sumber, hanya untuk COMPOSITE */}
            {type === "COMPOSITE" && (
              <div className="rounded-2xl border border-divider p-4 space-y-3">
                <FieldLabel
                  label="Skala Sumber"
                  required
                  collection={COLLECTION}
                  field="composite.sourceScaleCodes"
                  tooltip="Skala yang digabung. Buat skala sumber lebih dulu. Disimpan berdasarkan kode skala."
                />
                {sourceOptions.length === 0 ? (
                  <HelpText>
                    Belum ada skala lain. Buat skala sumber dulu, lalu kembali
                    ke sini.
                  </HelpText>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                    {sourceOptions.map((s) => (
                      <label
                        key={s.id}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={sourceCodes.includes(s.code)}
                          onChange={() => toggleSource(s.code)}
                          className="w-4 h-4 rounded border-divider text-primary-main focus:ring-primary-main/20 accent-primary-main"
                        />
                        <span className="font-mono text-xs">{s.code}</span>
                        <span>{s.name}</span>
                      </label>
                    ))}
                  </div>
                )}

                <div>
                  <FieldLabel
                    htmlFor="compositeMethod"
                    label="Cara Menggabungkan"
                    collection={COLLECTION}
                    field="composite.method"
                    tooltip="SUM = dijumlahkan. MEAN = dirata-rata."
                  />
                  <Select
                    id="compositeMethod"
                    value={compositeMethod}
                    onChange={(e) =>
                      setCompositeMethod(e.target.value as CompositeMethod)
                    }
                    className={FIELD_CLASS}
                  >
                    <option value="SUM">Jumlah (SUM)</option>
                    <option value="MEAN">Rata-rata (MEAN)</option>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </TabContent>

        {/* TAB 2: PENGUKURAN */}
        <TabContent value="pengukuran" activeValue={activeTab} keepMounted>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel
                  htmlFor="rawMin"
                  label="Skor Mentah Minimum"
                  collection={COLLECTION}
                  field="rawMin"
                  tooltip="Nilai terendah yang mungkin. Dipakai untuk memeriksa kelengkapan norma dan sumbu grafik."
                />
                <Input
                  id="rawMin"
                  name="rawMin"
                  type="number"
                  defaultValue={scale?.rawMin ?? ""}
                  placeholder="Contoh: 0"
                  className="w-full"
                />
              </div>
              <div>
                <FieldLabel
                  htmlFor="rawMax"
                  label="Skor Mentah Maksimum"
                  collection={COLLECTION}
                  field="rawMax"
                  tooltip="Nilai tertinggi yang mungkin. Contoh: 30 soal benar/salah = 30. 10 soal Likert 1-5 = 50."
                />
                <Input
                  id="rawMax"
                  name="rawMax"
                  type="number"
                  defaultValue={scale?.rawMax ?? ""}
                  placeholder="Contoh: 30"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <FieldLabel
                htmlFor="scoreType"
                label="Jenis Skor"
                collection={COLLECTION}
                field="scoreType"
                tooltip="Cara skor mentah diolah. Pilihan RAW_TO_... membutuhkan tabel norma di tab Norms. RAW_AVERAGE dan RAW_ONLY tidak butuh norma."
              />
              <Select
                id="scoreType"
                name="scoreType"
                defaultValue={scale?.scoreType ?? "RAW_ONLY"}
                className={FIELD_CLASS}
              >
                {SCORE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
              <HelpText>
                Pilihan yang diawali RAW_TO butuh norma. Isi skor mentah minimum
                dan maksimum agar kelengkapan norma bisa diperiksa.
              </HelpText>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel
                  htmlFor="lowLabel"
                  label="Label Kutub Rendah"
                  collection={COLLECTION}
                  field="lowLabel"
                  tooltip="Teks di ujung rendah grafik. Contoh: Introvert."
                />
                <Input
                  id="lowLabel"
                  name="lowLabel"
                  type="text"
                  defaultValue={scale?.lowLabel ?? ""}
                  className="w-full"
                />
              </div>
              <div>
                <FieldLabel
                  htmlFor="highLabel"
                  label="Label Kutub Tinggi"
                  collection={COLLECTION}
                  field="highLabel"
                  tooltip="Teks di ujung tinggi grafik. Contoh: Ekstrovert."
                />
                <Input
                  id="highLabel"
                  name="highLabel"
                  type="text"
                  defaultValue={scale?.highLabel ?? ""}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <FieldLabel
                htmlFor="description"
                label="Deskripsi"
                collection={COLLECTION}
                field="description"
                tooltip="Penjelasan skala yang tampil di laporan."
              />
              <textarea
                id="description"
                name="description"
                defaultValue={scale?.description ?? ""}
                rows={3}
                className={FIELD_CLASS}
              />
            </div>
          </div>
        </TabContent>

        {/* TAB 3: TAMPILAN & LANJUTAN */}
        <TabContent value="tampilan" activeValue={activeTab} keepMounted>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel
                  htmlFor="order"
                  label="Urutan"
                  collection={COLLECTION}
                  field="order"
                  tooltip="Urutan di laporan dan grafik. Tidak harus unik. Kosongkan untuk otomatis (terakhir + 1) saat membuat, atau mempertahankan urutan lama saat mengubah."
                />
                <Input
                  id="order"
                  name="order"
                  type="number"
                  defaultValue={scale?.order ?? ""}
                  placeholder="Otomatis"
                  className="w-full"
                />
              </div>
              <div>
                <FieldLabel
                  htmlFor="color"
                  label="Warna Grafik"
                  collection={COLLECTION}
                  field="color"
                  tooltip="Warna skala di grafik, format hex #RRGGBB."
                />
                <Input
                  id="color"
                  name="color"
                  type="text"
                  defaultValue={scale?.color ?? ""}
                  placeholder="#4F46E5"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <FieldLabel
                htmlFor="role"
                label="Peran Skala"
                collection={COLLECTION}
                field="role"
                tooltip="Hanya dipakai MSAI, yang mengukur aktivitas yang sama tiga kali (kinerja, ekspektasi, kepentingan). Tes lain biarkan PERFORMANCE."
              />
              <Select
                id="role"
                name="role"
                defaultValue={scale?.role ?? "PERFORMANCE"}
                className={FIELD_CLASS}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  name="isReported"
                  defaultChecked={scale?.isReported ?? true}
                  className="w-4 h-4 rounded border-divider text-primary-main focus:ring-primary-main/20 accent-primary-main"
                />
                Tampilkan di laporan peserta
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={isValidityScale}
                  onChange={(e) => setIsValidityScale(e.target.checked)}
                  className="w-4 h-4 rounded border-divider text-primary-main focus:ring-primary-main/20 accent-primary-main"
                />
                Skala validitas (untuk memeriksa kejujuran atau konsistensi
                jawaban)
              </label>
            </div>
          </div>
        </TabContent>
      </div>

      {/* KETERANGAN FIELD OTOMATIS */}
      <div className="px-4 py-3 border-t border-divider bg-black/2 text-xs text-text-secondary space-y-1">
        <p className="font-medium">Tidak diisi di form ini (diatur server):</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>
            <span className="font-mono">testId</span>: dari URL halaman,
            mengarah ke <span className="font-mono">test_definitions</span>
          </li>
          <li>
            <span className="font-mono">test_sections.scaleIds</span>: ikut
            diperbarui otomatis saat Section dipilih atau diganti
          </li>
        </ul>
      </div>

      {/* ERROR */}
      {errors.length > 0 && (
        <div className="mx-4 mt-3 rounded-xl border border-error-main/40 bg-error-main/5 px-4 py-3 text-sm text-error-main">
          <ul className="list-disc pl-4 space-y-0.5">
            {errors.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex items-center justify-end gap-3 p-4 border-t border-divider">
        <Button
          type="button"
          variant="outlined"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Menyimpan..."
            : isEdit
              ? "Simpan Perubahan"
              : "Tambah Scale"}
        </Button>
      </div>
    </form>
  );
}
