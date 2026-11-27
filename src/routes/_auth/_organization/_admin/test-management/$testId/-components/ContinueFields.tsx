import { useState } from "react";
import Checkbox from "../../../../../../../components/ui/Checkbox";
import Input from "../../../../../../../components/ui/Input";
import Label from "../../../../../../../components/ui/Label";
import Textarea from "../../../../../../../components/ui/Textarea";
import formatMinutesHint from "../../../../../../../components/utility/formatMinutesHint";
import ExampleField from "./ExampleField";
import type {
  ConfigInputType,
  ConfigLayout,
  SectionConfig,
  SectionFormInitial,
  StimulusContentType,
  WordListGroup,
} from "./SectionForm";
import Select from "../../../../../../../components/ui/Select";

function normalizeWordListGroups(content: unknown): WordListGroup[] {
  if (!content || typeof content !== "object") return [];

  const obj = content as Record<string, unknown>;

  if (Array.isArray(obj.groups)) {
    return obj.groups.map((g) => {
      const group = g as Record<string, unknown>;
      return {
        category: String(group.category ?? ""),
        words: Array.isArray(group.words) ? group.words.map(String) : [],
      };
    });
  }

  if (Array.isArray(obj.words)) {
    return [{ category: "UMUM", words: obj.words.map(String) }];
  }

  return [];
}

const cleanConfig = (cfg: SectionConfig): SectionConfig => {
  const result: SectionConfig = {};
  for (const [key, val] of Object.entries(cfg)) {
    if (val !== undefined && val !== "") {
      result[key] = val;
    }
  }
  return result;
};

const ConfigField = ({ section }: { section?: SectionFormInitial }) => {
  const [config, setConfig] = useState<SectionConfig>(
    () => (section?.config as SectionConfig) ?? {},
  );
  const [jsonMode, setJsonMode] = useState(false);

  const itemType = section?.defaultItemType ?? "SINGLE_CHOICE";
  const isTextInput = itemType === "TEXT_INPUT";
  const isChoice =
    itemType === "SINGLE_CHOICE" || itemType === "MULTIPLE_CHOICE";

  const updateKey = <K extends keyof SectionConfig>(
    key: K,
    value: SectionConfig[K],
  ) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: value };
      // Jika inputType diubah dari NUMBER ke TEXT/kosong, hapus allowDecimals
      if (key === "inputType" && value !== "NUMBER") {
        delete next.allowDecimals;
      }
      return next;
    });
  };

  const serializedConfig = JSON.stringify(cleanConfig(config));

  return (
    <div className="rounded-2xl border border-divider p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Label
          htmlFor="config"
          tooltip="Konfigurasi unik subtes tanpa mengubah skema."
        >
          Konfigurasi Subtes (Config)
        </Label>
        <button
          type="button"
          onClick={() => setJsonMode((prev) => !prev)}
          className="text-xs underline text-text-secondary hover:text-text-primary"
        >
          {jsonMode ? "Gunakan Form Builder" : "Edit JSON Mentah"}
        </button>
      </div>

      {!jsonMode && (
        <input type="hidden" name="config" value={serializedConfig} />
      )}

      {jsonMode ? (
        <Textarea
          id="config"
          name="config"
          value={JSON.stringify(cleanConfig(config), null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              if (
                parsed &&
                typeof parsed === "object" &&
                !Array.isArray(parsed)
              ) {
                setConfig(parsed);
              }
            } catch {
              // Tunggu sampai JSON valid
            }
          }}
          rows={5}
          spellCheck={false}
          className="w-full font-mono"
        />
      ) : (
        <div className="space-y-4">
          {/* Opsi khusus Choice (SINGLE_CHOICE / MULTIPLE_CHOICE) */}
          {isChoice && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="configLayout">Layout Opsi</Label>
                <Select
                  id="configLayout"
                  value={config.layout ?? ""}
                  onChange={(e) =>
                    updateKey(
                      "layout",
                      (e.target.value || undefined) as ConfigLayout | undefined,
                    )
                  }
                  className="w-full"
                >
                  <option value="">Default</option>
                  <option value="VERTICAL">VERTICAL</option>
                  <option value="HORIZONTAL">HORIZONTAL</option>
                </Select>
              </div>
            </div>
          )}

          {/* Opsi khusus TEXT_INPUT */}
          {isTextInput && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <Label htmlFor="configInputType">Tipe Input</Label>
                <Select
                  id="configInputType"
                  value={config.inputType ?? ""}
                  onChange={(e) =>
                    updateKey(
                      "inputType",
                      (e.target.value || undefined) as
                        ConfigInputType | undefined,
                    )
                  }
                  className="w-full"
                >
                  <option value="">Default (TEXT)</option>
                  <option value="TEXT">TEXT</option>
                  <option value="NUMBER">NUMBER</option>
                </Select>
              </div>

              {config.inputType === "NUMBER" && (
                <div className="pt-5">
                  <Checkbox
                    checked={Boolean(config.allowDecimals ?? false)}
                    onChange={(e) =>
                      updateKey("allowDecimals", e.target.checked)
                    }
                    label="Izinkan angka desimal (allowDecimals)"
                  />
                </div>
              )}
            </div>
          )}

          {/* Flag Boolean Umum */}
          <div className="flex flex-wrap gap-6 pt-1">
            <Checkbox
              checked={Boolean(config.containsImages ?? false)}
              onChange={(e) =>
                updateKey("containsImages", e.target.checked || undefined)
              }
              label="Soal mengandung gambar (containsImages)"
            />

            {isChoice && (
              <Checkbox
                checked={Boolean(config.sharedOptionsByGroup ?? false)}
                onChange={(e) =>
                  updateKey(
                    "sharedOptionsByGroup",
                    e.target.checked || undefined,
                  )
                }
                label="Opsi bersama per grup (sharedOptionsByGroup)"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function TimeLimitSecondsField({ displaySeconds }: { displaySeconds: string }) {
  const [secondsValue, setSecondsValue] = useState<string>(displaySeconds);

  return (
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
        value={secondsValue}
        onChange={(e) => setSecondsValue(e.target.value)}
        className="w-full"
      />
      <p className="mt-1 text-xs text-text-secondary">
        {formatMinutesHint(secondsValue)}
      </p>
    </div>
  );
}

const MemorizationPhase = ({ section, useStimulus, setUseStimulus }: Props) => {
  const stimulus = section?.stimulusPhase ?? null;

  const [contentType, setContentType] = useState<string>(
    stimulus?.contentType ?? "WORD_LIST",
  );
  const [groups, setGroups] = useState<WordListGroup[]>(() =>
    normalizeWordListGroups(stimulus?.content),
  );
  const [rawContent, setRawContent] = useState<string>(() =>
    JSON.stringify(stimulus?.content ?? { groups: [] }, null, 2),
  );
  const [jsonMode, setJsonMode] = useState(false);

  const isWordList = contentType === "WORD_LIST";

  // Payload JSON final yang dikirim ke backend
  const serializedContent =
    isWordList && !jsonMode
      ? JSON.stringify({
          groups: groups.map((g) => ({
            category: g.category.trim(),
            words: g.words.map((w) => w.trim()).filter(Boolean),
          })),
        })
      : rawContent;

  const addGroup = () => {
    setGroups((prev) => [...prev, { category: "", words: [] }]);
  };

  const removeGroup = (index: number) => {
    setGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const updateGroupCategory = (index: number, category: string) => {
    setGroups((prev) =>
      prev.map((g, i) => (i === index ? { ...g, category } : g)),
    );
  };

  const updateGroupWords = (index: number, rawWords: string) => {
    const words = rawWords.split(",").map((w) => w.trimStart());
    setGroups((prev) =>
      prev.map((g, i) => (i === index ? { ...g, words } : g)),
    );
  };

  const toggleJsonMode = () => {
    if (!jsonMode) {
      // Sinkronkan state builder ke raw JSON sebelum masuk mode JSON
      setRawContent(JSON.stringify({ groups }, null, 2));
    } else {
      // Sinkronkan raw JSON balik ke state builder
      try {
        const parsed = JSON.parse(rawContent);
        setGroups(normalizeWordListGroups(parsed));
      } catch {
        // Biarkan state lama jika JSON belum valid
      }
    }
    setJsonMode((prev) => !prev);
  };

  return (
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
              <select
                id="stimulusContentType"
                name="stimulusContentType"
                value={contentType}
                onChange={(e) =>
                  setContentType(e.target.value as StimulusContentType)
                }
                className="w-full rounded-lg border border-divider bg-transparent px-3 py-2 text-sm"
              >
                <option value="WORD_LIST">WORD_LIST (Daftar Kata)</option>
                <option value="TEXT">TEXT (Teks Bebas)</option>
                <option value="IMAGE">IMAGE (Gambar)</option>
              </select>
            </div>

            <TimeLimitSecondsField
              displaySeconds={String(stimulus?.displaySeconds ?? 180)}
            />
          </div>

          <Checkbox
            name="stimulusHideAfter"
            defaultChecked={Boolean(stimulus?.hideAfter ?? true)}
            label="Sembunyikan konten setelah waktu habis"
          />

          {/* Isi Konten */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label
                htmlFor="stimulusContent"
                required
                tooltip="Isi yang dihafal peserta sebelum masuk ke soal."
              >
                Isi Konten Hafalan
              </Label>

              {isWordList && (
                <button
                  type="button"
                  onClick={toggleJsonMode}
                  className="text-xs underline text-text-secondary hover:text-text-primary"
                >
                  {jsonMode ? "Gunakan Form Builder" : "Edit JSON Mentah"}
                </button>
              )}
            </div>

            {isWordList && !jsonMode ? (
              <>
                <input
                  type="hidden"
                  name="stimulusContent"
                  value={serializedContent}
                />

                <div className="space-y-3">
                  {groups.length === 0 && (
                    <p className="text-xs text-text-secondary italic">
                      Belum ada kategori kata. Klik tombol di bawah untuk
                      menambah.
                    </p>
                  )}

                  {groups.map((group, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-divider p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-text-secondary">
                          Kategori #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeGroup(idx)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Hapus
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <Label>Nama Kategori</Label>
                          <Input
                            type="text"
                            value={group.category}
                            onChange={(e) =>
                              updateGroupCategory(idx, e.target.value)
                            }
                            placeholder="Contoh: BUNGA"
                            className="w-full"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label>Daftar Kata (pisahkan dengan koma)</Label>
                          <Input
                            type="text"
                            value={group.words.join(", ")}
                            onChange={(e) =>
                              updateGroupWords(idx, e.target.value)
                            }
                            placeholder="SOKA, LARAT, FLAMBOYAN, YASMIN, DAHLIA"
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addGroup}
                    className="rounded-lg border border-divider px-3 py-1.5 text-xs font-medium hover:bg-surface-secondary"
                  >
                    + Tambah Kategori Kata
                  </button>
                </div>
              </>
            ) : (
              <Textarea
                id="stimulusContent"
                name="stimulusContent"
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                rows={6}
                spellCheck={false}
                className="w-full font-mono"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface Props {
  section?: SectionFormInitial;
  useStimulus: boolean;
  setUseStimulus: React.Dispatch<React.SetStateAction<boolean>>;
}

function ContinueField(props: Props) {
  const { section, useStimulus, setUseStimulus } = props;

  return (
    <>
      {/* Contoh soal */}
      <div>
        <ExampleField section={section} />
      </div>

      {/* Fase hafalan */}
      <div>
        <MemorizationPhase
          section={section}
          useStimulus={useStimulus}
          setUseStimulus={setUseStimulus}
        />
      </div>

      {/* Config */}
      <div>
        <ConfigField section={section} />
      </div>
    </>
  );
}

export default ContinueField;
