import { ImageIcon, Loader2, Plus, Type, Upload, X } from "lucide-react";
import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { MAX_CHOICE_OPTIONS } from ".";
import UploadDialog from "../../../../../../../../../components/reusebale-components/UploadDialog";
import Radio from "../../../../../../../../../components/ui/Radio";
import { uploadApi } from "../../../../../../../../../components/utility/uploadApi";
import Tooltip from "../../../../../../../../../components/ui/Tooltip";
import Input, {
  inputVariants,
} from "../../../../../../../../../components/ui/Input";
import Select from "../../../../../../../../../components/ui/Select";
import IconButton from "../../../../../../../../../components/ui/IconButton";
import Button from "../../../../../../../../../components/ui/Button";

interface DraftOption {
  label: string;
  imageUrl: string;
  points: string;
}

function Thumb({ url, sm = false }: { url: string; sm?: boolean }) {
  if (!/^https?:\/\//i.test(url)) return null;
  let className =
    "w-full max-w-xs shrink-0 rounded border border-divider object-contain";
  if (sm)
    className = "h-6 w-6 shrink-0 rounded border border-divider object-cover";

  return (
    <img
      key={url}
      src={url}
      alt=""
      className={className}
      onError={(e) => (e.currentTarget.style.display = "none")}
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

type OptionMode = "text" | "image";

// --- Komponen UploadDialog Khusus untuk SingleChoice ---
function SingleChoiceUploadDialog(props: {
  imageUrl: string;
  isUploading: boolean;
  setUploadingIndex: (index: number | null) => void;
  setUploadError: Dispatch<SetStateAction<Record<number, string>>>;
  updateOption: (index: number, patch: Partial<DraftOption>) => void;
  index: number;
}) {
  const {
    imageUrl,
    isUploading,
    setUploadingIndex,
    setUploadError,
    updateOption,
    index,
  } = props;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const resetLocalState = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <UploadDialog
      isUploading={isUploading}
      trigger={(openDialog) => (
        <label
          className={inputVariants({
            className: "flex gap-2 items-center w-full",
            size: "sm",
          })}
        >
          <Tooltip
            classNames={{ children: "flex w-full gap-1 items-center" }}
            title={<Thumb url={imageUrl} />}
          >
            <Thumb sm url={imageUrl} />
            <div className="truncate w-full text-text-secondary">
              {imageUrl || "Click for uplaod"}
            </div>
          </Tooltip>
          <button
            type="button"
            disabled={isUploading}
            className="p-[0.315rem] text-primary-main"
            onClick={(e) => {
              resetLocalState();
              openDialog(e);
            }}
          >
            {isUploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
          </button>
        </label>
      )}
      upload={async (file: File) => {
        try {
          setUploadError((prev) => ({ ...prev, [index]: "" }));
          setUploadingIndex(index);
          const res = await uploadApi(file, "TEST_ASSETS");
          const publicUrl = res.uploadUrl.split("?")[0];

          updateOption(index, {
            label: "",
            imageUrl: publicUrl,
          });
          resetLocalState();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Gagal mengunggah gambar";
          setUploadError((prev) => ({ ...prev, [index]: message }));
        } finally {
          setUploadingIndex(null);
        }
      }}
    />
  );
}
// -----------------------------------------------------------

function SingleChoice(props: {
  isAbility: boolean;
  keyStyle: "number" | "letter";
  setKeyStyle: Dispatch<SetStateAction<"number" | "letter">>;
  options: DraftOption[];
  correctIndex: number | null;
  setCorrectIndex: Dispatch<SetStateAction<number | null>>;
  optionKey: (style: "number" | "letter", index: number) => string;
  updateOption: (index: number, patch: Partial<DraftOption>) => void;
  removeOption: (index: number) => void;
  addOption: () => void;
}) {
  const {
    isAbility,
    keyStyle,
    setKeyStyle,
    options,
    correctIndex,
    setCorrectIndex,
    optionKey,
    updateOption,
    removeOption,
    addOption,
  } = props;
  const textInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [modes, setModes] = useState<Record<number, OptionMode>>(() => {
    const initial: Record<number, OptionMode> = {};
    options.forEach((o, idx) => {
      initial[idx] = o.imageUrl.trim() && !o.label.trim() ? "image" : "text";
    });
    return initial;
  });

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<Record<number, string>>({});

  const getMode = (index: number, opt: DraftOption): OptionMode => {
    if (modes[index]) return modes[index];
    return opt.imageUrl.trim() ? "image" : "text";
  };

  const handleSwitchMode = (index: number, nextMode: OptionMode) => {
    setModes((prev) => ({ ...prev, [index]: nextMode }));
    setUploadError((prev) => ({ ...prev, [index]: "" }));

    if (nextMode === "text") {
      updateOption(index, { imageUrl: "" });
      requestAnimationFrame(() => textInputRefs.current[index]?.focus());
    } else {
      updateOption(index, { label: "" });
    }
  };

  const handleRemoveRow = (index: number) => {
    removeOption(index);
    setModes((prev) => {
      const next: Record<number, OptionMode> = {};
      Object.keys(prev).forEach((k) => {
        const num = Number(k);
        if (num < index) next[num] = prev[num];
        if (num > index) next[num - 1] = prev[num];
      });
      return next;
    });
  };

  return (
    <>
      <p className="mt-1 text-xs text-text-secondary">
        {isAbility
          ? "Pilih satu opsi sebagai kunci jawaban. Setiap opsi hanya boleh berupa teks atau gambar."
          : "Beri poin pada setiap opsi. Skala wajib dipilih di atas."}
      </p>

      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary">Penomoran opsi</span>
        <Select
          value={keyStyle}
          onChange={(e) => setKeyStyle(e.target.value as "number" | "letter")}
          aria-label="Penomoran opsi"
        >
          <option value="number">Angka (1, 2, 3)</option>
          <option value="letter">Huruf (a, b, c)</option>
        </Select>
      </div>

      <div className="space-y-2.5">
        {options.map((o, i) => {
          const currentMode = getMode(i, o);
          const isUploading = uploadingIndex === i;

          return (
            <div key={i} className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {isAbility && (
                  <Radio
                    name="item-correct"
                    checked={correctIndex === i}
                    onChange={() => setCorrectIndex(i)}
                    aria-label={`Kunci jawaban opsi ${optionKey(keyStyle, i)}`}
                  />
                )}

                <Tag>{optionKey(keyStyle, i)}</Tag>

                {/* Mode Switcher */}
                <div
                  className="inline-flex rounded-md border border-divider bg-surface-secondary p-0.5"
                  role="group"
                  aria-label="Tipe konten opsi"
                >
                  <button
                    type="button"
                    onClick={() => {
                      handleSwitchMode(i, "text");
                    }}
                    title="Gunakan Teks"
                    className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                      currentMode === "text"
                        ? "bg-surface text-text-primary shadow-xs"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Type size={13} />
                    <span>Teks</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode(i, "image")}
                    title="Gunakan Gambar"
                    className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                      currentMode === "image"
                        ? "bg-surface text-text-primary shadow-xs"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <ImageIcon size={13} />
                    <span>Gambar</span>
                  </button>
                </div>

                {/* Area Konten */}
                {currentMode === "text" ? (
                  <Input
                    ref={(el) => {
                      textInputRefs.current[i] = el;
                    }}
                    type="text"
                    value={o.label}
                    placeholder="Teks opsi"
                    onChange={(e) =>
                      updateOption(i, { label: e.target.value, imageUrl: "" })
                    }
                    className="min-w-44 flex-1"
                  />
                ) : (
                  <div className="flex min-w-44 flex-1 items-center gap-2">
                    <SingleChoiceUploadDialog
                      index={i}
                      imageUrl={o.imageUrl.trim()}
                      isUploading={isUploading}
                      setUploadingIndex={setUploadingIndex}
                      setUploadError={setUploadError}
                      updateOption={updateOption}
                    />
                  </div>
                )}

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
                  onClick={() => handleRemoveRow(i)}
                  disabled={options.length <= 2 || isUploading}
                >
                  <X size={16} />
                </IconButton>
              </div>

              {uploadError[i] && (
                <p className="pl-8 text-xs text-error">{uploadError[i]}</p>
              )}
            </div>
          );
        })}
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
  );
}

export default SingleChoice;
