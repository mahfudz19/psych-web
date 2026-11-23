import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { useRef, useState, type MouseEvent } from "react";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import IconButton from "../ui/IconButton";

function UploadDialog(props: {
  isUploading: boolean;
  upload(file: File): Promise<void>;
  trigger?: (
    openDialog: (e?: React.MouseEvent | Element | Event) => void,
  ) => React.ReactNode;
}) {
  const { isUploading = false, upload, trigger } = props;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadButtonRef = useRef<HTMLButtonElement | null>(null);

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

    // Pindahkan fokus ke tombol Unggah agar user bisa langsung tekan Enter
    requestAnimationFrame(() => {
      uploadButtonRef.current?.focus();
    });
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
    if (!selectedFile || isUploading) return;

    setLocalError("");
    try {
      await upload(selectedFile);
      resetLocalState();
      closeDialog();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal mengunggah gambar";
      setLocalError(message);
    }
  };

  const triggerElement = (
    openDialog: (
      e?:
        | Element
        | Event
        | MouseEvent<Element, globalThis.MouseEvent>
        | undefined,
    ) => void,
  ) => {
    if (trigger) return trigger(openDialog);
    return (
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
    );
  };

  return (
    <>
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

      <Dialog maxWidth="sm" dismissible={!isUploading} trigger={triggerElement}>
        {(closeDialog) => (
          <div
            onKeyDown={(e) => {
              if (e.key === "Enter" && selectedFile && !isUploading) {
                // Abaikan jika fokus sedang berada di tombol Batal, Ganti, atau Close (X)
                const activeTag = document.activeElement?.tagName;
                if (
                  activeTag === "BUTTON" &&
                  document.activeElement !== uploadButtonRef.current
                ) {
                  return;
                }

                e.preventDefault();
                e.stopPropagation();
                void handleUpload(closeDialog);
              }
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6">
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
                color="error"
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

            {/* Dropzone Area */}
            {!selectedFile ? (
              <div className="space-y-3 rounded-2xl px-6">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex max-h-64 min-h-64 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-primary-main bg-primary-main/5 text-primary-main"
                      : "border-divider hover:border-primary/60 hover:bg-divider/20 text-text-secondary"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-divider/40">
                    <ImagePlus size={24} className="text-text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-text-primary">
                      Klik atau seret gambar ke sini
                    </p>
                    <p className="text-xs text-text-secondary">
                      Mendukung format PNG, JPG, GIF, atau WEBP
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Preview Gambar Terpilih */
              <div className="space-y-3 rounded-2xl px-6">
                <div className="relative flex justify-center overflow-hidden rounded-xl border border-divider bg-divider/20">
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
                    Ganti
                  </Button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {localError && (
              <p className="px-6 pt-2 text-xs text-error">{localError}</p>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 p-6">
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
                ref={uploadButtonRef}
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
    </>
  );
}

export default UploadDialog;
