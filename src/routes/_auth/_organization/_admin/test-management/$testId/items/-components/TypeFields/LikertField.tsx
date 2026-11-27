import { Plus, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { DraftOption } from ".";
import Checkbox from "../../../../../../../../../components/ui/Checkbox";
import Select from "../../../../../../../../../components/ui/Select";
import Input from "../../../../../../../../../components/ui/Input";
import IconButton from "../../../../../../../../../components/ui/IconButton";
import Button from "../../../../../../../../../components/ui/Button";

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-w-6 shrink-0 items-center justify-center rounded bg-black/5 px-1.5 py-0.5 text-xs text-text-secondary dark:bg-white/10">
      {children}
    </span>
  );
}

function LikertField(props: {
  preset: string;
  setPreset: Dispatch<SetStateAction<string>>;
  LIKERT_PRESETS: Record<string, { label: string; labels: string[] }>;
  options: DraftOption[];
  setOptions: Dispatch<SetStateAction<DraftOption[]>>;
  reverseScored: boolean;
  setReverseScored: Dispatch<SetStateAction<boolean>>;
  updateOption: (index: number, patch: Partial<DraftOption>) => void;
  removeOption: (index: number) => void;
  addOption: () => void;
}) {
  const {
    preset,
    setPreset,
    LIKERT_PRESETS,
    options,
    setOptions,
    reverseScored,
    setReverseScored,
    addOption,
    removeOption,
    updateOption,
  } = props;

  const applyPreset = (key: string) => {
    if (key === "custom") return;
    const p = LIKERT_PRESETS[key];
    if (!p) return;
    setPreset(key);
    setOptions(p.labels.map((label) => ({ label, imageUrl: "", points: "" })));
  };

  return (
    <>
      <p className="mt-1 text-xs text-text-secondary">
        Poin diberikan otomatis sesuai urutan (opsi pertama = 1). Pakai preset
        agar tidak mengetik ulang di setiap soal.
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
              onChange={(e) => updateOption(i, { label: e.target.value })}
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
  );
}

export default LikertField;
