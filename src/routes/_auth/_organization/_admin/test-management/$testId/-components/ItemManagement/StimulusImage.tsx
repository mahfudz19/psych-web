import type { Dispatch, SetStateAction } from "react";
import Button from "../../../../../../../../components/ui/Button";
import Input from "../../../../../../../../components/ui/Input";
import IconButton from "../../../../../../../../components/ui/IconButton";
import { Plus, X } from "lucide-react";
import Tooltip from "../../../../../../../../components/ui/Tooltip";

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-w-6 shrink-0 items-center justify-center rounded bg-divider/50 px-1.5 py-0.5 text-xs text-text-secondary dark:bg-white/10">
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
      className="h-50 w-50 shrink-0 rounded border border-divider object-cover"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}

function StimulusImage({
  images,
  setImages,
}: {
  images: string[];
  setImages: Dispatch<SetStateAction<string[]>>;
}) {
  const imageLabel = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="space-y-2">
      {images.map((url, i) => (
        <div key={i} className="flex items-center gap-2 relative">
          <Tag>{imageLabel(i)}</Tag>
          <Tooltip
            classNames={{ children: "w-full" }}
            title={<Thumb url={url.trim()} />}
          >
            <Input
              type="text"
              value={url}
              placeholder="https://..."
              onChange={(e) =>
                setImages((prev) =>
                  prev.map((u, idx) => (idx === i ? e.target.value : u)),
                )
              }
              className="w-full pr-12"
            />
          </Tooltip>
          <IconButton
            type="button"
            variant="ghost"
            color="error"
            size="sm"
            onClick={() =>
              setImages((prev) => prev.filter((_, idx) => idx !== i))
            }
            className="absolute right-2"
          >
            <X size={18} />
          </IconButton>
        </div>
      ))}
      <div className="text-right">
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
