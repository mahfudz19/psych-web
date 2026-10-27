import { useRef, useState } from "react";
import type { NormTable } from "../../../../-api/test-definitions.type";
import { Input, InputDate, Label } from "./ui";
import { ChevronRight } from "lucide-react";

const dateOnly = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");

interface Props {
  norm?: NormTable;
  onDirty: () => void;
}

export default function AdvancedFields({ norm, onDirty }: Props) {
  const [validFrom, setValidFrom] = useState(dateOnly(norm?.validFrom));
  const [validUntil, setValidUntil] = useState(dateOnly(norm?.validUntil));
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
        Lanjutan (sumber, ukuran sampel, masa berlaku)
      </summary>
      <div className="mt-3 space-y-3" ref={contentRef}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
          <div>
            <Label
              htmlFor="norm-source"
              tooltip="Dari mana norma ini berasal. Contoh: Manual TIU 5, LPSP3 Fakultas Psikologi UI."
            >
              Sumber norma
            </Label>
            <Input
              id="norm-source"
              name="source"
              type="text"
              defaultValue={norm?.source ?? ""}
              className="w-full"
            />
          </div>
          <div>
            <Label
              htmlFor="norm-sample"
              tooltip="Jumlah orang pada sampel norma, sebagai bukti kualitas."
              className="whitespace-nowrap"
            >
              Ukuran sampel
            </Label>
            <Input
              id="norm-sample"
              name="sampleSize"
              type="number"
              min="1"
              defaultValue={norm?.sampleSize?.toString() ?? ""}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label
              htmlFor="norm-from"
              tooltip="Awal masa berlaku. Kosongkan untuk berlaku sejak disimpan."
            >
              Berlaku dari
            </Label>
            <InputDate
              id="norm-from"
              type="date"
              value={validFrom}
              onChange={(e) => {
                setValidFrom(e.target.value);
                onDirty();
              }}
              isClearable
              fullWidth
            />
            <input type="hidden" name="validFrom" value={validFrom} />
          </div>
          <div>
            <Label
              htmlFor="norm-until"
              tooltip="Akhir masa berlaku. Kosongkan jika tanpa akhir."
            >
              Berlaku sampai
            </Label>
            <InputDate
              id="norm-until"
              type="date"
              value={validUntil}
              onChange={(e) => {
                setValidUntil(e.target.value);
                onDirty();
              }}
              isClearable
              fullWidth
            />
            <input type="hidden" name="validUntil" value={validUntil} />
          </div>
        </div>
      </div>{" "}
    </details>
  );
}
