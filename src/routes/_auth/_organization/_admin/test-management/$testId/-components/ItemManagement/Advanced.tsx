import { ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import type { TestItem } from "../../../-api/test-definitions.type";
import Checkbox from "../../../../../../../../components/ui/Checkbox";
import Input from "../../../../../../../../components/ui/Input";
import Label from "../../../../../../../../components/ui/Label";
import Select from "../../../../../../../../components/ui/Select";

function Advanced({ item }: { item?: TestItem }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setShowAdvanced((v) => !v);
          setTimeout(() => {
            contentRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 50);
        }}
        className="text-sm text-text-secondary hover:text-text-primary inline-flex items-center gap-1"
      >
        <ChevronRight
          size={16}
          className={`transition-transform inline ${showAdvanced ? "rotate-90" : undefined}`}
        />
        Lanjutan (bobot, grup, waktu, soal contoh, status)
      </button>

      <div
        className={showAdvanced ? "mt-3 space-y-4" : "hidden"}
        ref={contentRef}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Label
              htmlFor="item-weight"
              tooltip="Bobot soal dalam perhitungan skor. Biasanya 1."
            >
              Bobot
            </Label>
            <Input
              id="item-weight"
              name="weight"
              type="number"
              step="any"
              defaultValue={item?.weight ?? 1}
              className="w-full"
            />
          </div>
          <div>
            <Label
              htmlFor="item-time"
              tooltip="Batas waktu khusus soal ini. Kosongkan jika waktu diatur per section."
            >
              Batas waktu (detik)
            </Label>
            <Input
              id="item-time"
              name="timeLimit"
              type="number"
              defaultValue={item?.timeLimitSeconds ?? ""}
              className="w-full"
            />
          </div>
          <div>
            <Label
              htmlFor="item-difficulty"
              tooltip="Tingkat kesulitan hasil kalibrasi. Boleh kosong."
            >
              Kesulitan (0-1)
            </Label>
            <Input
              id="item-difficulty"
              name="difficulty"
              type="number"
              step="any"
              defaultValue={
                item?.difficulty !== null && item?.difficulty !== undefined
                  ? String(item.difficulty)
                  : ""
              }
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="item-group"
              tooltip="Mengelompokkan beberapa soal yang berbagi satu bacaan atau gambar."
            >
              Grup soal
            </Label>
            <Input
              id="item-group"
              name="groupId"
              type="text"
              defaultValue={item?.groupId ?? ""}
              className="w-full"
            />
          </div>
          <div>
            <Label
              htmlFor="item-consistency"
              tooltip="Menautkan soal konsistensi dengan soal asalnya (EPPS)."
            >
              Kelompok konsistensi
            </Label>
            <Input
              id="item-consistency"
              name="consistencyGroup"
              type="text"
              defaultValue={item?.consistencyGroup ?? ""}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <Label
            htmlFor="item-tags"
            tooltip="Pengelompokan tambahan, dipisah koma. Contoh: verbal, numerik."
          >
            Tag
          </Label>
          <Input
            id="item-tags"
            name="tags"
            type="text"
            defaultValue={(item?.tags ?? []).join(", ")}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="item-status"
              tooltip="ACTIVE = dipakai. RETIRED = disembunyikan tanpa dihapus."
            >
              Status soal
            </Label>
            <Select
              id="item-status"
              name="status"
              defaultValue={item?.status ?? "ACTIVE"}
              className="w-full"
            >
              <option value="ACTIVE">Aktif (ACTIVE)</option>
              <option value="RETIRED">Dipensiunkan (RETIRED)</option>
            </Select>
          </div>
          <div className="flex items-start justify-end flex-col">
            <Checkbox
              name="scoredInTotal"
              defaultChecked={item?.scoredInTotal ?? true}
              label="Masuk skor utama"
            />
            <Checkbox
              name="isExample"
              defaultChecked={item?.isExample ?? false}
              label="Soal contoh (tidak dihitung skor)"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Advanced;
