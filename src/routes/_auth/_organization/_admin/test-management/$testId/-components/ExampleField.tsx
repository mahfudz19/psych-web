import { useState } from "react";
import type { TestExample } from "../../-api/test-definitions.type";
import type { SectionFormInitial } from "./SectionForm";
import Checkbox from "../../../../../../../components/ui/Checkbox";
import Label from "../../../../../../../components/ui/Label";
import Textarea from "../../../../../../../components/ui/Textarea";
import Input from "../../../../../../../components/ui/Input";

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

export default ExampleField;
