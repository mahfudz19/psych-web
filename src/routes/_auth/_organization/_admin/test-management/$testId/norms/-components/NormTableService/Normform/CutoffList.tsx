import { ChevronRight, Plus, X } from "lucide-react";
import type { CutoffsAction } from "./state";
import type { DraftCutoff } from "./types";
import { Button, IconButton, Input } from "./ui";
import { useRef } from "react";

const FIELDS = [
  { key: "from", type: "number", placeholder: "Dari", aria: "dari" },
  { key: "to", type: "number", placeholder: "Sampai", aria: "sampai" },
  {
    key: "label",
    type: "text",
    placeholder: "Label (BS, B, S...)",
    aria: "label",
  },
] as const;

interface Props {
  cutoffs: DraftCutoff[];
  dispatch: (action: CutoffsAction) => void;
  readOnly: boolean;
}

export default function CutoffList({ cutoffs, dispatch, readOnly }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <details
      className="group border-t border-divider pt-3"
      onClick={() => {
        setTimeout(() => {
          contentRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 50);
      }}
    >
      <summary className="flex cursor-pointer list-none items-center gap-1 text-sm text-text-secondary hover:text-text-primary [&::-webkit-details-marker]:hidden">
        <ChevronRight
          size={16}
          className="transition-transform group-open:rotate-90"
        />
        Batas kategori (opsional)
      </summary>
      <div className="mt-3 space-y-3" ref={contentRef}>
        <p className="text-xs text-text-secondary">
          Batas kategori pada skor standar. Contoh TIU 5: BS = 17 sampai 20, B =
          13 sampai 16.
        </p>

        {cutoffs.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            {FIELDS.map((f) => (
              <Input
                key={f.key}
                type={f.type}
                value={c[f.key]}
                readOnly={readOnly}
                placeholder={f.placeholder}
                onChange={(e) =>
                  dispatch({
                    type: "set",
                    index: i,
                    field: f.key,
                    value: e.target.value,
                  })
                }
                size="sm"
                className="w-full"
                aria-label={`Batas kategori ${i + 1} ${f.aria}`}
              />
            ))}
            {!readOnly && (
              <IconButton
                type="button"
                onClick={() => dispatch({ type: "remove", index: i })}
                aria-label={`Hapus batas kategori ${i + 1}`}
                size="sm"
                color="error"
                variant="ghost"
              >
                <X size={16} />
              </IconButton>
            )}
          </div>
        ))}

        {!readOnly && (
          <div className="text-right">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              startIcon={<Plus size={16} />}
              onClick={() => dispatch({ type: "add" })}
            >
              Batas
            </Button>
          </div>
        )}
      </div>
    </details>
  );
}
