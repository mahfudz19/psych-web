import { NORM_EDUCATION } from "../norm-utils";
import type {
  NormTable,
  NormTargetScoreType,
} from "../../../../-api/test-definitions.type";
import { Input, Label, Select } from "./ui";
import { TARGET_LABEL } from "./constants";

interface Props {
  norm?: NormTable;
  isEdit: boolean;
  target: NormTargetScoreType | null;
}

export default function IdentityFields({ norm, isEdit, target }: Props) {
  return (
    <>
      {/* IDENTITAS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_120px_minmax(0,180px)]">
        <div>
          <Label
            htmlFor="norm-name"
            required
            tooltip="Nama yang dilihat admin. Contoh: Norma TIU 5 Umum, atau Norma IST SE usia 25-29."
          >
            Nama norma
          </Label>
          <Input
            id="norm-name"
            name="name"
            type="text"
            defaultValue={norm?.name ?? ""}
            className="w-full"
          />
        </div>
        <div>
          <Label
            htmlFor="norm-version"
            required
            tooltip="Dicatat di setiap hasil agar hasil lama bisa dihitung ulang. Contoh: 2024.1."
            className="whitespace-nowrap"
          >
            Versi norma
          </Label>
          <Input
            id="norm-version"
            name="normVersion"
            type="text"
            defaultValue={isEdit ? (norm?.normVersion ?? "") : ""}
            className="w-full"
          />
        </div>
        <div>
          <Label
            htmlFor="norm-target"
            tooltip="Jenis skor hasil konversi. Diturunkan otomatis dari jenis skor skala, jadi tidak bisa salah."
          >
            Skor tujuan
          </Label>
          <Input
            id="norm-target"
            type="text"
            value={target ? (TARGET_LABEL[target] ?? target) : "-"}
            disabled
            className="w-full"
          />
        </div>
      </div>

      {/* KELOMPOK PEMBANDING */}
      <div>
        <Label tooltip="Norma ini dipakai untuk peserta yang sesuai kelompok ini (usia, jenis kelamin, pendidikan). Kosongkan untuk berlaku bagi semua.">
          Kelompok pembanding
        </Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <Label className="text-xs font-normal capitalize">Usia dari</Label>
            <Input
              name="ageMin"
              type="number"
              min="0"
              defaultValue={norm?.criteria.ageMin?.toString() ?? ""}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-xs font-normal capitalize">
              Usia sampai
            </Label>
            <Input
              name="ageMax"
              type="number"
              min="0"
              defaultValue={norm?.criteria.ageMax?.toString() ?? ""}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-xs font-normal capitalize">
              Jenis kelamin
            </Label>
            <Select
              name="gender"
              defaultValue={norm?.criteria.gender ?? "ANY"}
              className="w-full"
              aria-label="Jenis kelamin"
            >
              <option value="ANY">Semua</option>
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-normal capitalize">Pendidikan</Label>
            <Select
              name="education"
              defaultValue={norm?.criteria.education ?? "ANY"}
              className="w-full"
              aria-label="Pendidikan"
            >
              <option value="ANY">Semua</option>
              {NORM_EDUCATION.map((edu) => (
                <option key={edu} value={edu}>
                  {edu}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </>
  );
}
