import React, { useState } from "react";

import Select from "../../../../../../../components/ui/Select/index.tsx";
import Input from "../../../../../../../components/ui/Input/index.tsx";
import Button from "../../../../../../../components/ui/Button/index.tsx";
import type { ItemType, TestItem } from "../../-api/test-items.type.ts";
import { FIELD_CLASS, FieldLabel, HelpText } from "./FormParts.tsx";

// ---------------------------------------------------------------------------
// TIPE
// ---------------------------------------------------------------------------

/** Tipe soal yang sudah didukung form ini (tahap 1). */
type SupportedType = "SINGLE_CHOICE" | "LIKERT";

export interface ItemOptionPayload {
  key: string;
  label: string | null;
  imageUrl: string | null;
  order: number;
  scoring: { points: number } | null;
}

/**
 * Body request ke collection `test_items`.
 * - POST /tests/{testId}/items          -> semua field, termasuk `sectionId`
 * - PUT  /tests/{testId}/items/{id}     -> tanpa `sectionId` (section tidak bisa diubah)
 */
export interface ItemPayload {
  sectionId?: string;
  number: number;
  type: ItemType;
  content: {
    text: string | null;
    images: { label: string; url: string }[];
    audioUrl: string | null;
  };
  options: ItemOptionPayload[];
  groupId: string | null;
  scaleId: string | null;
  reverseScored: boolean;
  weight: number;
  scoredInTotal: boolean;
  consistencyGroup: string | null;
  answerKey: { correct: string[] } | null;
  timeLimitSeconds: number | null;
  constraints: Record<string, unknown>;
  difficulty: number | null;
  isExample: boolean;
  status: "ACTIVE" | "RETIRED";
  tags: string[];
}

export interface ItemScaleOption {
  id: string;
  code: string;
  name: string;
  sectionId?: string | null;
}

interface Props {
  /** create = soal baru (boleh diisi `item` sebagai salinan), edit = ubah soal yang ada */
  mode: "create" | "edit";
  item?: TestItem;
  sectionId: string;
  sectionCode: string;
  /** Nomor yang disarankan untuk soal baru */
  nextNumber: number;
  /** defaultItemType milik section, menentukan tipe awal */
  defaultType?: string | null;
  /** true jika kategori tes = ABILITY (memakai kunci jawaban, bukan aturan skor) */
  isAbility: boolean;
  scales: ItemScaleOption[];
  /**
   * Mengembalikan true jika berhasil. Boleh async. Form hanya mengosongkan diri
   * untuk "Simpan dan tambah berikutnya" setelah mendapat true.
   * `addNext` = true berarti admin menekan "Simpan dan tambah berikutnya".
   */
  onSubmit: (
    payload: ItemPayload,
    addNext: boolean,
  ) => boolean | Promise<boolean>;
  onCancel: () => void;
}

interface DraftOption {
  label: string;
  imageUrl: string;
  points: string;
}

// ---------------------------------------------------------------------------
// KONSTANTA
// ---------------------------------------------------------------------------

const COLLECTION = "test_items";
const SUPPORTED: SupportedType[] = ["SINGLE_CHOICE", "LIKERT"];

const TYPE_OPTIONS: { value: ItemType; label: string; supported: boolean }[] = [
  { value: "SINGLE_CHOICE", label: "Pilihan tunggal", supported: true },
  { value: "LIKERT", label: "Skala Likert", supported: true },
  { value: "MULTI_CHOICE", label: "Pilihan ganda (segera)", supported: false },
  { value: "TRUE_FALSE", label: "Benar/salah (segera)", supported: false },
  { value: "YES_NO", label: "Ya/tidak (segera)", supported: false },
  { value: "FORCED_CHOICE", label: "Pilihan paksa (segera)", supported: false },
  {
    value: "MOST_LEAST",
    label: "Paling / paling tidak (segera)",
    supported: false,
  },
  { value: "RANKING", label: "Peringkat (segera)", supported: false },
  { value: "NUMERIC_INPUT", label: "Isian angka (segera)", supported: false },
  { value: "TEXT_INPUT", label: "Isian teks (segera)", supported: false },
  { value: "DRAWING", label: "Gambar (segera)", supported: false },
];

const LIKERT_PRESETS: Record<string, { label: string; labels: string[] }> = {
  setuju: {
    label: "Likert 5 (setuju)",
    labels: [
      "Sangat tidak setuju",
      "Tidak setuju",
      "Netral",
      "Setuju",
      "Sangat setuju",
    ],
  },
  frekuensi: {
    label: "Likert 5 (frekuensi)",
    labels: ["Tidak pernah", "Jarang", "Kadang-kadang", "Sering", "Selalu"],
  },
};

const MAX_CHOICE_OPTIONS = 8;
const MAX_LIKERT_OPTIONS = 10;

// ---------------------------------------------------------------------------
// PEMBANTU
// ---------------------------------------------------------------------------

const isSupported = (t?: string | null): t is SupportedType =>
  SUPPORTED.includes(t as SupportedType);

const blankOption = (): DraftOption => ({
  label: "",
  imageUrl: "",
  points: "",
});

function defaultOptions(type: SupportedType): DraftOption[] {
  if (type === "LIKERT") {
    return LIKERT_PRESETS.setuju.labels.map((label) => ({
      label,
      imageUrl: "",
      points: "",
    }));
  }
  return Array.from({ length: 5 }, blankOption);
}

function optionsFromItem(item: TestItem): DraftOption[] {
  return [...item.options]
    .sort((a, b) => a.order - b.order)
    .map((o) => {
      const points =
        o.scoring &&
        typeof (o.scoring as { points?: unknown }).points === "number"
          ? String((o.scoring as { points: number }).points)
          : "";
      return { label: o.label ?? "", imageUrl: o.imageUrl ?? "", points };
    });
}

/** Kunci opsi: angka (1, 2, 3...) atau huruf (a, b, c...). */
const optionKey = (style: "number" | "letter", index: number) =>
  style === "number" ? String(index + 1) : String.fromCharCode(97 + index);

/** Label gambar stimulus: A, B, C... */
const imageLabel = (index: number) => String.fromCharCode(65 + index);

function detectPreset(labels: string[]): string {
  const found = Object.entries(LIKERT_PRESETS).find(
    ([, p]) =>
      p.labels.length === labels.length &&
      p.labels.every((l, i) => l === labels[i]),
  );
  return found ? found[0] : "custom";
}

function Thumb({ url }: { url: string }) {
  if (!/^https?:\/\//i.test(url)) return null;
  return (
    <img
      key={url}
      src={url}
      alt=""
      className="h-7 w-7 shrink-0 rounded border border-divider object-cover"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-w-6 shrink-0 items-center justify-center rounded bg-black/5 px-1.5 py-0.5 text-xs text-text-secondary dark:bg-white/10">
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// FORM
// ---------------------------------------------------------------------------

export default function ItemForm({
  mode,
  item,
  sectionId,
  sectionCode,
  nextNumber,
  defaultType,
  isAbility,
  scales,
  onSubmit,
  onCancel,
}: Props) {
  const isEdit = mode === "edit";

  const itemType = item?.type;
  const startType: SupportedType = isSupported(itemType)
    ? itemType
    : isSupported(defaultType)
      ? defaultType
      : "SINGLE_CHOICE";

  const sectionScales = scales.filter((s) => s.sectionId === sectionId);
  const orderedScales = [
    ...sectionScales,
    ...scales.filter((s) => s.sectionId !== sectionId),
  ];

  const [type, setType] = useState<SupportedType>(startType);
  const [number, setNumber] = useState<string>(
    String(isEdit && item ? item.number : nextNumber),
  );
  const [text, setText] = useState<string>(item?.content?.text ?? "");
  const [images, setImages] = useState<string[]>(
    item?.content?.images?.map((i) => i.url) ?? [],
  );
  const [scaleId, setScaleId] = useState<string>(
    item?.scaleId ?? (sectionScales.length === 1 ? sectionScales[0].id : ""),
  );
  const [options, setOptions] = useState<DraftOption[]>(
    item && isSupported(item.type)
      ? optionsFromItem(item)
      : defaultOptions(startType),
  );
  const [keyStyle, setKeyStyle] = useState<"number" | "letter">(
    item?.options?.[0]?.key === "a" ? "letter" : "number",
  );
  const [correctIndex, setCorrectIndex] = useState<number | null>(() => {
    const correct = item?.answerKey?.correct?.[0];
    if (!item || !correct) return null;
    const idx = [...item.options]
      .sort((a, b) => a.order - b.order)
      .findIndex((o) => o.key === correct);
    return idx >= 0 ? idx : null;
  });
  const [preset, setPreset] = useState<string>(
    item && item.type === "LIKERT"
      ? detectPreset(optionsFromItem(item).map((o) => o.label))
      : "setuju",
  );
  const [reverseScored, setReverseScored] = useState<boolean>(
    item?.reverseScored ?? false,
  );

  // Lanjutan
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [weight, setWeight] = useState<string>(String(item?.weight ?? 1));
  const [scoredInTotal, setScoredInTotal] = useState<boolean>(
    item?.scoredInTotal ?? true,
  );
  const [isExample, setIsExample] = useState<boolean>(item?.isExample ?? false);
  const [status, setStatus] = useState<"ACTIVE" | "RETIRED">(
    item?.status ?? "ACTIVE",
  );
  const [timeLimit, setTimeLimit] = useState<string>(
    item?.timeLimitSeconds ? String(item.timeLimitSeconds) : "",
  );
  const [difficulty, setDifficulty] = useState<string>(
    item?.difficulty !== null && item?.difficulty !== undefined
      ? String(item.difficulty)
      : "",
  );
  const [groupId, setGroupId] = useState<string>(item?.groupId ?? "");
  const [consistencyGroup, setConsistencyGroup] = useState<string>(
    item?.consistencyGroup ?? "",
  );
  const [tags, setTags] = useState<string>((item?.tags ?? []).join(", "));

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Soal dengan tipe yang belum didukung tidak boleh disimpan dari form ini,
  // supaya datanya tidak rusak.
  if (item && !isSupported(item.type)) {
    return (
      <div className="space-y-3 p-4">
        <p className="text-sm">
          Soal bertipe <span className="font-mono">{item.type}</span> belum bisa
          diedit di form ini. Tipe ini akan ditambahkan di tahap berikutnya.
        </p>
        <Button type="button" variant="outlined" onClick={onCancel}>
          Tutup
        </Button>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // HANDLER
  // -------------------------------------------------------------------------

  const handleTypeChange = (next: ItemType) => {
    if (!isSupported(next) || next === type) return;
    setType(next);
    setOptions(defaultOptions(next));
    setCorrectIndex(null);
    setPreset("setuju");
    setReverseScored(false);
  };

  const applyPreset = (key: string) => {
    if (key === "custom") return;
    const p = LIKERT_PRESETS[key];
    if (!p) return;
    setPreset(key);
    setOptions(p.labels.map((label) => ({ label, imageUrl: "", points: "" })));
  };

  const updateOption = (index: number, patch: Partial<DraftOption>) => {
    setOptions((prev) =>
      prev.map((o, i) => (i === index ? { ...o, ...patch } : o)),
    );
    if (type === "LIKERT" && patch.label !== undefined) setPreset("custom");
  };

  const addOption = () => {
    const max = type === "LIKERT" ? MAX_LIKERT_OPTIONS : MAX_CHOICE_OPTIONS;
    setOptions((prev) =>
      prev.length >= max ? prev : [...prev, blankOption()],
    );
    if (type === "LIKERT") setPreset("custom");
  };

  const removeOption = (index: number) => {
    setOptions((prev) =>
      prev.length <= 2 ? prev : prev.filter((_, i) => i !== index),
    );
    setCorrectIndex((prev) => {
      if (prev === null) return prev;
      if (prev === index) return null;
      return prev > index ? prev - 1 : prev;
    });
    if (type === "LIKERT") setPreset("custom");
  };

  /** Mengosongkan isi soal tetapi mempertahankan pengaturan, untuk soal berikutnya. */
  const resetForNext = () => {
    setNumber((n) => String((Number(n) || 0) + 1));
    setText("");
    setImages((prev) => prev.map(() => ""));
    setCorrectIndex(null);
    setReverseScored(false);
    if (type === "SINGLE_CHOICE") {
      setOptions((prev) => prev.map(() => blankOption()));
    }
    setErrors([]);
  };

  const buildPayload = (): ItemPayload | null => {
    const errs: string[] = [];

    const n = Number(number);
    if (!Number.isInteger(n) || n < 1)
      errs.push("Nomor wajib diisi, bilangan bulat minimal 1");

    const cleanImages = images
      .map((u) => u.trim())
      .filter((u) => u !== "")
      .map((url, i) => ({ label: imageLabel(i), url }));
    if (!text.trim() && cleanImages.length === 0) {
      errs.push("Isi soal wajib: teks, atau minimal satu gambar");
    }
    for (const img of cleanImages) {
      if (!/^https?:\/\//i.test(img.url)) {
        errs.push(
          `URL gambar ${img.label} harus diawali http:// atau https://`,
        );
      }
    }

    if (scoredInTotal && !scaleId) {
      errs.push("Skala wajib dipilih agar soal ini masuk perhitungan skor");
    }

    const w = Number(weight);
    if (!(w > 0)) errs.push("Bobot harus lebih dari 0");

    let timeLimitSeconds: number | null = null;
    if (timeLimit.trim() !== "") {
      timeLimitSeconds = Number(timeLimit);
      if (!Number.isInteger(timeLimitSeconds) || timeLimitSeconds <= 0) {
        errs.push("Batas waktu harus bilangan bulat lebih dari 0, atau kosong");
      }
    }

    let difficultyValue: number | null = null;
    if (difficulty.trim() !== "") {
      difficultyValue = Number(difficulty);
      if (!(difficultyValue >= 0 && difficultyValue <= 1)) {
        errs.push("Tingkat kesulitan harus antara 0 dan 1");
      }
    }

    // --- opsi dan penilaian ---
    const optionPayload: ItemOptionPayload[] = [];
    let answerKey: { correct: string[] } | null = null;

    if (options.length < 2) errs.push("Minimal 2 opsi");

    if (type === "LIKERT") {
      if (!scaleId) errs.push("Skala wajib dipilih untuk soal Likert");
      options.forEach((o, i) => {
        if (!o.label.trim()) errs.push(`Label opsi ke-${i + 1} wajib diisi`);
        optionPayload.push({
          key: String(i + 1),
          label: o.label.trim(),
          imageUrl: null,
          order: i + 1,
          scoring: { points: i + 1 },
        });
      });
    } else {
      options.forEach((o, i) => {
        const label = o.label.trim();
        const imageUrl = o.imageUrl.trim();
        const key = optionKey(keyStyle, i);
        if (!label && !imageUrl)
          errs.push(`Opsi ${key} harus punya teks atau URL gambar`);
        if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
          errs.push(
            `URL gambar opsi ${key} harus diawali http:// atau https://`,
          );
        }
        let scoring: { points: number } | null = null;
        if (!isAbility) {
          const p = Number(o.points);
          if (o.points.trim() === "" || Number.isNaN(p)) {
            errs.push(`Poin opsi ${key} wajib diisi`);
          } else {
            scoring = { points: p };
          }
        }
        optionPayload.push({
          key,
          label: label || null,
          imageUrl: imageUrl || null,
          order: i + 1,
          scoring,
        });
      });
      if (isAbility) {
        if (correctIndex === null) {
          errs.push("Pilih satu opsi sebagai kunci jawaban");
        } else {
          answerKey = { correct: [optionKey(keyStyle, correctIndex)] };
        }
      } else if (!scaleId) {
        errs.push("Skala wajib dipilih karena opsi dinilai dengan poin");
      }
    }

    if (errs.length > 0) {
      setErrors(errs);
      return null;
    }
    setErrors([]);

    return {
      ...(isEdit ? {} : { sectionId }),
      number: n,
      type,
      content: {
        text: text.trim() || null,
        images: cleanImages,
        audioUrl: item?.content?.audioUrl ?? null,
      },
      options: optionPayload,
      groupId: groupId.trim() || null,
      scaleId: scaleId || null,
      reverseScored: type === "LIKERT" ? reverseScored : false,
      weight: w,
      scoredInTotal,
      consistencyGroup: consistencyGroup.trim() || null,
      answerKey,
      timeLimitSeconds,
      constraints: item?.constraints ?? {},
      difficulty: difficultyValue,
      isExample,
      status,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== ""),
    };
  };

  const submit = async (addNext: boolean) => {
    const payload = buildPayload();
    if (!payload) return;
    setIsSubmitting(true);
    try {
      const ok = await onSubmit(payload, addNext);
      if (ok && addNext && !isEdit) resetForNext();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      void submit(!isEdit);
    }
  };

  const modeLabel =
    type === "LIKERT"
      ? "Aturan skor (poin)"
      : isAbility
        ? "Kunci jawaban"
        : "Aturan skor (poin)";

  // -------------------------------------------------------------------------
  // TAMPILAN
  // -------------------------------------------------------------------------

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="flex flex-col"
      noValidate
    >
      <div className="max-h-[68vh] space-y-5 overflow-y-auto p-4">
        {/* NOMOR & TIPE */}
        <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
          <div>
            <FieldLabel
              htmlFor="item-number"
              label="Nomor"
              required
              collection={COLLECTION}
              field="number"
              tooltip={`Nomor urut soal di section ${sectionCode}. Harus unik dalam satu section.`}
            />
            <Input
              id="item-number"
              type="number"
              min="1"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <FieldLabel
              htmlFor="item-type"
              label="Tipe soal"
              required
              collection={COLLECTION}
              field="type"
              tooltip="Menentukan bentuk opsi dan cara penilaian. Mengganti tipe mengosongkan opsi."
            />
            <Select
              id="item-type"
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as ItemType)}
              disabled={isEdit}
              className={FIELD_CLASS}
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value} disabled={!t.supported}>
                  {t.label}
                </option>
              ))}
            </Select>
            {isEdit && (
              <HelpText>
                Tipe tidak bisa diubah. Hapus dan buat ulang jika salah.
              </HelpText>
            )}
          </div>
        </div>

        {/* ISI SOAL */}
        <div className="space-y-3">
          <div>
            <FieldLabel
              htmlFor="item-text"
              label="Isi soal"
              collection={COLLECTION}
              field="content.text"
              tooltip="Teks soal. Boleh kosong jika soal berupa gambar saja."
            />
            <textarea
              id="item-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <FieldLabel
              label="Gambar stimulus"
              collection={COLLECTION}
              field="content.images"
              tooltip="Gambar yang ditampilkan bersama soal (mis. gambar A, B, C pada TIU 5). Karena belum ada upload, tempel URL gambar yang sudah diunggah ke storage."
            />
            <div className="space-y-2">
              {images.map((url, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Tag>{imageLabel(i)}</Tag>
                  <Input
                    type="text"
                    value={url}
                    placeholder="https://..."
                    onChange={(e) =>
                      setImages((prev) =>
                        prev.map((u, idx) => (idx === i ? e.target.value : u)),
                      )
                    }
                    className="min-w-0 flex-1"
                  />
                  <Thumb url={url.trim()} />
                  <Button
                    type="button"
                    variant="outlined"
                    size="sm"
                    onClick={() =>
                      setImages((prev) => prev.filter((_, idx) => idx !== i))
                    }
                  >
                    Hapus
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outlined"
                size="sm"
                onClick={() => setImages((prev) => [...prev, ""])}
              >
                + Gambar stimulus
              </Button>
            </div>
          </div>
        </div>

        {/* SKALA */}
        <div>
          <FieldLabel
            htmlFor="item-scale"
            label="Skala"
            required={scoredInTotal}
            collection={COLLECTION}
            field="scaleId"
            tooltip="Skala yang dinilai oleh soal ini. Skala milik section yang sedang dipilih ditampilkan lebih dulu. Jika section hanya punya satu skala, otomatis terpilih."
          />
          <Select
            id="item-scale"
            value={scaleId}
            onChange={(e) => setScaleId(e.target.value)}
            className={FIELD_CLASS}
          >
            <option value="">-- Pilih skala --</option>
            {orderedScales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
                {s.sectionId === sectionId ? " (section ini)" : ""}
              </option>
            ))}
          </Select>
          {scales.length === 0 && (
            <HelpText>Belum ada skala. Buat skala dulu di tab Scales.</HelpText>
          )}
        </div>

        {/* OPSI & PENILAIAN */}
        <div className="space-y-3 border-t border-divider pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Opsi dan penilaian</span>
            <span className="rounded bg-black/5 px-2 py-0.5 text-xs text-text-secondary dark:bg-white/10">
              {modeLabel}
            </span>
          </div>

          {type === "LIKERT" ? (
            <>
              <HelpText>
                Poin diberikan otomatis sesuai urutan (opsi pertama = 1). Pakai
                preset agar tidak mengetik ulang di setiap soal.
              </HelpText>
              <Select
                value={preset}
                onChange={(e) => applyPreset(e.target.value)}
                className={FIELD_CLASS}
                aria-label="Preset opsi Likert"
              >
                {Object.entries(LIKERT_PRESETS).map(([k, p]) => (
                  <option key={k} value={k}>
                    Preset: {p.label}
                  </option>
                ))}
                <option value="custom">Kustom (diubah manual)</option>
              </Select>
              <div className="space-y-2">
                {options.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Tag>{i + 1}</Tag>
                    <Input
                      type="text"
                      value={o.label}
                      onChange={(e) =>
                        updateOption(i, { label: e.target.value })
                      }
                      className="min-w-0 flex-1"
                    />
                    <span className="shrink-0 rounded bg-primary-main/10 px-1.5 py-0.5 text-xs text-primary-main">
                      poin {i + 1}
                    </span>
                    <Button
                      type="button"
                      variant="outlined"
                      size="sm"
                      onClick={() => removeOption(i)}
                      disabled={options.length <= 2}
                    >
                      Hapus
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  type="button"
                  variant="outlined"
                  size="sm"
                  onClick={addOption}
                >
                  + Opsi
                </Button>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={reverseScored}
                    onChange={(e) => setReverseScored(e.target.checked)}
                    className="h-4 w-4 rounded border-divider accent-primary-main"
                  />
                  Balik skor (soal bernada negatif)
                </label>
              </div>
            </>
          ) : (
            <>
              <HelpText>
                {isAbility
                  ? "Pilih satu opsi sebagai kunci jawaban. Opsi boleh berupa teks, URL gambar, atau keduanya."
                  : "Beri poin pada setiap opsi. Skala wajib dipilih di atas."}
              </HelpText>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary">
                  Penomoran opsi
                </span>
                <Select
                  value={keyStyle}
                  onChange={(e) =>
                    setKeyStyle(e.target.value as "number" | "letter")
                  }
                  className={`${FIELD_CLASS} max-w-44`}
                  aria-label="Penomoran opsi"
                >
                  <option value="number">Angka (1, 2, 3)</option>
                  <option value="letter">Huruf (a, b, c)</option>
                </Select>
              </div>
              <div className="space-y-2">
                {options.map((o, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    {isAbility && (
                      <input
                        type="radio"
                        name="item-correct"
                        checked={correctIndex === i}
                        onChange={() => setCorrectIndex(i)}
                        aria-label={`Kunci jawaban opsi ${optionKey(keyStyle, i)}`}
                        className="h-4 w-4 shrink-0 accent-primary-main"
                      />
                    )}
                    <Tag>{optionKey(keyStyle, i)}</Tag>
                    <Input
                      type="text"
                      value={o.label}
                      placeholder="Teks opsi"
                      onChange={(e) =>
                        updateOption(i, { label: e.target.value })
                      }
                      className="min-w-32 flex-1"
                    />
                    <Input
                      type="text"
                      value={o.imageUrl}
                      placeholder="URL gambar (opsional)"
                      onChange={(e) =>
                        updateOption(i, { imageUrl: e.target.value })
                      }
                      className="min-w-32 flex-1"
                    />
                    <Thumb url={o.imageUrl.trim()} />
                    {!isAbility && (
                      <Input
                        type="number"
                        value={o.points}
                        placeholder="Poin"
                        onChange={(e) =>
                          updateOption(i, { points: e.target.value })
                        }
                        className="w-20"
                      />
                    )}
                    <Button
                      type="button"
                      variant="outlined"
                      size="sm"
                      onClick={() => removeOption(i)}
                      disabled={options.length <= 2}
                    >
                      Hapus
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outlined"
                size="sm"
                onClick={addOption}
                disabled={options.length >= MAX_CHOICE_OPTIONS}
              >
                + Opsi
              </Button>
            </>
          )}
        </div>

        {/* LANJUTAN */}
        <div className="border-t border-divider pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            {showAdvanced ? "▾" : "▸"} Lanjutan (bobot, grup, waktu, soal
            contoh, status)
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <FieldLabel
                    htmlFor="item-weight"
                    label="Bobot"
                    collection={COLLECTION}
                    field="weight"
                    tooltip="Bobot soal dalam perhitungan skor. Biasanya 1."
                  />
                  <Input
                    id="item-weight"
                    type="number"
                    step="any"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <FieldLabel
                    htmlFor="item-time"
                    label="Batas waktu (detik)"
                    collection={COLLECTION}
                    field="timeLimitSeconds"
                    tooltip="Batas waktu khusus soal ini. Kosongkan jika waktu diatur per section."
                  />
                  <Input
                    id="item-time"
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <FieldLabel
                    htmlFor="item-difficulty"
                    label="Kesulitan (0-1)"
                    collection={COLLECTION}
                    field="difficulty"
                    tooltip="Tingkat kesulitan hasil kalibrasi. Boleh kosong."
                  />
                  <Input
                    id="item-difficulty"
                    type="number"
                    step="any"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel
                    htmlFor="item-group"
                    label="Grup soal"
                    collection={COLLECTION}
                    field="groupId"
                    tooltip="Mengelompokkan beberapa soal yang berbagi satu bacaan atau gambar."
                  />
                  <Input
                    id="item-group"
                    type="text"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <FieldLabel
                    htmlFor="item-consistency"
                    label="Kelompok konsistensi"
                    collection={COLLECTION}
                    field="consistencyGroup"
                    tooltip="Menautkan soal konsistensi dengan soal asalnya (EPPS)."
                  />
                  <Input
                    id="item-consistency"
                    type="text"
                    value={consistencyGroup}
                    onChange={(e) => setConsistencyGroup(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <FieldLabel
                  htmlFor="item-tags"
                  label="Tag"
                  collection={COLLECTION}
                  field="tags"
                  tooltip="Pengelompokan tambahan, dipisah koma. Contoh: verbal, numerik."
                />
                <Input
                  id="item-tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={scoredInTotal}
                      onChange={(e) => setScoredInTotal(e.target.checked)}
                      className="h-4 w-4 rounded border-divider accent-primary-main"
                    />
                    Masuk skor utama
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isExample}
                      onChange={(e) => setIsExample(e.target.checked)}
                      className="h-4 w-4 rounded border-divider accent-primary-main"
                    />
                    Soal contoh (tidak dihitung skor)
                  </label>
                </div>
                <div>
                  <FieldLabel
                    htmlFor="item-status"
                    label="Status soal"
                    collection={COLLECTION}
                    field="status"
                    tooltip="ACTIVE = dipakai. RETIRED = disembunyikan tanpa dihapus."
                  />
                  <Select
                    id="item-status"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "ACTIVE" | "RETIRED")
                    }
                    className={FIELD_CLASS}
                  >
                    <option value="ACTIVE">Aktif (ACTIVE)</option>
                    <option value="RETIRED">Dipensiunkan (RETIRED)</option>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ERROR */}
      {errors.length > 0 && (
        <div className="mx-4 mb-3 rounded-xl border border-error-main/40 bg-error-main/5 px-4 py-3 text-sm text-error-main">
          <ul className="list-disc space-y-0.5 pl-4">
            {errors.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-divider p-4">
        <Button
          type="button"
          variant="outlined"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" variant="outlined" disabled={isSubmitting}>
          {isSubmitting
            ? "Menyimpan..."
            : isEdit
              ? "Simpan Perubahan"
              : "Simpan"}
        </Button>
        {!isEdit && (
          <Button
            type="button"
            onClick={() => void submit(true)}
            disabled={isSubmitting}
          >
            Simpan dan tambah berikutnya
          </Button>
        )}
      </div>
    </form>
  );
}
