import {
  ImageIcon,
  Loader2,
  Plus,
  Type,
  Upload,
  X,
  ImagePlus,
} from "lucide-react";
import { useState, useRef, type Dispatch, type SetStateAction } from "react";
import Radio from "../../../../../../../../../components/ui/Radio";
import Dialog from "../../../../../../../../../components/ui/Dialog"; // Pastikan path ini benar
import { uploadApi } from "../../../../../../../../../components/utility/uploadApi";
import {
  Button,
  IconButton,
  Input,
  Select,
} from "../../../norms/-components/NormTableService/Normform/ui";
import { MAX_CHOICE_OPTIONS } from ".";

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

type OptionMode = "text" | "image";

// --- Komponen UploadDialog Khusus untuk SingleChoice ---
function SingleChoiceUploadDialog(props: {
  isUploading: boolean;
  setUploadingIndex: (index: number | null) => void;
  setUploadError: Dispatch<SetStateAction<Record<number, string>>>;
  updateOption: (index: number, patch: Partial<DraftOption>) => void;
  index: number;
}) {
  const {
    isUploading,
    setUploadingIndex,
    setUploadError,
    updateOption,
    index,
  } = props;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string>("");

  const resetLocalState = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setLocalError("");
    setIsDragging(false);
  };

  const handleSelectFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLocalError("File harus berupa gambar (PNG, JPG, WEBP, dll).");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setLocalError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleSelectFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleUpload = async (closeDialog: () => void) => {
    if (!selectedFile) return;

    setLocalError("");
    setUploadError((prev) => ({ ...prev, [index]: "" }));
    setUploadingIndex(index);

    try {
      const res = await uploadApi(selectedFile, "TEST_ASSETS");
      // Asumsi backend mengembalikan struktur ini:
      const publicUrl = `https://storage.googleapis.com/${res.bucket}/${res.fileKey}`;

      updateOption(index, {
        label: "", // Pastikan teks eksklusif kosong
        imageUrl: publicUrl,
      });
      resetLocalState();
      closeDialog();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal mengunggah gambar";
      setLocalError(message);
      setUploadError((prev) => ({ ...prev, [index]: message }));
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <Dialog
      maxWidth="sm"
      isDynamic
      dismissible={!isUploading}
      trigger={(openDialog) => (
        <button
          type="button"
          disabled={isUploading}
          onClick={(e) => {
            resetLocalState();
            openDialog(e);
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md border border-dashed border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-primary hover:text-primary ${
            isUploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Mengunggah...</span>
            </>
          ) : (
            <>
              <Upload size={14} />
              <span>Unggah gambar opsi</span>
            </>
          )}
        </button>
      )}
    >
      {(closeDialog) => (
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-text-primary">
                Unggah Gambar Opsi
              </h3>
              <p className="text-xs text-text-secondary">
                Seret gambar ke area di bawah atau pilih dari komputer.
              </p>
            </div>
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUploading}
              onClick={() => {
                resetLocalState();
                closeDialog();
              }}
            >
              <X size={18} />
            </IconButton>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleSelectFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          {!selectedFile ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-divider text-text-secondary hover:border-primary/60 hover:bg-divider/20"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-divider/40">
                <ImagePlus size={24} className="text-text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-text-primary">
                  Klik untuk memilih atau seret gambar ke sini
                </p>
                <p className="text-xs text-text-secondary">
                  Mendukung format PNG, JPG, GIF, atau WEBP
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 rounded-2xl border border-divider p-3">
              <div className="relative flex justify-center overflow-hidden rounded-xl bg-divider/20">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview unggahan"
                    className="max-h-56 w-auto object-contain"
                  />
                )}
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="truncate">
                  <p className="truncate font-medium text-text-primary">
                    {selectedFile.name}
                  </p>
                  <p className="text-text-secondary">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Ganti file
                </Button>
              </div>
            </div>
          )}

          {localError && <p className="text-xs text-error">{localError}</p>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUploading}
              onClick={() => {
                resetLocalState();
                closeDialog();
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!selectedFile || isUploading}
              onClick={() => void handleUpload(closeDialog)}
              startIcon={
                isUploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )
              }
            >
              {isUploading ? "Mengunggah..." : "Unggah"}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
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
                  className="inline-flex rounded-md border border-border bg-surface-secondary p-0.5"
                  role="group"
                  aria-label="Tipe konten opsi"
                >
                  <button
                    type="button"
                    onClick={() => handleSwitchMode(i, "text")}
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
                    {o.imageUrl.trim() ? (
                      <div className="flex flex-1 items-center justify-between rounded-md border border-border bg-surface px-2.5 py-1">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Thumb url={o.imageUrl.trim()} />
                          <span className="line-clamp-1 text-xs text-text-secondary">
                            Gambar terunggah ({o.imageUrl.trim()})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateOption(i, { imageUrl: "" })}
                          className="ml-2 text-xs text-error hover:underline"
                        >
                          Ganti
                        </button>
                      </div>
                    ) : (
                      // DI GANTI DENGAN DIALOG KITA
                      <SingleChoiceUploadDialog
                        index={i}
                        isUploading={isUploading}
                        setUploadingIndex={setUploadingIndex}
                        setUploadError={setUploadError}
                        updateOption={updateOption}
                      />
                    )}
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
