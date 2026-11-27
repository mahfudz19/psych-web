import { useState, useRef } from "react";
import StimulusImage from "./StimulusImage";
import Advanced from "./Advanced";
import TypeFields, {
  type ScoringTier,
  type NormalizeMode,
  type SupportedType,
  type DraftOption,
} from "./TypeFields";
import type { ItemType, TestItem } from "../../../-api/test-definitions.type";
import toast from "../../../../../../../../components/ui/Toast";
import { LoaderCircle } from "lucide-react";
import Button from "../../../../../../../../components/ui/Button";
import Label from "../../../../../../../../components/ui/Label";
import Textarea from "../../../../../../../../components/ui/Textarea";
import Select from "../../../../../../../../components/ui/Select";
import Input from "../../../../../../../../components/ui/Input";

export interface ItemOptionPayload {
  key: string;
  label: string | null;
  imageUrl: string | null;
  order: number;
  scoring: ({ points: number } & Record<string, unknown>) | null;
}

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
  answerKey:
    | { correct: string[] }
    | {
        accepted: string[];
        scoring?: Record<string, string[]>;
        normalize?: string;
      }
    | null;
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
  mode: "create" | "edit";
  item?: TestItem;
  sectionId: string;
  sectionCode: string;
  nextNumber: number;
  defaultType?: string | null;
  isAbility: boolean;
  scales: ItemScaleOption[];
  onSubmit: (
    payload: ItemPayload,
    addNext: boolean,
  ) => boolean | Promise<boolean>;
  onCancel: () => void;
}

const SUPPORTED: SupportedType[] = [
  "SINGLE_CHOICE",
  "LIKERT",
  "TEXT_INPUT",
  "FORCED_CHOICE",
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

const isSupported = (t?: string | null): t is SupportedType =>
  SUPPORTED.includes(t as SupportedType);

const blankOption = (): DraftOption => ({
  label: "",
  imageUrl: "",
  points: "",
  scaleId: "",
});

function defaultOptions(type: SupportedType): DraftOption[] {
  if (type === "TEXT_INPUT") return [];
  if (type === "LIKERT") {
    return LIKERT_PRESETS.setuju.labels.map((label) => ({
      label,
      imageUrl: "",
      points: "",
      scaleId: "",
    }));
  }
  if (type === "FORCED_CHOICE") {
    return [
      { label: "", imageUrl: "", points: "1", scaleId: "" },
      { label: "", imageUrl: "", points: "1", scaleId: "" },
    ];
  }
  return Array.from({ length: 5 }, blankOption);
}

function optionsFromItem(item: TestItem): DraftOption[] {
  return [...item.options]
    .sort((a, b) => a.order - b.order)
    .map((o) => {
      const scoring = o.scoring as Record<string, unknown> | null;
      const points =
        scoring && typeof scoring.points === "number"
          ? String(scoring.points)
          : "";
      const scaleId =
        typeof scoring?.scaleId === "string" ? scoring.scaleId : "";
      return {
        label: o.label ?? "",
        imageUrl: o.imageUrl ?? "",
        points,
        scaleId,
      };
    });
}

const optionKey = (style: "number" | "letter", index: number) =>
  style === "number" ? String(index + 1) : String.fromCharCode(97 + index);

const imageLabel = (index: number) => String.fromCharCode(65 + index);

function detectPreset(labels: string[]): string {
  const found = Object.entries(LIKERT_PRESETS).find(
    ([, p]) =>
      p.labels.length === labels.length &&
      p.labels.every((l, i) => l === labels[i]),
  );
  return found ? found[0] : "custom";
}

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
  const formRef = useRef<HTMLFormElement>(null);

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

  // State wajib untuk elemen dinamis yang mempengaruhi re-render struktur UI
  const [type, setType] = useState<SupportedType>(startType);
  const [images, setImages] = useState<string[]>(
    item?.content?.images?.map((i) => i.url) ?? [],
  );
  const [options, setOptions] = useState<DraftOption[]>(
    item && isSupported(item.type)
      ? optionsFromItem(item)
      : defaultOptions(startType),
  );
  const [keyStyle, setKeyStyle] = useState<"number" | "letter">(
    item?.options?.[0]?.key === "a" || startType === "FORCED_CHOICE"
      ? "letter"
      : "number",
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
  const [acceptedAnswers, setAcceptedAnswers] = useState<string>(
    () => item?.answerKey?.accepted?.join(", ") ?? "",
  );
  const [scoringTiers, setScoringTiers] = useState<ScoringTier[]>(() => {
    const scoring = (item?.answerKey as any)?.scoring as
      Record<string, string[]> | undefined;
    if (!scoring) return [];
    return Object.entries(scoring).map(([points, answers]) => ({
      points,
      answers: answers.join(", "),
    }));
  });
  const [normalize, setNormalize] = useState<NormalizeMode>(
    () => ((item?.answerKey as any)?.normalize as NormalizeMode) || "NONE",
  );
  const [tags, setTags] = useState(() => item?.tags.join(", ") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleTypeChange = (next: ItemType) => {
    if (!isSupported(next) || next === type) return;
    setType(next);
    if (next === "TEXT_INPUT") {
      setOptions([]);
    } else {
      setOptions(defaultOptions(next));
    }
    setCorrectIndex(null);
    setPreset("setuju");
    setReverseScored(false);
    setAcceptedAnswers("");
    setScoringTiers([]);
    setNormalize("NONE");
    setTags("");
  };

  const resetForNext = (lastSubmittedNumber: number) => {
    if (formRef.current) {
      formRef.current.reset();
      const numInput = formRef.current.elements.namedItem(
        "number",
      ) as HTMLInputElement | null;
      if (numInput) numInput.value = String(lastSubmittedNumber + 1);
    }
    setImages([]);
    setCorrectIndex(null);
    setReverseScored(false);
    if (type === "TEXT_INPUT") {
      setAcceptedAnswers("");
      setScoringTiers([]);
    } else {
      setOptions(defaultOptions(type));
    }
  };

  const buildPayload = (formData: FormData): ItemPayload | null => {
    const errs: string[] = [];

    // Ekstraksi nilai
    const numRaw = formData.get("number") as string;
    const n = Number(numRaw);
    if (!Number.isInteger(n) || n < 1)
      errs.push("Nomor wajib diisi, bilangan bulat minimal 1");

    const text = ((formData.get("text") as string) || "").trim();
    const scaleId = formData.get("scaleId") as string;
    const scoredInTotal = formData.has("scoredInTotal");
    const weightRaw = formData.get("weight") as string;
    const timeLimitRaw = formData.get("timeLimit") as string;
    const difficultyRaw = formData.get("difficulty") as string;
    const groupId = ((formData.get("groupId") as string) || "").trim();
    const consistencyGroup = (
      (formData.get("consistencyGroup") as string) || ""
    ).trim();
    const tagsRaw = formData.get("tags") as string;
    const isExample = formData.has("isExample");
    const status = formData.get("status") as "ACTIVE" | "RETIRED";

    const cleanImages = images
      .map((u) => u.trim())
      .filter((u) => u !== "")
      .map((url, i) => ({ label: imageLabel(i), url }));

    for (const img of cleanImages) {
      if (!/^https?:\/\//i.test(img.url)) {
        errs.push(
          `URL gambar ${img.label} harus diawali http:// atau https://`,
        );
      }
    }

    if (scoredInTotal && !scaleId && type !== "FORCED_CHOICE") {
      errs.push("Skala wajib dipilih agar soal ini masuk perhitungan skor");
    }

    const w = Number(weightRaw);
    if (!(w > 0)) errs.push("Bobot harus lebih dari 0");

    let timeLimitSeconds: number | null = null;
    if (timeLimitRaw.trim() !== "") {
      timeLimitSeconds = Number(timeLimitRaw);
      if (!Number.isInteger(timeLimitSeconds) || timeLimitSeconds <= 0) {
        errs.push("Batas waktu harus bilangan bulat lebih dari 0, atau kosong");
      }
    }

    let difficultyValue: number | null = null;
    if (difficultyRaw.trim() !== "") {
      difficultyValue = Number(difficultyRaw);
      if (!(difficultyValue >= 0 && difficultyValue <= 1)) {
        errs.push("Tingkat kesulitan harus antara 0 dan 1");
      }
    }

    // --- opsi dan penilaian ---
    const optionPayload: ItemOptionPayload[] = [];
    let answerKey: ItemPayload["answerKey"] = null;

    if (type === "TEXT_INPUT") {
      const accepted = acceptedAnswers
        .split(",")
        .map((a) => a.trim().toLowerCase())
        .filter((a) => a !== "");
      if (accepted.length === 0)
        errs.push("Minimal satu jawaban yang diterima");

      const scoring: Record<string, string[]> = {};
      for (const tier of scoringTiers) {
        const pts = tier.points.trim();
        if (!pts || Number.isNaN(Number(pts))) {
          errs.push("Poin pada aturan skor harus berupa angka");
          continue;
        }
        const tierAnswers = tier.answers
          .split(",")
          .map((a) => a.trim().toLowerCase())
          .filter((a) => a !== "");
        if (tierAnswers.length === 0) {
          errs.push(`Jawaban untuk poin ${pts} tidak boleh kosong`);
          continue;
        }
        scoring[pts] = tierAnswers;
      }

      answerKey = {
        accepted,
        ...(Object.keys(scoring).length > 0 ? { scoring } : {}),
        ...(normalize !== "NONE" ? { normalize } : {}),
      };
    } else if (type === "LIKERT") {
      if (options.length < 2) errs.push("Minimal 2 opsi");
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
    } else if (type === "FORCED_CHOICE") {
      if (options.length < 2) errs.push("Minimal 2 opsi untuk pilihan paksa");
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
        if (!o.scaleId) {
          errs.push(`Skala untuk opsi ${key} wajib dipilih`);
        }
        const p = Number(o.points);
        if (o.points.trim() === "" || Number.isNaN(p)) {
          errs.push(`Poin opsi ${key} wajib diisi`);
        }
        const targetScale = scales.find((s) => s.id === o.scaleId);
        optionPayload.push({
          key,
          label: label || null,
          imageUrl: imageUrl || null,
          order: i + 1,
          scoring: {
            points: Number.isNaN(p) ? 1 : p,
            scaleId: o.scaleId || undefined,
            scaleCode: targetScale?.code || undefined,
          },
        });
      });
    } else {
      if (options.length < 2) errs.push("Minimal 2 opsi");
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
      toast.error(errs.toLocaleString());
      return null;
    }

    return {
      ...(isEdit ? {} : { sectionId }),
      number: n,
      type,
      content: {
        text: text || null,
        images: cleanImages,
        audioUrl: item?.content?.audioUrl ?? null,
      },
      options: optionPayload,
      groupId: groupId || null,
      scaleId: type === "FORCED_CHOICE" ? null : scaleId || null,
      reverseScored: type === "LIKERT" ? reverseScored : false,
      weight: w,
      scoredInTotal,
      consistencyGroup: consistencyGroup || null,
      answerKey,
      timeLimitSeconds,
      constraints: item?.constraints ?? {},
      difficulty: difficultyValue,
      isExample,
      status,
      tags: tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== ""),
    };
  };

  const submit = async (addNext: boolean, formData: FormData) => {
    const payload = buildPayload(formData);
    if (!payload) return;
    try {
      setIsSubmitting(true);
      const ok = await onSubmit(payload, addNext);
      if (ok && addNext && !isEdit) resetForNext(payload.number);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit(false, new FormData(e.currentTarget));
    // onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      void submit(!isEdit, new FormData(e.currentTarget));
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      noValidate
    >
      <div className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* NOMOR & TIPE */}
          <div className="w-22">
            <Label
              htmlFor="item-number"
              required
              tooltip={`Nomor urut soal di section ${sectionCode}. Harus unik dalam satu section.`}
            >
              Nomor
            </Label>
            <Input
              id="item-number"
              name="number"
              type="number"
              min="1"
              defaultValue={isEdit && item ? item.number : nextNumber}
              className="w-full"
            />
          </div>

          {/* ISI SOAL */}
          <div className="w-full">
            <Label
              htmlFor="item-text"
              tooltip="Teks soal. Boleh kosong jika soal berupa gambar saja."
            >
              Isi soal
            </Label>
            <Textarea
              id="item-text"
              name="text"
              defaultValue={item?.content?.text ?? ""}
              rows={3}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <Label tooltip="Gambar yang ditampilkan bersama soal (mis. gambar A, B, C pada TIU 5). Karena belum ada upload, tempel URL gambar yang sudah diunggah ke storage.">
            Gambar stimulus
          </Label>
          <StimulusImage images={images} setImages={setImages} />
        </div>

        {/* SKALA */}
        {type !== "FORCED_CHOICE" ? (
          <div>
            <Label
              htmlFor="item-scale"
              tooltip="Skala yang dinilai oleh soal ini. Skala milik section yang sedang dipilih ditampilkan lebih dulu. Jika section hanya punya satu skala, otomatis terpilih."
            >
              Skala
            </Label>
            <Select
              id="item-scale"
              name="scaleId"
              defaultValue={
                item?.scaleId ??
                (sectionScales.length === 1 ? sectionScales[0].id : "")
              }
              className="w-full"
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
              <p className="mt-1 text-xs text-text-secondary">
                Belum ada skala. Buat skala dulu di tab Scales.
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-divider bg-surface-secondary/40 p-3 text-xs text-text-secondary">
            Skala pada soal bertipe{" "}
            <strong>Pilihan paksa (FORCED_CHOICE)</strong> ditentukan per opsi
            di bawah.
          </div>
        )}

        {/* OPSI & PENILAIAN */}
        <div className="space-y-3 border-t border-divider pt-4">
          <TypeFields
            preset={preset}
            setPreset={setPreset}
            keyStyle={keyStyle}
            setKeyStyle={setKeyStyle}
            LIKERT_PRESETS={LIKERT_PRESETS}
            options={options}
            setOptions={setOptions}
            correctIndex={correctIndex}
            setCorrectIndex={setCorrectIndex}
            reverseScored={reverseScored}
            setReverseScored={setReverseScored}
            acceptedAnswers={acceptedAnswers}
            setAcceptedAnswers={setAcceptedAnswers}
            scoringTiers={scoringTiers}
            setScoringTiers={setScoringTiers}
            normalize={normalize}
            setNormalize={setNormalize}
            isAbility={isAbility}
            type={type}
            scales={orderedScales}
            blankOption={blankOption}
            optionKey={optionKey}
            isEdit={isEdit}
            handleTypeChange={handleTypeChange}
          />
        </div>

        {/* LANJUTAN */}
        <div className="border-t border-divider pt-3">
          <Advanced item={item} tags={tags} setTags={setTags} />
        </div>
      </div>

      {/* FOOTER */}
      <div className="sticky bottom-0 bg-bg-paper z-10 flex flex-wrap items-center justify-end gap-2 border-t border-divider p-4">
        <Button
          type="button"
          variant="outlined"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant={isEdit ? undefined : "outlined"}
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <LoaderCircle className="animate-spin" /> : undefined
          }
        >
          {isEdit ? "Simpan Perubahan" : "Simpan dan close"}
        </Button>
        {!isEdit && (
          <Button
            type="button"
            onClick={() => {
              if (formRef.current) {
                void submit(true, new FormData(formRef.current));

                setTimeout(() => {
                  const dialog = formRef.current?.closest(
                    '[data-slot="dialog"]',
                  );
                  if (dialog) dialog.scrollTo({ top: 0, behavior: "smooth" });
                }, 50);
              }
            }}
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <LoaderCircle className="animate-spin" />
              ) : undefined
            }
          >
            Simpan dan tambah berikutnya
          </Button>
        )}
      </div>
    </form>
  );
}
