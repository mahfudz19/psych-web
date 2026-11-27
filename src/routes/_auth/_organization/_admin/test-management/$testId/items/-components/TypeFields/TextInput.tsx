import { Plus, X } from "lucide-react";
import { useRef, type Dispatch, type SetStateAction } from "react";
import type { ScoringTier } from ".";
import Input from "../../../../../../../../../components/ui/Input";
import Label from "../../../../../../../../../components/ui/Label";
import Select from "../../../../../../../../../components/ui/Select";
import Button from "../../../../../../../../../components/ui/Button";
import IconButton from "../../../../../../../../../components/ui/IconButton";

function inferNormalizeMode(raw: string): NormalizeMode | null {
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

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

export default TextInput;
