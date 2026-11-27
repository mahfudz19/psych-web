import { useState } from "react";
import Checkbox from "../../../../../../../components/ui/Checkbox";
import Label from "../../../../../../../components/ui/Label";
import Select from "../../../../../../../components/ui/Select";
import Textarea from "../../../../../../../components/ui/Textarea";
import type {
  ConfigInputType,
  ConfigLayout,
  SectionConfig,
  SectionFormInitial,
} from "./SectionForm";

const cleanConfig = (cfg: SectionConfig): SectionConfig => {
  const result: SectionConfig = {};
  for (const [key, val] of Object.entries(cfg)) {
    if (val !== undefined && val !== "") {
      result[key] = val;
    }
  }
  return result;
};

const CHOICE_TYPES = new Set([
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "MULTI_CHOICE",
  "FORCED_CHOICE",
]);

const ConfigField = ({ section }: { section?: SectionFormInitial }) => {
  const [config, setConfig] = useState<SectionConfig>(
    () => (section?.config as SectionConfig) ?? {},
  );
  const [jsonMode, setJsonMode] = useState(false);
  const [rawJson, setRawJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const itemType = section?.defaultItemType ?? "SINGLE_CHOICE";
  const isTextInput = itemType === "TEXT_INPUT";
  const isChoice = CHOICE_TYPES.has(itemType);

  const toggleJsonMode = () => {
    if (!jsonMode) {
      setRawJson(JSON.stringify(cleanConfig(config), null, 2));
      setJsonError(null);
    }
    setJsonMode((prev) => !prev);
  };

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
          onClick={toggleJsonMode}
          className="text-xs underline text-text-secondary hover:text-text-primary"
        >
          {jsonMode ? "Gunakan Form Builder" : "Edit JSON Mentah"}
        </button>
      </div>

      {!jsonMode && (
        <input type="hidden" name="config" value={serializedConfig} />
      )}

      {jsonMode ? (
        <div className="space-y-1">
          <Textarea
            id="config"
            name="config"
            value={rawJson}
            onChange={(e) => {
              const next = e.target.value;
              setRawJson(next);
              try {
                const parsed = JSON.parse(next);
                if (
                  !parsed ||
                  typeof parsed !== "object" ||
                  Array.isArray(parsed)
                ) {
                  setJsonError("Format JSON harus berupa objek.");
                  return;
                }
                setConfig(parsed as SectionConfig);
                setJsonError(null);
              } catch {
                setJsonError("Format JSON belum valid.");
              }
            }}
            rows={6}
            spellCheck={false}
            className="w-full font-mono"
          />
          {jsonError && <p className="text-xs text-red-500">{jsonError}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Opsi khusus Choice */}
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
              checked={Boolean(config.requireAllAnswered ?? false)}
              onChange={(e) =>
                updateKey("requireAllAnswered", e.target.checked || undefined)
              }
              label="Wajib jawab semua soal (requireAllAnswered)"
            />

            <Checkbox
              checked={Boolean(config.allowReview ?? false)}
              onChange={(e) =>
                updateKey("allowReview", e.target.checked || undefined)
              }
              label="Izinkan review jawaban (allowReview)"
            />

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

export default ConfigField;
