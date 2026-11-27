import { useState } from "react";
import type { TestExample } from "../../-api/test-definitions.type";
import Checkbox from "../../../../../../../components/ui/Checkbox";
import Input from "../../../../../../../components/ui/Input";
import Label from "../../../../../../../components/ui/Label";
import Textarea from "../../../../../../../components/ui/Textarea";
import formatMinutesHint from "../../../../../../../components/utility/formatMinutesHint";
import { Select } from "../norms/-components/NormTableService/Normform/ui";
import type {
  ConfigInputType,
  ConfigLayout,
  SectionConfig,
  SectionFormInitial,
  StimulusContentType,
  WordListGroup,
} from "./SectionForm";

function normalizeExamples(
  rawExamples?: Array<TestExample> | null,
): TestExample[] {
  if (!Array.isArray(rawExamples)) return [];

  return rawExamples.map((item) => {
    const legacy = item;

    const text = legacy.content?.text ?? "";
    const images = legacy.content?.images ?? [];

    const options = legacy.options?.map((opt) => ({
      key: opt.key ?? opt.label ?? "",
      label: opt.key ? (opt.label ?? "") : (opt.label ?? opt.label ?? ""),
    }));

    const answer = legacy.answer ?? "";
    const explanation = legacy.explanation;

    return {
      content: { text, images },
      options,
      answer,
      explanation,
    };
  });
}

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

const createEmptyExample = (
  needOptions: boolean,
  optionsCount = 5,
): TestExample => ({
  content: { text: "" },
  ...(needOptions
    ? {
        options: Array.from({ length: optionsCount }, (_, i) => ({
          key: String.fromCharCode(97 + i), // a, b, c, d, e
          label: "",
        })),
      }
    : {}),
  answer: "",
  explanation: "",
});

const ExampleField = ({ section }: { section?: SectionFormInitial }) => {
  const [examples, setExamples] = useState<TestExample[]>(() =>
    normalizeExamples(section?.examples),
  );
  const [jsonMode, setJsonMode] = useState(false);

  const itemType = section?.defaultItemType ?? "SINGLE_CHOICE";
  const config = section?.config ?? {};

  const isChoice =
    itemType === "SINGLE_CHOICE" || itemType === "MULTIPLE_CHOICE";
  const showOptionsEditor = isChoice && !config.sharedOptionsByGroup;
  const showImagesEditor = Boolean(config.containsImages);

  const updateExample = (
    index: number,
    updater: (prev: TestExample) => TestExample,
  ) => {
    setExamples((prev) =>
      prev.map((item, i) => (i === index ? updater(item) : item)),
    );
  };

  const addExample = () => {
    setExamples((prev) => [...prev, createEmptyExample(showOptionsEditor, 5)]);
  };

  const removeExample = (index: number) => {
    setExamples((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Checkbox
          name="showExamplesFirst"
          label="Tampilkan contoh soal sebelum soal pertama"
          defaultChecked={section?.showExamplesFirst ?? true}
        />
        <button
          type="button"
          onClick={() => setJsonMode((prev) => !prev)}
          className="text-xs underline text-text-secondary hover:text-text-primary"
        >
          {jsonMode ? "Gunakan Form Builder" : "Edit JSON Mentah"}
        </button>
      </div>

      {/* Nilai final yang dikirim saat form di-submit */}
      {!jsonMode && (
        <input type="hidden" name="examples" value={JSON.stringify(examples)} />
      )}

      {jsonMode ? (
        <div>
          <Label htmlFor="examples" required>
            Contoh Soal (JSON)
          </Label>
          <Textarea
            id="examples"
            name="examples"
            value={JSON.stringify(examples, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                if (Array.isArray(parsed)) setExamples(parsed);
              } catch {
                // Biarkan user selesai mengetik JSON valid
              }
            }}
            rows={10}
            spellCheck={false}
            className="w-full font-mono"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Contoh Soal ({examples.length})</Label>
            <button
              type="button"
              onClick={addExample}
              className="rounded-lg border border-divider px-3 py-1.5 text-xs font-medium hover:bg-surface-secondary"
            >
              + Tambah Contoh
            </button>
          </div>

          {examples.length === 0 && (
            <p className="text-xs text-text-secondary italic">
              Belum ada contoh soal untuk subtes ini.
            </p>
          )}

          {examples.map((ex, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-divider p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Contoh #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeExample(idx)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Hapus
                </button>
              </div>

              {/* Teks Soal */}
              <div>
                <Label>Teks Soal</Label>
                <Input
                  type="text"
                  value={ex.content.text ?? ""}
                  onChange={(e) =>
                    updateExample(idx, (prev) => ({
                      ...prev,
                      content: { ...prev.content, text: e.target.value },
                    }))
                  }
                  placeholder="Kosongkan jika soal hanya berupa pilihan kata (mis. IST WA)"
                  className="w-full"
                />
              </div>

              {/* Gambar (Khusus subtes dengan containsImages, mis. FA & WU) */}
              {showImagesEditor && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Gambar Soal</Label>
                    <button
                      type="button"
                      onClick={() =>
                        updateExample(idx, (prev) => ({
                          ...prev,
                          content: {
                            ...prev.content,
                            images: [
                              ...(prev.content.images ?? []),
                              { label: "soal", assetId: "" },
                            ],
                          },
                        }))
                      }
                      className="text-xs underline"
                    >
                      + Tambah Gambar
                    </button>
                  </div>
                  {(ex.content.images ?? []).map((img, imgIdx) => (
                    <div key={imgIdx} className="grid grid-cols-3 gap-2">
                      <Input
                        type="text"
                        placeholder="Label (mis. soal)"
                        value={img.label}
                        onChange={(e) =>
                          updateExample(idx, (prev) => {
                            const images = [...(prev.content.images ?? [])];
                            images[imgIdx] = {
                              ...images[imgIdx],
                              label: e.target.value,
                            };
                            return {
                              ...prev,
                              content: { ...prev.content, images },
                            };
                          })
                        }
                      />
                      <Input
                        type="text"
                        placeholder="Asset ID / URL"
                        className="col-span-2"
                        value={img.assetId ?? img.url ?? ""}
                        onChange={(e) =>
                          updateExample(idx, (prev) => {
                            const images = [...(prev.content.images ?? [])];
                            images[imgIdx] = {
                              ...images[imgIdx],
                              assetId: e.target.value,
                            };
                            return {
                              ...prev,
                              content: { ...prev.content, images },
                            };
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Opsi Jawaban (Hanya jika Choice & bukan sharedOptionsByGroup) */}
              {showOptionsEditor && (
                <div className="space-y-2">
                  <Label>Opsi Jawaban</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(ex.options ?? []).map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={opt.key}
                          onChange={(e) =>
                            updateExample(idx, (prev) => {
                              const options = [...(prev.options ?? [])];
                              options[optIdx] = {
                                ...options[optIdx],
                                key: e.target.value,
                              };
                              return { ...prev, options };
                            })
                          }
                          className="w-12 text-center font-mono"
                          placeholder="a"
                        />
                        <Input
                          type="text"
                          value={opt.label}
                          onChange={(e) =>
                            updateExample(idx, (prev) => {
                              const options = [...(prev.options ?? [])];
                              options[optIdx] = {
                                ...options[optIdx],
                                label: e.target.value,
                              };
                              return { ...prev, options };
                            })
                          }
                          className="flex-1"
                          placeholder={`Teks opsi ${opt.key}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kunci Jawaban & Penjelasan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label required>Kunci Jawaban</Label>
                  <Input
                    type={
                      itemType === "TEXT_INPUT" && config.inputType === "NUMBER"
                        ? "number"
                        : "text"
                    }
                    value={
                      Array.isArray(ex.answer)
                        ? ex.answer?.join(", ")
                        : ex.answer
                    }
                    onChange={(e) =>
                      updateExample(idx, (prev) => ({
                        ...prev,
                        answer:
                          itemType === "MULTIPLE_CHOICE"
                            ? e.target.value.split(",").map((s) => s.trim())
                            : e.target.value,
                      }))
                    }
                    placeholder={isChoice ? "a" : "Jawaban benar"}
                    className="w-full"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Penjelasan</Label>
                  <Input
                    type="text"
                    value={ex.explanation ?? ""}
                    onChange={(e) =>
                      updateExample(idx, (prev) => ({
                        ...prev,
                        explanation: e.target.value,
                      }))
                    }
                    placeholder="Penjelasan singkat mengapa jawaban tersebut benar"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
