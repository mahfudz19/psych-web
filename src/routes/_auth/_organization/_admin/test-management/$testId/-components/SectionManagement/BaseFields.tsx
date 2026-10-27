import Input from "../../../../../../../../components/ui/Input";
import Label from "../../../../../../../../components/ui/Label";
import Select from "../../../../../../../../components/ui/Select";
import Textarea from "../../../../../../../../components/ui/Textarea";
import type { SectionFormInitial } from "./SectionForm";

function BaseField({
  section,
  nextOrder,
}: {
  section: SectionFormInitial;
  nextOrder: number;
}) {
  const isEdit = Boolean(section);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="code"
            required
            tooltip="Kunci subtes, unik dalam satu tes dan tidak bisa diubah setelah dibuat. Tes tanpa subtes cukup memakai MAIN. Contoh IST: SE, WA, AN."
          >
            Kode Section
          </Label>
          <Input
            id="code"
            name="code"
            type="text"
            defaultValue={section?.code}
            placeholder="Contoh: MAIN"
            disabled={isEdit}
            className="w-full uppercase"
          />
          <p className="mt-1 text-xs text-text-secondary">
            Huruf besar, angka, underscore. Maksimal 20 karakter.
          </p>
        </div>
        <div>
          <Label
            htmlFor="order"
            required
            tooltip="Urutan pengerjaan subtes. Harus unik dalam satu tes. Subtes dengan urutan 1 dikerjakan pertama."
          >
            Urutan
          </Label>
          <Input
            id="order"
            name="order"
            type="number"
            min="1"
            required
            defaultValue={section?.order ?? nextOrder}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor="name"
          required
          tooltip="Nama subtes yang dilihat peserta. Contoh: Melengkapi Kalimat, Analogi Gambar."
        >
          Nama Section
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={section?.name}
          placeholder="Contoh: Analogi Gambar"
          className="w-full"
        />
      </div>

      <div>
        <Label
          htmlFor="instructions"
          required
          tooltip="Petunjuk khusus subtes ini, tampil sebelum soal pertama."
        >
          Instruksi Section
        </Label>
        <Textarea
          id="instructions"
          name="instructions"
          defaultValue={section?.instructions ?? ""}
          rows={4}
          className="w-full"
        />
      </div>

      <div>
        <Label
          htmlFor="status"
          required
          tooltip="ACTIVE = dipakai. RETIRED = disembunyikan tanpa dihapus. Ini bukan status tes (DRAFT/ACTIVE)."
        >
          Status Section
        </Label>
        <Select
          id="status"
          name="status"
          defaultValue={section?.status ?? "ACTIVE"}
          className="w-full"
        >
          <option value="ACTIVE">Aktif (ACTIVE)</option>
          <option value="RETIRED">Dipensiunkan (RETIRED)</option>
        </Select>
      </div>
    </>
  );
}

export default BaseField;
