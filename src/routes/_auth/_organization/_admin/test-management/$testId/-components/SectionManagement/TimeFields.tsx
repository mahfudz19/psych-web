import Input from "../../../../../../../../components/ui/Input";
import Label from "../../../../../../../../components/ui/Label";
import Select from "../../../../../../../../components/ui/Select";
import type { SectionFormInitial } from "./SectionForm";

const ITEM_TYPES = [
  { value: "SINGLE_CHOICE", label: "Pilihan Tunggal (SINGLE_CHOICE)" },
  { value: "MULTI_CHOICE", label: "Pilihan Ganda (MULTI_CHOICE)" },
  { value: "TRUE_FALSE", label: "Benar/Salah (TRUE_FALSE)" },
  { value: "YES_NO", label: "Ya/Tidak (YES_NO)" },
  { value: "LIKERT", label: "Skala Likert (LIKERT)" },
  { value: "FORCED_CHOICE", label: "Pilihan Paksa (FORCED_CHOICE)" },
  { value: "MOST_LEAST", label: "Paling/Paling Tidak (MOST_LEAST)" },
  { value: "RANKING", label: "Peringkat (RANKING)" },
  { value: "NUMERIC_INPUT", label: "Isian Angka (NUMERIC_INPUT)" },
  { value: "TEXT_INPUT", label: "Isian Teks (TEXT_INPUT)" },
  { value: "DRAWING", label: "Gambar (DRAWING)" },
];

function TimeField({ section }: { section?: SectionFormInitial }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="timeLimitSeconds"
            required
            tooltip="Batas waktu subtes. Server menutup subtes otomatis saat habis. Kosongkan jika tanpa batas. Isi sesuai manual tes."
          >
            Batas Waktu (Detik)
          </Label>
          <Input
            id="timeLimitSeconds"
            name="timeLimitSeconds"
            type="number"
            min="1"
            defaultValue={section?.timeLimitSeconds ?? ""}
            placeholder="Kosong = tanpa batas"
            className="w-full"
          />
          <p className="mt-1 text-xs text-text-secondary">
            Contoh: 360 detik = 6 menit.
          </p>
        </div>
        <div>
          <Label
            htmlFor="itemCount"
            required
            tooltip="Jumlah soal yang diharapkan di subtes ini. Dibandingkan dengan soal yang sudah diinput untuk melihat progres."
          >
            Jumlah Soal
          </Label>
          <Input
            id="itemCount"
            name="itemCount"
            type="number"
            min="0"
            defaultValue={section?.itemCount ?? 0}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="navigationPolicy"
            required
            tooltip="FREE = peserta boleh kembali ke soal sebelumnya. FORWARD_ONLY = hanya maju (umum di IST)."
          >
            Navigasi
          </Label>
          <Select
            id="navigationPolicy"
            name="navigationPolicy"
            defaultValue={section?.navigationPolicy ?? "FREE"}
            className="w-full"
          >
            <option value="FREE">Bebas (FREE)</option>
            <option value="FORWARD_ONLY">Hanya Maju (FORWARD_ONLY)</option>
          </Select>
        </div>
        <div>
          <Label
            htmlFor="defaultItemType"
            required
            tooltip="Menentukan komponen tampilan soal bawaan di subtes ini. Setiap soal tetap menyimpan tipenya sendiri."
          >
            Tipe Soal Bawaan
          </Label>
          <Select
            id="defaultItemType"
            name="defaultItemType"
            defaultValue={section?.defaultItemType ?? "SINGLE_CHOICE"}
            className="w-full"
          >
            {ITEM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </>
  );
}

export default TimeField;
