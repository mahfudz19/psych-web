import React, { useState } from "react";
import Button from "../../../../../../../components/ui/Button";
import Input from "../../../../../../../components/ui/Input";
import Label from "../../../../../../../components/ui/Label";
import Select from "../../../../../../../components/ui/Select";
import Tabs from "../../../../../../../components/ui/Tabs";
import Tab from "../../../../../../../components/ui/Tabs/Tab";
import TabContent from "../../../../../../../components/ui/Tabs/TabContent";
import Tooltip from "../../../../../../../components/ui/Tooltip";
import type { TestSectionCreatePayload } from "../../-api/test-definitions.type";

export type NavigationPolicy = "FREE" | "FORWARD_ONLY";
export type SectionStatus = "ACTIVE" | "RETIRED";

export interface SectionPayload {
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
}

export interface SectionFormInitial {
  id?: string;
  code?: string;
  order?: number;
  name?: string;
  instructions?: string | null;
  examples?: string | null;
  showExamplesFirst?: boolean | null;
  timeLimitSeconds?: number | null;
  itemCount?: number | null;
  navigationPolicy?: string | null;
  defaultItemType?: string | null;
  stimulusPhase?: Record<string, unknown> | null;
  config?: Record<string, unknown> | null;
  status?: string | null;
}

interface Props {
  section?: SectionFormInitial;
  nextOrder: number;
  onSubmit: (payload: TestSectionCreatePayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ITEM_TYPES = [
  { value: "SINGLE_CHOICE", label: "Pilihan Tunggal (SINGLE_CHOICE)" },
  { value: "MULTI_CHOICE", label: "Pilihan Ganda (MULTI_CHOICE)" },
  { value: "TRUE_FALSE", label: "Benar/Salah (TRUE_FALSE)" },
  { value: "YES_NO", label: "Ya/Tidak (YES_NO)" },
  { value: "LIKERT", label: "Skala Likert (LIKERT)" },
  { value: "FORCED_CHOICE", label: "Pilihan Paksa (FORCED_CHOICE)" },
  { value: "MOST_LEAST", label: "Paling/Paling Tidak (MOST_LEAST)" },
  { value: "RANKING", label: "Peringkat (RANKING)" },
  { value: "NUMERIC_INPUT", label: "Isian Angka (NUMERIC_INPUT)" },
  { value: "TEXT_INPUT", label: "Isian Teks (TEXT_INPUT)" },
  { value: "DRAWING", label: "Gambar (DRAWING)" },
];

const CODE_PATTERN = /^[A-Z0-9_]{1,20}$/;

const FIELD_CLASS =
  "w-full rounded-2xl border border-divider text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-primary-main focus:ring-primary-main/20";

function FieldLabel({
  htmlFor,
  label,
  tooltip,
  field,
  required,
}: {
  htmlFor?: string;
  label: string;
  tooltip: string;
  field?: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <Label htmlFor={htmlFor} className="mb-0!">
        {label} {required && <span className="text-error-main">*</span>}
      </Label>
      <Tooltip
        position="top-center"
        interaction="hover"
        trigger={
          <button type="button" tabIndex={-1} className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-text-secondary hover:text-primary-main transition-colors cursor-help"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        }
      >
        <div className="max-w-62.5 text-center">
          {tooltip}
          {field && (
            <div className="mt-1 font-mono text-[11px] opacity-70">
              test_sections.{field}
            </div>
          )}
        </div>
      </Tooltip>
    </div>
  );
}

function HelpText({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-text-secondary">{children}</p>;
}

function parseJsonField(
  raw: string,
  label: string,
  kind: "array" | "object",
  errors: string[],
): unknown {
  const text = raw.trim();
  if (!text) return kind === "array" ? [] : {};
  try {
    const parsed: unknown = JSON.parse(text);
    const valid =
      kind === "array"
        ? Array.isArray(parsed)
        : parsed !== null &&
          typeof parsed === "object" &&
          !Array.isArray(parsed);
    if (!valid) {
      errors.push(
        `${label} harus berupa ${kind === "array" ? "array [ ]" : "object { }"}`,
      );
      return null;
    }
    return parsed;
  } catch {
    errors.push(`${label}: format JSON tidak valid`);
    return null;
  }
}

const toJson = (value: unknown, fallback: string) =>
  value === null || value === undefined
    ? fallback
    : JSON.stringify(value, null, 2);

export default function SectionForm({
  section,
  nextOrder,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: Props) {
  const isEdit = Boolean(section);
  const [activeTab, setActiveTab] = useState<string>("dasar");
  const [useStimulus, setUseStimulus] = useState<boolean>(
    Boolean(section?.stimulusPhase),
  );
  const [errors, setErrors] = useState<string[]>([]);

  const stimulus = section?.stimulusPhase ?? null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs: string[] = [];

    const str = (key: string) => String(fd.get(key) ?? "").trim();

    const code = str("code").toUpperCase();
    if (!isEdit && !CODE_PATTERN.test(code)) {
      errs.push(
        "Kode wajib diisi: huruf besar, angka, dan underscore (1-20 karakter)",
      );
    }

    const name = str("name");
    if (!name) errs.push("Nama section wajib diisi");

    const order = Number(str("order"));
    if (!Number.isInteger(order) || order < 1) {
      errs.push("Order wajib diisi, bilangan bulat minimal 1");
    }

    const timeRaw = str("timeLimitSeconds");
    const timeLimitSeconds = timeRaw === "" ? null : Number(timeRaw);
    if (
      timeLimitSeconds !== null &&
      (!Number.isInteger(timeLimitSeconds) || timeLimitSeconds <= 0)
    ) {
      errs.push("Batas waktu harus bilangan bulat lebih dari 0, atau kosong");
    }

    const itemCount = Number(str("itemCount") || 0);
    if (!Number.isInteger(itemCount) || itemCount < 0) {
      errs.push("Jumlah soal tidak boleh negatif");
    }

    const examples = parseJsonField(
      str("examples"),
      "Contoh soal",
      "array",
      errs,
    );
    const config = parseJsonField(str("config"), "Config", "object", errs);

    let stimulusPhase: Record<string, unknown> | null = null;
    if (useStimulus) {
      const contentType = str("stimulusContentType");
      const displaySeconds = Number(str("stimulusDisplaySeconds"));
      if (!contentType) errs.push("Fase hafalan: jenis konten wajib diisi");
      if (!(displaySeconds > 0)) {
        errs.push("Fase hafalan: lama tampil wajib diisi dan lebih dari 0");
      }
      const content = parseJsonField(
        str("stimulusContent"),
        "Fase hafalan: isi konten",
        "object",
        errs,
      );
      stimulusPhase = {
        contentType,
        displaySeconds,
        hideAfter: fd.get("stimulusHideAfter") === "on",
        content,
      };
    }

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);

    const payload: SectionPayload = {
      ...(isEdit ? {} : { code }),
      order,
      name,
      instructions: String(fd.get("instructions") ?? ""),
      examples: examples as unknown[],
      showExamplesFirst: fd.get("showExamplesFirst") === "on",
      timeLimitSeconds,
      itemCount,
      navigationPolicy: str("navigationPolicy") as NavigationPolicy,
      defaultItemType: str("defaultItemType"),
      stimulusPhase,
      config: config as Record<string, unknown>,
      status: str("status") as SectionStatus,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-h-[75vh]">
      <div className="px-4 pt-4 pb-2 border-b border-divider">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tab value="dasar" label="Dasar" />
          <Tab value="waktu" label="Waktu & Navigasi" />
          <Tab value="lanjutan" label="Lanjutan" />
        </Tabs>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <TabContent
          value="dasar"
          activeValue={activeTab}
          keepMounted
          className="min-h-80.75 space-y-4 mt-0"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel
                htmlFor="code"
                label="Kode Section"
                required={!isEdit}
                field="code"
                tooltip="Kunci subtes, unik dalam satu tes dan tidak bisa diubah setelah dibuat. Tes tanpa subtes cukup memakai MAIN. Contoh IST: SE, WA, AN."
              />
              <Input
                id="code"
                name="code"
                type="text"
                defaultValue={section?.code}
                placeholder="Contoh: MAIN"
                disabled={isEdit}
                className="w-full uppercase"
              />
              <HelpText>
                Huruf besar, angka, underscore. Maksimal 20 karakter.
              </HelpText>
            </div>
            <div>
              <FieldLabel
                htmlFor="order"
                label="Urutan"
                required
                field="order"
                tooltip="Urutan pengerjaan subtes. Harus unik dalam satu tes. Subtes dengan urutan 1 dikerjakan pertama."
              />
              <Input
                id="order"
                name="order"
                type="number"
                min="1"
                required
                defaultValue={section?.order ?? nextOrder}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <FieldLabel
              htmlFor="name"
              label="Nama Section"
              required
              field="name"
              tooltip="Nama subtes yang dilihat peserta. Contoh: Melengkapi Kalimat, Analogi Gambar."
            />
            <Input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={section?.name}
              placeholder="Contoh: Analogi Gambar"
              className="w-full"
            />
          </div>

          <div>
            <FieldLabel
              htmlFor="instructions"
              label="Instruksi Section"
              field="instructions"
              tooltip="Petunjuk khusus subtes ini, tampil sebelum soal pertama."
            />
            <textarea
              id="instructions"
              name="instructions"
              defaultValue={section?.instructions ?? ""}
              rows={4}
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <FieldLabel
              htmlFor="status"
              label="Status Section"
              field="status"
              tooltip="ACTIVE = dipakai. RETIRED = disembunyikan tanpa dihapus. Ini bukan status tes (DRAFT/ACTIVE)."
            />
            <Select
              id="status"
              name="status"
              defaultValue={section?.status ?? "ACTIVE"}
              className={FIELD_CLASS}
            >
              <option value="ACTIVE">Aktif (ACTIVE)</option>
              <option value="RETIRED">Dipensiunkan (RETIRED)</option>
            </Select>
          </div>
        </TabContent>

        <TabContent
          value="waktu"
          activeValue={activeTab}
          keepMounted
          className="min-h-80.75 space-y-4 mt-0"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel
                htmlFor="timeLimitSeconds"
                label="Batas Waktu (Detik)"
                field="timeLimitSeconds"
                tooltip="Batas waktu subtes. Server menutup subtes otomatis saat habis. Kosongkan jika tanpa batas. Isi sesuai manual tes."
              />
              <Input
                id="timeLimitSeconds"
                name="timeLimitSeconds"
                type="number"
                min="1"
                defaultValue={section?.timeLimitSeconds ?? ""}
                placeholder="Kosong = tanpa batas"
                className="w-full"
              />
              <HelpText>Contoh: 360 detik = 6 menit.</HelpText>
            </div>
            <div>
              <FieldLabel
                htmlFor="itemCount"
                label="Jumlah Soal"
                field="itemCount"
                tooltip="Jumlah soal yang diharapkan di subtes ini. Dibandingkan dengan soal yang sudah diinput untuk melihat progres."
              />
              <Input
                id="itemCount"
                name="itemCount"
                type="number"
                min="0"
                defaultValue={section?.itemCount ?? 0}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel
                htmlFor="navigationPolicy"
                label="Navigasi"
                field="navigationPolicy"
                tooltip="FREE = peserta boleh kembali ke soal sebelumnya. FORWARD_ONLY = hanya maju (umum di IST)."
              />
              <Select
                id="navigationPolicy"
                name="navigationPolicy"
                defaultValue={section?.navigationPolicy ?? "FREE"}
                className={FIELD_CLASS}
              >
                <option value="FREE">Bebas (FREE)</option>
                <option value="FORWARD_ONLY">Hanya Maju (FORWARD_ONLY)</option>
              </Select>
            </div>
            <div>
              <FieldLabel
                htmlFor="defaultItemType"
                label="Tipe Soal Bawaan"
                field="defaultItemType"
                tooltip="Menentukan komponen tampilan soal bawaan di subtes ini. Setiap soal tetap menyimpan tipenya sendiri."
              />
              <Select
                id="defaultItemType"
                name="defaultItemType"
                defaultValue={section?.defaultItemType ?? "SINGLE_CHOICE"}
                className={FIELD_CLASS}
              >
                {ITEM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </TabContent>

        <TabContent
          value="lanjutan"
          activeValue={activeTab}
          keepMounted
          className="min-h-76.75 space-y-5"
        >
          {/* Contoh soal */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer text-sm mb-3">
              <input
                type="checkbox"
                name="showExamplesFirst"
                defaultChecked={section?.showExamplesFirst ?? true}
                className="w-4 h-4 rounded border-divider text-primary-main focus:ring-primary-main/20 accent-primary-main"
              />
              Tampilkan contoh soal sebelum soal pertama
            </label>

            <FieldLabel
              htmlFor="examples"
              label="Contoh Soal (JSON)"
              field="examples"
              tooltip="Soal contoh atau latihan sebelum waktu berjalan (IST, CFIT, TIU 5). Array JSON. Kosongkan jika tidak ada."
            />
            <textarea
              id="examples"
              name="examples"
              defaultValue={toJson(section?.examples ?? [], "[]")}
              rows={7}
              spellCheck={false}
              className={`${FIELD_CLASS} font-mono`}
            />
            <HelpText>
              Bentuk yang disarankan:{" "}
              {
                '[{ content: { text, images: [{ label, url }] }, options: [{ key }], answer: ["3"], explanation }]'
              }
            </HelpText>
          </div>

          {/* Fase hafalan */}
          <div className="rounded-2xl border border-divider p-4 space-y-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input
                type="checkbox"
                checked={useStimulus}
                onChange={(e) => setUseStimulus(e.target.checked)}
                className="w-4 h-4 rounded border-divider text-primary-main focus:ring-primary-main/20 accent-primary-main"
              />
              Aktifkan fase hafalan (khusus IST subtes ME)
            </label>

            {useStimulus && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel
                      htmlFor="stimulusContentType"
                      label="Jenis Konten"
                      required
                      field="stimulusPhase.contentType"
                      tooltip="Jenis konten yang dihafal peserta. Contoh: WORD_LIST."
                    />
                    <Input
                      id="stimulusContentType"
                      name="stimulusContentType"
                      type="text"
                      defaultValue={String(
                        stimulus?.contentType ?? "WORD_LIST",
                      )}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <FieldLabel
                      htmlFor="stimulusDisplaySeconds"
                      label="Lama Tampil (Detik)"
                      required
                      field="stimulusPhase.displaySeconds"
                      tooltip="Berapa detik konten ditampilkan sebelum disembunyikan."
                    />
                    <Input
                      id="stimulusDisplaySeconds"
                      name="stimulusDisplaySeconds"
                      type="number"
                      min="1"
                      defaultValue={Number(stimulus?.displaySeconds ?? 180)}
                      className="w-full"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    name="stimulusHideAfter"
                    defaultChecked={Boolean(stimulus?.hideAfter ?? true)}
                    className="w-4 h-4 rounded border-divider text-primary-main focus:ring-primary-main/20 accent-primary-main"
                  />
                  Sembunyikan konten setelah waktu habis
                </label>

                <div>
                  <FieldLabel
                    htmlFor="stimulusContent"
                    label="Isi Konten (JSON)"
                    field="stimulusPhase.content"
                    tooltip="Isi yang dihafal. Contoh daftar kata: { words: [...] }."
                  />
                  <textarea
                    id="stimulusContent"
                    name="stimulusContent"
                    defaultValue={toJson(
                      stimulus?.content,
                      '{\n  "words": []\n}',
                    )}
                    rows={5}
                    spellCheck={false}
                    className={`${FIELD_CLASS} font-mono`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Config */}
          <div>
            <FieldLabel
              htmlFor="config"
              label="Config (JSON)"
              field="config"
              tooltip="Konfigurasi unik subtes tanpa mengubah skema. Object JSON. Kosongkan jika tidak ada."
            />
            <textarea
              id="config"
              name="config"
              defaultValue={toJson(section?.config ?? {}, "{}")}
              rows={4}
              spellCheck={false}
              className={`${FIELD_CLASS} font-mono`}
            />
          </div>
        </TabContent>
      </div>

      <div className="px-4 py-3 border-t border-divider bg-secondary-main/10 text-xs text-text-secondary space-y-1">
        <p className="font-medium">Tidak diisi di form ini (diatur server):</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>
            <span className="font-mono">testId</span>: dari URL halaman,
            mengarah ke <span className="font-mono">test_definitions</span>
          </li>
          <li>
            <span className="font-mono">testVersion</span>: disalin dari tes
          </li>
          <li>
            <span className="font-mono">scaleIds</span>: terisi otomatis dari{" "}
            <span className="font-mono">test_scales.sectionId</span>
          </li>
        </ul>
      </div>

      {errors.length > 0 && (
        <div className="mx-4 mt-3 rounded-xl border border-error-main/40 bg-error-main/5 px-4 py-3 text-sm text-error-main">
          <ul className="list-disc pl-4 space-y-0.5">
            {errors.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

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
              : "Tambah Section"}
        </Button>
      </div>
    </form>
  );
}
