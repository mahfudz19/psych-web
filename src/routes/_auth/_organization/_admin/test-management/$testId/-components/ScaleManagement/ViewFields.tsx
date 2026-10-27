import type { Dispatch, SetStateAction } from "react";
import Checkbox from "../../../../../../../../components/ui/Checkbox";
import Input from "../../../../../../../../components/ui/Input";
import Label from "../../../../../../../../components/ui/Label";
import Select from "../../../../../../../../components/ui/Select";
import type { ScaleFormInitial, ScaleRole } from "./ScaleForm";
import InputColor from "../../../../../../../../components/ui/InputColor";

const ROLES: { value: ScaleRole; label: string }[] = [
  { value: "PERFORMANCE", label: "Kinerja (PERFORMANCE)" },
  { value: "EXPECTATION", label: "Ekspektasi (EXPECTATION)" },
  { value: "IMPORTANCE", label: "Kepentingan (IMPORTANCE)" },
  { value: "REFLECTION", label: "Refleksi (REFLECTION)" },
];

function ViewFields({
  scale,
  isValidityScale,
  setIsValidityScale,
}: {
  scale?: ScaleFormInitial;
  isValidityScale: boolean;
  setIsValidityScale: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="order"
            tooltip="Urutan di laporan dan grafik. Tidak harus unik. Kosongkan untuk otomatis (terakhir + 1) saat membuat, atau mempertahankan urutan lama saat mengubah."
          >
            Urutan
          </Label>
          <Input
            id="order"
            name="order"
            type="number"
            defaultValue={scale?.order ?? ""}
            placeholder="Otomatis"
            className="w-full"
          />
        </div>
        <div>
          <Label
            htmlFor="color"
            tooltip="Warna skala di grafik, format hex #RRGGBB."
          >
            Warna Grafik
          </Label>
          <InputColor
            id="color"
            name="color"
            defaultValue={scale?.color ?? ""}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor="role"
          tooltip="Hanya dipakai MSAI, yang mengukur aktivitas yang sama tiga kali (kinerja, ekspektasi, kepentingan). Tes lain biarkan PERFORMANCE."
        >
          Peran Skala
        </Label>
        <Select
          id="role"
          name="role"
          defaultValue={scale?.role ?? "PERFORMANCE"}
          className="w-full"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Checkbox
          name="isReported"
          defaultChecked={scale?.isReported ?? true}
          label="Tampilkan di laporan peserta"
        />
        <Checkbox
          checked={isValidityScale}
          onChange={(e) => setIsValidityScale(e.target.checked)}
          label="Skala validitas (untuk memeriksa kejujuran atau konsistensi jawaban)"
        />
      </div>
    </>
  );
}

export default ViewFields;
