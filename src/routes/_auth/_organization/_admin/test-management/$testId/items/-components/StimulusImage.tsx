import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import Button from "../../../../../../../../components/ui/Button";
import Input from "../../../../../../../../components/ui/Input";
import IconButton from "../../../../../../../../components/ui/IconButton";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Plus,
  Upload,
  X,
} from "lucide-react";
import Tooltip from "../../../../../../../../components/ui/Tooltip";
import { uploadApi } from "../../../../../../../../components/utility/uploadApi";
import Dialog from "../../../../../../../../components/ui/Dialog";

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-w-6 shrink-0 items-center justify-center rounded bg-divider/50 px-1.5 py-0.5 text-xs font-medium text-text-secondary dark:bg-white/10">
      {children}
    </span>
  );
}

function Thumb({ url }: { url: string }) {
  if (!/^https?:\/\//i.test(url)) return null;
  return (
    <img
      key={url}
      src={url}
      alt=""
      className="w-full max-w-xs shrink-0 rounded border border-divider object-contain"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}

function UploadDialog(props: {
  isUploading: boolean;
  setUploadingIndex: Dispatch<SetStateAction<number | null>>;
  setImages: Dispatch<SetStateAction<string[]>>;
  setRowErrors: Dispatch<SetStateAction<Record<number, string>>>;
  i: number;
}) {
  const { isUploading, setRowErrors, setUploadingIndex, setImages, i } = props;

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

    const file = e.dataTransfer.files?.[0];
    handleSelectFile(file);
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
    setRowErrors((prev) => ({ ...prev, [i]: "" }));
    setUploadingIndex(i);

    try {
      const res = await uploadApi(selectedFile, "TEST_ASSETS");
      const cleanUrl = res.uploadUrl.split("?")[0];

      setImages((prev) => prev.map((u, idx) => (idx === i ? cleanUrl : u)));
      resetLocalState();
      closeDialog();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal mengunggah gambar";
      setLocalError(message);
      setRowErrors((prev) => ({ ...prev, [i]: message }));
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
        <Tooltip title="Unggah file gambar">
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            disabled={isUploading}
            onClick={(e) => {
              resetLocalState();
              openDialog(e);
            }}
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
          </IconButton>
        </Tooltip>
      )}
    >
      {(closeDialog) => (
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-text-primary">
                Unggah Gambar Stimulus
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

          {/* Hidden File Input */}
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

          {/* Dropzone Area */}
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
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-divider hover:border-primary/60 hover:bg-divider/20 text-text-secondary"
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
            /* Preview Gambar Terpilih */
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

          {/* Error Message */}
          {localError && <p className="text-xs text-error">{localError}</p>}

          {/* Footer Actions */}
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

function StimulusImage(props: {
  images: string[];
  setImages: Dispatch<SetStateAction<string[]>>;
}) {
  const { images, setImages } = props;
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});

  const imageLabel = (index: number) => String.fromCharCode(65 + index);

  const moveRow = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {images.map((url, i) => {
        const isUploading = uploadingIndex === i;

        return (
          <div key={i} className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Tag>{imageLabel(i)}</Tag>

              <div className="relative flex-1">
                <Tooltip
                  classNames={{ children: "w-full" }}
                  title={<Thumb url={url.trim()} />}
                >
                  <Input
                    type="text"
                    value={url}
                    disabled={isUploading}
                    placeholder="https://... atau unggah gambar"
                    readOnly
                    className="w-full"
                  />
                </Tooltip>
              </div>

              <UploadDialog
                isUploading={isUploading}
                setRowErrors={setRowErrors}
                setUploadingIndex={setUploadingIndex}
                setImages={setImages}
                i={i}
              />

              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                disabled={i === 0 || isUploading}
                onClick={() => moveRow(i, i - 1)}
              >
                <ArrowUp size={16} />
              </IconButton>

              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                disabled={i === images.length - 1 || isUploading}
                onClick={() => moveRow(i, i + 1)}
              >
                <ArrowDown size={16} />
              </IconButton>

              <IconButton
                type="button"
                variant="ghost"
                color="error"
                size="sm"
                disabled={isUploading}
                onClick={() =>
                  setImages((prev) => prev.filter((_, idx) => idx !== i))
                }
              >
                <X size={16} />
              </IconButton>
            </div>

            {rowErrors[i] && (
              <p className="pl-8 text-xs text-error">{rowErrors[i]}</p>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setImages((prev) => [...prev, ""])}
          className={images.length === 0 ? "w-full" : undefined}
          startIcon={<Plus size={16} />}
        >
          Gambar stimulus
        </Button>
      </div>
    </div>
  );
}

export default StimulusImage;
