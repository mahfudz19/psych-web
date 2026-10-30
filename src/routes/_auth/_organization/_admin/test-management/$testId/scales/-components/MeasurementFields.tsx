import Input from "../../../../../../../../components/ui/Input";
import Label from "../../../../../../../../components/ui/Label";
import Select from "../../../../../../../../components/ui/Select";
import Textarea from "../../../../../../../../components/ui/Textarea";
import type { ScaleFormInitial, ScoreType } from "./ScaleForm";

const SCORE_TYPES: { value: ScoreType; label: string }[] = [
  { value: "RAW_ONLY", label: "Skor mentah saja (RAW_ONLY)" },
  { value: "RAW_AVERAGE", label: "Rata-rata skor mentah (RAW_AVERAGE)" },
  { value: "RAW_TO_SW", label: "Mentah ke Skor Standar (RAW_TO_SW)" },
  { value: "RAW_TO_WS", label: "Mentah ke Nilai Bobot (RAW_TO_WS)" },
  { value: "RAW_TO_IQ", label: "Mentah ke IQ (RAW_TO_IQ)" },
  { value: "RAW_TO_T", label: "Mentah ke T-Score (RAW_TO_T)" },
  { value: "RAW_TO_STEN", label: "Mentah ke Sten (RAW_TO_STEN)" },
  {
    value: "RAW_TO_PERCENTILE",
    label: "Mentah ke Persentil (RAW_TO_PERCENTILE)",
  },
  { value: "IPSATIVE", label: "Ipsatif / pilihan paksa (IPSATIVE)" },
  { value: "RANK_SUM", label: "Jumlah peringkat (RANK_SUM)" },
];

function MeasurementFields({ scale }: { scale?: ScaleFormInitial }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="rawMin"
            tooltip="Nilai terendah yang mungkin. Dipakai untuk memeriksa kelengkapan norma dan sumbu grafik."
          >
            Skor Mentah Minimum
          </Label>
          <Input
            id="rawMin"
            name="rawMin"
            type="number"
            defaultValue={scale?.rawMin ?? ""}
            placeholder="Contoh: 0"
            className="w-full"
          />
        </div>
        <div>
          <Label
            htmlFor="rawMax"
            tooltip="Nilai tertinggi yang mungkin. Contoh: 30 soal benar/salah = 30. 10 soal Likert 1-5 = 50."
          >
            Skor Mentah Maksimum
          </Label>
          <Input
            id="rawMax"
            name="rawMax"
            type="number"
            defaultValue={scale?.rawMax ?? ""}
            placeholder="Contoh: 30"
            className="w-full"
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor="scoreType"
          tooltip="Cara skor mentah diolah. Pilihan RAW_TO_... membutuhkan tabel norma di tab Norms. RAW_AVERAGE dan RAW_ONLY tidak butuh norma."
        >
          Jenis Skor
        </Label>
        <Select
          id="scoreType"
          name="scoreType"
          defaultValue={scale?.scoreType ?? "RAW_ONLY"}
          className="w-full"
        >
          {SCORE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <p className="mt-1 text-xs text-text-secondary">
          Pilihan yang diawali RAW_TO butuh norma. Isi skor mentah minimum dan
          maksimum agar kelengkapan norma bisa diperiksa.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="lowLabel"
            tooltip="Teks di ujung rendah grafik. Contoh: Introvert."
          >
            Label Kutub Rendah
          </Label>
          <Input
            id="lowLabel"
            name="lowLabel"
            type="text"
            defaultValue={scale?.lowLabel ?? ""}
            className="w-full"
          />
        </div>
        <div>
          <Label
            htmlFor="highLabel"
            tooltip="Teks di ujung tinggi grafik. Contoh: Ekstrovert."
          >
            Label Kutub Tinggi
          </Label>
          <Input
            id="highLabel"
            name="highLabel"
            type="text"
            defaultValue={scale?.highLabel ?? ""}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor="description"
          tooltip="Penjelasan skala yang tampil di laporan."
        >
          Deskripsi
        </Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={scale?.description ?? ""}
          rows={3}
          className="w-full"
        />
      </div>
    </>
  );
}

export default MeasurementFields;
