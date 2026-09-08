import { useState } from "react";
import Dialog from "../../ui/Dialog";
import toast from "../../ui/Toast";
import ImageEditor, { ImageEditorModal } from "../ImageEditor";
import DialogDelete from "../dialog/DialogDelete";

function FieldInputImage({
  onSave,
  defaultImage,
  width,
  height,
  shape,
  confirmDeleteImage,
  error,
  helperText,
  disabled,
  fullWidth,
  maxWidth = "xs",
  limitSize,
  message,
}: {
  defaultImage?: string | File | null;
  onSave: (
    _: string,
    __: File | null,
    data: FormData | null,
  ) => Promise<any> | void;
  width?: number;
  height?: number;
  shape?: "circle" | "square" | "rounded";
  confirmDeleteImage?: boolean;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string | React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  message?: string;
  limitSize?: number;
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [load, setLoad] = useState(false);

  // Konversi maxWidth prop menjadi Tailwind class untuk disuntikkan ke Dialog baru
  const maxWidthClass =
    {
      xs: "max-w-xs",
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
    }[maxWidth] || "max-w-xs";

  return (
    <>
      {/* 1. Dialog Utama (Untuk Edit Image) */}
      <Dialog
        dismissible={!load} // Mencegah dialog tertutup saat proses loading
        scroll="paper"
        className={`${fullWidth ? "w-full" : ""} ${maxWidthClass}`}
        trigger={(openEditDialog) => (
          /* 2. Dialog Delete (Bersarang di dalam trigger Edit) */
          <DialogDelete
            body={"Apa anda yakin ingin menghapus ini!!"}
            runFunction={async () => await onSave("", null, null)}
            trigger={(openDeleteDialog) => (
              /* 3. Komponen Inti yang akan memanggil open() yang sesuai */
              <ImageEditor
                width={width ?? 170}
                height={height ?? 170}
                shape={shape}
                defaultImage={defaultImage}
                disabled={disabled}
                limitSize={limitSize}
                error={error}
                message={message}
                onImageSelect={(imageData) => {
                  if (imageData) {
                    setSelectedImage(imageData);
                    openEditDialog(); // Panggil trigger Dialog Edit
                  } else {
                    if (confirmDeleteImage) {
                      openDeleteDialog(); // Panggil trigger Dialog Delete
                    } else {
                      onSave("", null, null);
                    }
                  }
                }}
              />
            )}
          />
        )}
      >
        {/* Render Props untuk konten dalam Dialog Edit */}
        {(closeDialog) => (
          <div className="flex flex-col w-full">
            {/* Header Pengganti prop 'title' dan 'closeButtom' */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Avatar</h2>
              <button
                type="button"
                disabled={load}
                onClick={() => {
                  setSelectedImage(null);
                  closeDialog();
                }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <span className="text-gray-500 font-bold px-2">✕</span>
              </button>
            </div>

            <div className="pb-2">
              <ImageEditorModal
                width={width ?? 170}
                height={height ?? 170}
                shape={shape}
                image={selectedImage}
                load={load}
                onSave={async (...p) => {
                  try {
                    setLoad(true);
                    await onSave(...p);
                    closeDialog(); // Tutup lewat argumen render prop
                  } catch (error: any) {
                    toast.error(error?.message || error || "Terjadi kesalahan");
                  } finally {
                    setLoad(false);
                  }
                }}
                onCancel={() => {
                  setSelectedImage(null);
                  closeDialog();
                }}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Helper Text tetap di luar struktur Dialog */}
      {helperText && (
        <div
          className={`mt-1 text-sm ${error ? "text-error-main" : "text-text-secondary"}`}
        >
          {helperText}
        </div>
      )}
    </>
  );
}

export default FieldInputImage;
