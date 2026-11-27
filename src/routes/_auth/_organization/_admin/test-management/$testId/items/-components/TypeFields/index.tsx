import { type Dispatch, type SetStateAction } from "react";
import type { ItemType } from "../../../../-api/test-definitions.type";
import LikertField from "./LikertField";
import SingleChoice from "./SingleChoice";
import TextInput from "./TextInput";
import Label from "../../../../../../../../../components/ui/Label";
import Select from "../../../../../../../../../components/ui/Select";

const TYPE_OPTIONS: { value: ItemType; label: string; supported: boolean }[] = [
  { value: "SINGLE_CHOICE", label: "Pilihan tunggal", supported: true },
  { value: "LIKERT", label: "Skala Likert", supported: true },
  { value: "TEXT_INPUT", label: "Isian teks", supported: true },
  {
    value: "FORCED_CHOICE",
    label: "Pilihan paksa (forced choice)",
    supported: true,
  },
  { value: "MULTI_CHOICE", label: "Pilihan ganda (segera)", supported: false },
  { value: "TRUE_FALSE", label: "Benar/salah (segera)", supported: false },
  { value: "YES_NO", label: "Ya/tidak (segera)", supported: false },
  {
    value: "MOST_LEAST",
    label: "Paling / paling tidak (segera)",
    supported: false,
  },
  { value: "RANKING", label: "Peringkat (segera)", supported: false },
  { value: "NUMERIC_INPUT", label: "Isian angka (segera)", supported: false },
  { value: "DRAWING", label: "Gambar (segera)", supported: false },
];

export type SupportedType =
  | "SINGLE_CHOICE"
  | "LIKERT"
  | "TEXT_INPUT"
  | "FORCED_CHOICE";

export const MAX_CHOICE_OPTIONS = 8;
export const MAX_LIKERT_OPTIONS = 10;

export interface DraftOption {
  label: string;
  imageUrl: string;
  points: string;
  scaleId?: string;
}

export type NormalizeMode = "NONE" | "TRIM_LEADING_ZEROS" | "LOWERCASE";

export interface ScoringTier {
  points: string;
  answers: string;
}

import type { ItemScaleOption } from "../ItemForm";

function TypeFields(props: {
  preset: string;
  setPreset: Dispatch<SetStateAction<string>>;
  keyStyle: "number" | "letter";
  setKeyStyle: Dispatch<SetStateAction<"number" | "letter">>;
  LIKERT_PRESETS: Record<string, { label: string; labels: string[] }>;
  options: DraftOption[];
  setOptions: Dispatch<SetStateAction<DraftOption[]>>;
  correctIndex: number | null;
  setCorrectIndex: Dispatch<SetStateAction<number | null>>;
  reverseScored: boolean;
  setReverseScored: Dispatch<SetStateAction<boolean>>;
  acceptedAnswers: string;
  setAcceptedAnswers: Dispatch<SetStateAction<string>>;
  scoringTiers: ScoringTier[];
  setScoringTiers: Dispatch<SetStateAction<ScoringTier[]>>;
  normalize: NormalizeMode;
  setNormalize: Dispatch<SetStateAction<NormalizeMode>>;
  isAbility: boolean;
  type: SupportedType;
  scales: ItemScaleOption[];
  blankOption: () => DraftOption;
  optionKey: (style: "number" | "letter", index: number) => string;
  handleTypeChange: (next: ItemType) => void;
  isEdit: boolean;
}) {
  const {
    preset,
    setPreset,
    keyStyle,
    setKeyStyle,
    LIKERT_PRESETS,
    options,
    setOptions,
    correctIndex,
    setCorrectIndex,
    reverseScored,
    setReverseScored,
    acceptedAnswers,
    setAcceptedAnswers,
    scoringTiers,
    setScoringTiers,
    normalize,
    setNormalize,

    isAbility,
    type,
    scales,
    blankOption,
    optionKey,
    handleTypeChange,
    isEdit,
  } = props;

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

  const modeLabel =
    type === "FORCED_CHOICE"
      ? "Skala per opsi"
      : type === "LIKERT"
        ? "Aturan skor (poin)"
        : isAbility
          ? "Kunci jawaban"
          : "Aturan skor (poin)";

  return (
    <>
      <div className="w-full">
        <Label
          htmlFor="item-type"
          required
          tooltip="Menentukan bentuk opsi dan cara penilaian. Mengganti tipe mengosongkan opsi."
        >
          Tipe soal
        </Label>
        <br />
        <Select
          id="item-type"
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as ItemType)}
          disabled={isEdit}
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value} disabled={!t.supported}>
              {t.label}
            </option>
          ))}
        </Select>
        {isEdit && (
          <p className="mt-1 text-xs text-text-secondary">
            Tipe tidak bisa diubah. Hapus dan buat ulang jika salah.
          </p>
        )}
      </div>
      {type === "TEXT_INPUT" ? (
        <TextInput
          acceptedAnswers={acceptedAnswers}
          setAcceptedAnswers={setAcceptedAnswers}
          scoringTiers={scoringTiers}
          setScoringTiers={setScoringTiers}
          normalize={normalize}
          setNormalize={setNormalize}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Opsi dan penilaian</span>
            <span className="rounded bg-black/5 px-2 py-0.5 text-xs text-text-secondary dark:bg-white/10">
              {modeLabel}
            </span>
          </div>
          {type === "LIKERT" ? (
            <LikertField
              preset={preset}
              setPreset={setPreset}
              LIKERT_PRESETS={LIKERT_PRESETS}
              options={options}
              setOptions={setOptions}
              reverseScored={reverseScored}
              setReverseScored={setReverseScored}
              addOption={addOption}
              removeOption={removeOption}
              updateOption={updateOption}
            />
          ) : (
            <SingleChoice
              isAbility={isAbility}
              keyStyle={keyStyle}
              setKeyStyle={setKeyStyle}
              options={options}
              correctIndex={correctIndex}
              setCorrectIndex={setCorrectIndex}
              optionKey={optionKey}
              updateOption={updateOption}
              removeOption={removeOption}
              addOption={addOption}
              isForcedChoice={type === "FORCED_CHOICE"}
              scales={scales}
            />
          )}
        </>
      )}
    </>
  );
}

export default TypeFields;
