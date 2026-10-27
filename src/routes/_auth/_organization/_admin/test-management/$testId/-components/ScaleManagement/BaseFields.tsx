import Checkbox from "../../../../../../../../components/ui/Checkbox";
import Input from "../../../../../../../../components/ui/Input";
import Label from "../../../../../../../../components/ui/Label";
import Select from "../../../../../../../../components/ui/Select";
import type {
  CompositeMethod,
  ScaleFormInitial,
  ScaleOption,
  ScaleType,
  SectionOption,
} from "./ScaleForm";

/** Semua turunan (anak, cucu, dst.) dari sebuah skala. Dipakai agar induk tidak membentuk siklus. */
function collectDescendants(scales: ScaleOption[], rootId: string) {
  const result = new Set<string>();
  const queue = [rootId];
  while (queue.length > 0) {
    const current = queue.shift() as string;
    for (const s of scales) {
      if (s.parentScaleId === current && !result.has(s.id)) {
        result.add(s.id);
        queue.push(s.id);
      }
    }
  }
  return result;
}

const SCALE_TYPES: { value: ScaleType; label: string; hint: string }[] = [
  {
    value: "DIMENSION",
    label: "Dimensi (DIMENSION)",
    hint: "Faktor utama yang diukur. Contoh: O, C, E, A, N pada Big Five.",
  },
  {
    value: "FACET",
    label: "Facet (FACET)",
    hint: "Sub-aspek di bawah dimensi. Pilih skala induknya di bawah.",
  },
  {
    value: "SUBTEST",
    label: "Subtes (SUBTEST)",
    hint: "Skala yang sama dengan satu section. Wajib memilih section. Contoh: SE, WA pada IST, atau TOTAL pada TIU 5.",
  },
  {
    value: "VALIDITY",
    label: "Validitas (VALIDITY)",
    hint: "Skala untuk memeriksa kejujuran atau konsistensi jawaban. Contoh: L, F, K pada MMPI.",
  },
  {
    value: "COMPOSITE",
    label: "Gabungan (COMPOSITE)",
    hint: "Gabungan dari skala lain. Wajib memilih skala sumber. Contoh: total IST.",
  },
  {
    value: "TYPE_POLE",
    label: "Kutub Tipe (TYPE_POLE)",
    hint: "Salah satu kutub pada tes tipologi. Contoh: E dan I pada MBTI.",
  },
];

interface Props {
  scale?: ScaleFormInitial;
  sections: SectionOption[];
  compositeMethod: CompositeMethod;
  sourceCodes: string[];
  scales: ScaleOption[];
  type: ScaleType;
  handleTypeChange: (value: ScaleType) => void;
  toggleSource: (code: string) => void;
  handleCompositeMethod: (method: CompositeMethod) => void;
}

function BaseField(props: Props) {
  const {
    scales,
    sections,
    sourceCodes,
    compositeMethod,
    type,
    handleTypeChange,
    scale,
    toggleSource,
    handleCompositeMethod,
  } = props;
  const isEdit = Boolean(scale);
  // Skala induk: bukan dirinya sendiri dan bukan turunannya.
  const excluded = scale?.id
    ? new Set([scale.id, ...collectDescendants(scales, scale.id)])
    : new Set<string>();
  const parentOptions = scales.filter((s) => !excluded.has(s.id));

  // Sumber skor gabungan: semua skala selain dirinya sendiri.
  const sourceOptions = scales.filter((s) => s.id !== scale?.id);

  const typeHint = SCALE_TYPES.find((t) => t.value === type)?.hint;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="code"
            required={!isEdit}
            tooltip="Kunci skala, unik dalam satu tes dan tidak bisa diubah. Skala gabungan merujuk skala lain lewat kode ini. Contoh: TOTAL, E, SE, Hs."
          >
            Kode Skala
          </Label>
          <Input
            id="code"
            name="code"
            type="text"
            defaultValue={scale?.code}
            placeholder="Contoh: TOTAL"
            disabled={isEdit}
            className="w-full"
          />
          <p className="mt-1 text-xs text-text-secondary">
            Huruf, angka, underscore. Maksimal 30 karakter.
          </p>
        </div>
        <div>
          <Label
            htmlFor="name"
            required
            tooltip="Nama skala yang tampil di laporan hasil. Contoh: Extraversion, Skor Total TIU 5."
          >
            Nama Aspek
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={scale?.name}
            placeholder="Contoh: Extraversion"
            className="w-full"
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor="type"
          required
          tooltip="Jenis skala. Menentukan isian yang wajib: SUBTEST butuh section, COMPOSITE butuh skala sumber."
        >
          Tipe Skala
        </Label>
        <Select
          id="type"
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as ScaleType)}
          className="w-full"
        >
          {SCALE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        {typeHint && (
          <p className="mt-1 text-xs text-text-secondary">{typeHint}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="sectionId"
            required={type === "SUBTEST"}
            tooltip="Section yang dinilai skala ini. Wajib untuk tipe SUBTEST. Section otomatis mencatat skala ini di scaleIds miliknya."
          >
            Section
          </Label>
          <Select
            id="sectionId"
            name="sectionId"
            defaultValue={scale?.sectionId ?? ""}
            className="w-full"
          >
            <option value="">-- Tidak terhubung --</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </Select>
          {sections.length === 0 && (
            <p className="mt-1 text-xs text-text-secondary">
              Belum ada section. Buat section dulu di tab Sections.
            </p>
          )}
        </div>
        <div>
          <Label
            htmlFor="parentScaleId"
            tooltip="Untuk hierarki, misalnya facet di bawah dimensi. Kosongkan jika skala ini berdiri sendiri."
          >
            Skala Induk
          </Label>
          <Select
            id="parentScaleId"
            name="parentScaleId"
            defaultValue={scale?.parentScaleId ?? ""}
            className="w-full"
          >
            <option value="">-- Tanpa induk --</option>
            {parentOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Skala sumber, hanya untuk COMPOSITE */}
      {type === "COMPOSITE" && (
        <div className="rounded-2xl border border-divider p-4 space-y-3">
          <Label
            required
            tooltip="Skala yang digabung. Buat skala sumber lebih dulu. Disimpan berdasarkan kode skala."
          >
            Skala Sumber
          </Label>
          {sourceOptions.length === 0 ? (
            <p className="mt-1 text-xs text-text-secondary">
              Belum ada skala lain. Buat skala sumber dulu, lalu kembali ke
              sini.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {sourceOptions.map((s) => (
                <Checkbox
                  key={s.id}
                  checked={sourceCodes.includes(s.code)}
                  onChange={() => toggleSource(s.code)}
                  sizes="lg"
                  label={
                    <div className="text-xs">
                      <span className="font-mono">{s.code}</span>
                      <br />
                      <span>{s.name}</span>
                    </div>
                  }
                />
              ))}
            </div>
          )}

          <div>
            <Label
              htmlFor="compositeMethod"
              tooltip="SUM = dijumlahkan. MEAN = dirata-rata."
            >
              Cara Menggabungkan
            </Label>
            <Select
              id="compositeMethod"
              value={compositeMethod}
              onChange={(e) =>
                handleCompositeMethod(e.target.value as CompositeMethod)
              }
              className="w-full"
            >
              <option value="SUM">Jumlah (SUM)</option>
              <option value="MEAN">Rata-rata (MEAN)</option>
            </Select>
          </div>
        </div>
      )}
    </>
  );
}

export default BaseField;
