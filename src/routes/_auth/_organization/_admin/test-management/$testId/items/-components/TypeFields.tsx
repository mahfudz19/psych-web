import { useRef, type Dispatch, type SetStateAction } from "react";
import type { ItemType } from "../../../-api/test-definitions.type";
import {
  Button,
  IconButton,
  Input,
  Label,
  Select,
} from "../../norms/-components/NormTableService/Normform/ui";
import Radio from "../../../../../../../../components/ui/Radio";
import { Plus, X } from "lucide-react";
import Checkbox from "../../../../../../../../components/ui/Checkbox";

const TYPE_OPTIONS: { value: ItemType; label: string; supported: boolean }[] = [
  { value: "SINGLE_CHOICE", label: "Pilihan tunggal", supported: true },
  { value: "LIKERT", label: "Skala Likert", supported: true },
  { value: "TEXT_INPUT", label: "Isian teks", supported: true },
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
  { value: "DRAWING", label: "Gambar (segera)", supported: false },
];

type SupportedType = "SINGLE_CHOICE" | "LIKERT" | "TEXT_INPUT";

const MAX_CHOICE_OPTIONS = 8;
const MAX_LIKERT_OPTIONS = 10;

interface DraftOption {
  label: string;
  imageUrl: string;
  points: string;
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

function inferNormalizeMode(raw: string): NormalizeMode | null {
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  // Cek apakah setiap jawaban valid sebagai angka (mendukung desimal atau tanda +/- opsional)
  const allNumeric = parts.every((part) =>
    /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(part),
  );

  return allNumeric ? "TRIM_LEADING_ZEROS" : "NONE";
}

function AcceptedAnswersFields(props: {
  acceptedAnswers: string;
  setAcceptedAnswers: Dispatch<SetStateAction<string>>;
  normalize: NormalizeMode;
  setNormalize: Dispatch<SetStateAction<NormalizeMode>>;
}) {
  const { acceptedAnswers, setAcceptedAnswers, normalize, setNormalize } =
    props;
  const isManualSelect = useRef(false);

  const handleAnswersChange = (nextValue: string) => {
    setAcceptedAnswers(nextValue);

    if (!nextValue.trim()) {
      isManualSelect.current = false;
      setNormalize("NONE");
      return;
    }

    if (!isManualSelect.current) {
      const inferred = inferNormalizeMode(nextValue);
      if (inferred) {
        setNormalize(inferred);
      }
    }
  };

  const handleNormalizeChange = (nextMode: NormalizeMode) => {
    isManualSelect.current = true;
    setNormalize(nextMode);
  };

  return (
    <div className="flex gap-1">
      <div className="w-full">
        <span className="text-xs text-text-secondary">
          Masukkan jawaban yang diterima, dipisah koma jika jawaban lebih dari
          satu. Contoh: bunga, kembang
        </span>
        <Input
          type="text"
          value={acceptedAnswers}
          onChange={(e) => handleAnswersChange(e.target.value)}
          placeholder="bunga, kembang atau 01, 1"
          className="w-full"
        />
      </div>
      <div>
        <Label
          htmlFor="timeLimitSeconds"
          required
          tooltip="Batas waktu subtes. Server menutup subtes otomatis saat habis. Kosongkan jika tanpa batas. Isi sesuai manual tes."
        >
          Batas Waktu (Detik)
        </Label>
        <br />
        <Select
          id="normalize-mode"
          value={normalize}
          onChange={(e) =>
            handleNormalizeChange(e.target.value as NormalizeMode)
          }
        >
          <option value="NONE">Tidak ada (exact match)</option>
          <option value="TRIM_LEADING_ZEROS">
            Hapus nol di depan (untuk angka)
          </option>
          <option value="LOWERCASE">Huruf kecil (untuk teks)</option>
        </Select>
      </div>
    </div>
  );
}

export type NormalizeMode = "NONE" | "TRIM_LEADING_ZEROS" | "LOWERCASE";

function TextInput(props: {
  acceptedAnswers: string;
  setAcceptedAnswers: Dispatch<SetStateAction<string>>;
  scoringTiers: ScoringTier[];
  setScoringTiers: Dispatch<SetStateAction<ScoringTier[]>>;
  normalize: NormalizeMode;
  setNormalize: Dispatch<SetStateAction<NormalizeMode>>;
}) {
  const {
    acceptedAnswers,
    setAcceptedAnswers,
    scoringTiers,
    setScoringTiers,
    normalize,
    setNormalize,
  } = props;

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Jawaban yang diterima</span>
      </div>
      <AcceptedAnswersFields
        acceptedAnswers={acceptedAnswers}
        setAcceptedAnswers={setAcceptedAnswers}
        normalize={normalize}
        setNormalize={setNormalize}
      />

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm font-medium">Aturan skor bertingkat</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setScoringTiers((prev) => [
              ...prev,
              { points: `${prev.length + 1}`, answers: "" },
            ]);

            setTimeout(() => {
              contentRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }, 50);
          }}
          startIcon={<Plus size={16} />}
        >
          Tingkat
        </Button>
      </div>
      <p className="mt-1 text-xs text-text-secondary">
        Opsional. Tiap tingkat: poin dan jawaban yang mendapat poin tersebut,
        dipisah koma jika lebih dari satu.
      </p>
      <div
        className="space-y-2 max-h-[calc(100dvh-380px)] overflow-auto"
        ref={contentRef}
      >
        {scoringTiers.map((tier, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              type="number"
              value={tier.points}
              placeholder="Poin"
              onChange={(e) =>
                setScoringTiers((prev) =>
                  prev.map((t, j) =>
                    j === i ? { ...t, points: e.target.value } : t,
                  ),
                )
              }
              className="w-20"
            />
            <Input
              type="text"
              value={tier.answers}
              placeholder="jawaban1, jawaban2"
              onChange={(e) =>
                setScoringTiers((prev) =>
                  prev.map((t, j) =>
                    j === i ? { ...t, answers: e.target.value } : t,
                  ),
                )
              }
              className="min-w-32 flex-1"
            />
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              color="error"
              onClick={() =>
                setScoringTiers((prev) => prev.filter((_, j) => j !== i))
              }
            >
              <X size={16} />
            </IconButton>
          </div>
        ))}
      </div>
    </>
  );
}

export interface ScoringTier {
  points: string;
  answers: string;
}

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
    blankOption,
    optionKey,
    handleTypeChange,
    isEdit,
  } = props;

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

  const modeLabel =
    type === "LIKERT"
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
            <>
              <p className="mt-1 text-xs text-text-secondary">
                Poin diberikan otomatis sesuai urutan (opsi pertama = 1). Pakai
                preset agar tidak mengetik ulang di setiap soal.
              </p>
              <Select
                value={preset}
                onChange={(e) => applyPreset(e.target.value)}
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
                  <div key={i} className="flex items-center gap-2 relative">
                    <Tag>{i + 1}</Tag>
                    <Input
                      type="text"
                      value={o.label}
                      onChange={(e) =>
                        updateOption(i, { label: e.target.value })
                      }
                      className="min-w-0 flex-1 pr-20"
                    />
                    <div className="flex items-center gap-1 absolute right-1">
                      <span className="shrink-0 rounded bg-primary-main/10 px-1.5 py-0.5 text-xs text-primary-main">
                        poin {i + 1}
                      </span>
                      <IconButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        color="error"
                        onClick={() => removeOption(i)}
                        disabled={options.length <= 2}
                      >
                        <X size={16} />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap justify-between items-center gap-4">
                <Checkbox
                  checked={reverseScored}
                  onChange={(e) => setReverseScored(e.target.checked)}
                  label="Balik skor (soal bernada negatif)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addOption}
                  startIcon={<Plus size={16} />}
                >
                  Opsi
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-1 text-xs text-text-secondary">
                {isAbility
                  ? "Pilih satu opsi sebagai kunci jawaban. Opsi boleh berupa teks, URL gambar, atau keduanya."
                  : "Beri poin pada setiap opsi. Skala wajib dipilih di atas."}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary">
                  Penomoran opsi
                </span>
                <Select
                  value={keyStyle}
                  onChange={(e) =>
                    setKeyStyle(e.target.value as "number" | "letter")
                  }
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
                      <Radio
                        name="item-correct"
                        checked={correctIndex === i}
                        onChange={() => setCorrectIndex(i)}
                        aria-label={`Kunci jawaban opsi ${optionKey(keyStyle, i)}`}
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
                    <IconButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      color="error"
                      onClick={() => removeOption(i)}
                      disabled={options.length <= 2}
                    >
                      <X size={16} />
                    </IconButton>
                  </div>
                ))}
              </div>
              <div className="text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addOption}
                  disabled={options.length >= MAX_CHOICE_OPTIONS}
                  startIcon={<Plus size={16} />}
                >
                  Opsi
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export default TypeFields;
