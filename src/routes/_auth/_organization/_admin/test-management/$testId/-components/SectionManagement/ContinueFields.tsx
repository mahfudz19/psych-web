import Checkbox from "../../../../../../../../components/ui/Checkbox";
import Input from "../../../../../../../../components/ui/Input";
import Label from "../../../../../../../../components/ui/Label";
import Textarea from "../../../../../../../../components/ui/Textarea";
import type { SectionFormInitial } from "./SectionForm";

const toJson = (value: unknown, fallback: string) =>
  value === null || value === undefined
    ? fallback
    : JSON.stringify(value, null, 2);

function ContinueField({
  section,
  useStimulus,
  setUseStimulus,
}: {
  section: SectionFormInitial;
  useStimulus: boolean;
  setUseStimulus: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const stimulus = section?.stimulusPhase ?? null;

  return (
    <>
      {/* Contoh soal */}
      <div>
        <Checkbox
          name="showExamplesFirst"
          label="Tampilkan contoh soal sebelum soal pertama"
          defaultChecked={section?.showExamplesFirst ?? true}
        />

        <Label
          htmlFor="examples"
          required
          tooltip="Soal contoh atau latihan sebelum waktu berjalan (IST, CFIT, TIU 5). Array JSON. Kosongkan jika tidak ada."
        >
          Contoh Soal (JSON)
        </Label>
        <Textarea
          id="examples"
          name="examples"
          defaultValue={toJson(section?.examples ?? [], "[]")}
          rows={7}
          spellCheck={false}
          className="w-full font-mono"
        />
        <p className="mt-1 text-xs text-text-secondary">
          Bentuk yang disarankan:{" "}
          {
            '[{ content: { text, images: [{ label, url }] }, options: [{ key }], answer: ["3"], explanation }]'
          }
        </p>
      </div>

      {/* Fase hafalan */}
      <div className="rounded-2xl border border-divider p-4 space-y-4">
        <Checkbox
          checked={useStimulus}
          onChange={(e) => setUseStimulus(e.target.checked)}
          label="Aktifkan fase hafalan (khusus IST subtes ME)"
        />

        {useStimulus && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="stimulusContentType"
                  required
                  tooltip="Jenis konten yang dihafal peserta. Contoh: WORD_LIST."
                >
                  Jenis Konten
                </Label>
                <Input
                  id="stimulusContentType"
                  name="stimulusContentType"
                  type="text"
                  defaultValue={String(stimulus?.contentType ?? "WORD_LIST")}
                  className="w-full"
                />
              </div>
              <div>
                <Label
                  htmlFor="stimulusDisplaySeconds"
                  required
                  tooltip="Berapa detik konten ditampilkan sebelum disembunyikan."
                >
                  Lama Tampil (Detik)
                </Label>
                <Input
                  id="stimulusDisplaySeconds"
                  name="stimulusDisplaySeconds"
                  type="number"
                  min="1"
                  defaultValue={Number(stimulus?.displaySeconds ?? 180)}
                  className="w-full"
                />
              </div>
            </div>

            <Checkbox
              name="stimulusHideAfter"
              defaultChecked={Boolean(stimulus?.hideAfter ?? true)}
              label="Sembunyikan konten setelah waktu habis"
            />

            <div>
              <Label
                htmlFor="stimulusContent"
                required
                tooltip="Isi yang dihafal. Contoh daftar kata: { words: [...] }."
              >
                Isi Konten (JSON)
              </Label>
              <Textarea
                id="stimulusContent"
                name="stimulusContent"
                defaultValue={toJson(stimulus?.content, '{\n  "words": []\n}')}
                rows={5}
                spellCheck={false}
                className="w-full font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Config */}
      <div>
        <Label
          htmlFor="config"
          required
          tooltip="Konfigurasi unik subtes tanpa mengubah skema. Object JSON. Kosongkan jika tidak ada."
        >
          Config (JSON)
        </Label>
        <Textarea
          id="config"
          name="config"
          defaultValue={toJson(section?.config ?? {}, "{}")}
          rows={4}
          spellCheck={false}
          className="w-full font-mono"
        />
      </div>
    </>
  );
}

export default ContinueField;
