import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import UploadDialog from "../../../../../../../../components/reusebale-components/UploadDialog";
import Button from "../../../../../../../../components/ui/Button";
import IconButton from "../../../../../../../../components/ui/IconButton";
import { inputVariants } from "../../../../../../../../components/ui/Input";
import Tooltip from "../../../../../../../../components/ui/Tooltip";
import { uploadApi } from "../../../../../../../../components/utility/uploadApi";

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-w-6 shrink-0 items-center justify-center rounded bg-divider/50 px-1.5 py-0.5 text-xs font-medium text-text-secondary dark:bg-white/10">
      {children}
    </span>
  );
}

function Thumb({ url, sm = false }: { url: string; sm?: boolean }) {
  if (!/^https?:\/\//i.test(url)) return null;
  let className =
    "w-full max-w-xs shrink-0 rounded border border-divider object-contain";
  if (sm)
    className = "h-7 w-7 shrink-0 rounded border border-divider object-cover";

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
          <div key={i} className="space-y-1 flex items-center gap-1">
            <Tag>{imageLabel(i)}</Tag>

            <div
              className={inputVariants({
                className: "flex gap-2 items-center w-full",
                size: "sm",
              })}
            >
              <Tooltip
                classNames={{ children: "flex w-full gap-1 items-center" }}
                title={<Thumb url={url.trim()} />}
              >
                <Thumb sm url={url.trim()} />
                <div className="truncate w-full text-text-secondary">{url}</div>
              </Tooltip>

              <UploadDialog
                isUploading={isUploading}
                upload={async (file) => {
                  try {
                    setRowErrors((prev) => ({ ...prev, [i]: "" }));
                    setUploadingIndex(i);
                    const res = await uploadApi(file, "TEST_ASSETS");
                    const cleanUrl = res.uploadUrl.split("?")[0];

                    setImages((prev) =>
                      prev.map((u, idx) => (idx === i ? cleanUrl : u)),
                    );
                  } catch (err) {
                    const message =
                      err instanceof Error
                        ? err.message
                        : "Gagal mengunggah gambar";
                    setRowErrors((prev) => ({ ...prev, [i]: message }));
                  } finally {
                    setUploadingIndex(null);
                  }
                }}
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
            </div>
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
