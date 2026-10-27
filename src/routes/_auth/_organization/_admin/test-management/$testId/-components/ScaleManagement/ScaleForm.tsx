import { useState } from "react";
import Button from "../../../../../../../../components/ui/Button";
import Tabs from "../../../../../../../../components/ui/Tabs";
import Tab from "../../../../../../../../components/ui/Tabs/Tab";
import TabContent from "../../../../../../../../components/ui/Tabs/TabContent";
import BaseField from "./BaseFields";
import MeasurementFields from "./MeasurementFields";
import ViewFields from "./ViewFields";
import {
  useCreateTestScale,
  useUpdateTestScale,
} from "../../../-api/test-definitions.query";

export type ScaleType =
  "DIMENSION" | "FACET" | "SUBTEST" | "VALIDITY" | "COMPOSITE" | "TYPE_POLE";
export type ScaleRole =
  "PERFORMANCE" | "EXPECTATION" | "IMPORTANCE" | "REFLECTION";
export type ScoreType =
  | "RAW_ONLY"
  | "RAW_AVERAGE"
  | "RAW_TO_SW"
  | "RAW_TO_WS"
  | "RAW_TO_IQ"
  | "RAW_TO_T"
  | "RAW_TO_STEN"
  | "RAW_TO_PERCENTILE"
  | "IPSATIVE"
  | "RANK_SUM";
export type CompositeMethod = "SUM" | "MEAN";

export interface ScalePayload {
  code?: string;
  name: string;
  type: ScaleType;
  role: ScaleRole;
  parentScaleId: string | null;
  sectionId: string | null;
  order: number | null;
  description: string;
  lowLabel: string | null;
  highLabel: string | null;
  rawMin: number | null;
  rawMax: number | null;
  scoreType: ScoreType;
  composite: { sourceScaleCodes: string[]; method: CompositeMethod } | null;
  isReported: boolean;
  isValidityScale: boolean;
  color: string | null;
}

export interface ScaleFormInitial {
  id?: string;
  code?: string;
  name?: string;
  type?: string | null;
  role?: string | null;
  parentScaleId?: string | null;
  sectionId?: string | null;
  order?: number | null;
  description?: string | null;
  lowLabel?: string | null;
  highLabel?: string | null;
  rawMin?: number | null;
  rawMax?: number | null;
  scoreType?: string | null;
  composite?: Record<string, unknown> | null;
  isReported?: boolean | null;
  isValidityScale?: boolean | null;
  color?: string | null;
}

export interface SectionOption {
  id: string;
  code: string;
  name: string;
}

export interface ScaleOption {
  id: string;
  code: string;
  name: string;
  parentScaleId?: string | null;
}

interface Props {
  testId: string;
  scale?: ScaleFormInitial;
  sections: SectionOption[];
  scales: ScaleOption[];
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CODE_PATTERN = /^[A-Za-z0-9_]{1,30}$/;
const COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

function readSourceCodes(composite?: Record<string, unknown> | null): string[] {
  const raw = composite?.sourceScaleCodes;
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

export default function ScaleForm({
  testId,
  scale,
  sections,
  scales,
  onCancel,
  isSubmitting = false,
}: Props) {
  const create = useCreateTestScale(testId);
  const update = useUpdateTestScale(testId);

  const isEdit = Boolean(scale);
  const [activeTab, setActiveTab] = useState<string>("base");
  const [type, setType] = useState<ScaleType>(
    (scale?.type as ScaleType | undefined) ?? "DIMENSION",
  );
  const [isValidityScale, setIsValidityScale] = useState<boolean>(
    scale?.isValidityScale ?? false,
  );
  const [sourceCodes, setSourceCodes] = useState<string[]>(
    readSourceCodes(scale?.composite),
  );
  const [compositeMethod, setCompositeMethod] = useState<CompositeMethod>(
    scale?.composite?.method === "MEAN" ? "MEAN" : "SUM",
  );
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs: string[] = [];
    const str = (key: string) => String(fd.get(key) ?? "").trim();

    /** Bilangan bulat opsional. Kosong menjadi null. */
    const intOrNull = (key: string, label: string): number | null => {
      const raw = str(key);
      if (raw === "") return null;
      const n = Number(raw);
      if (!Number.isInteger(n)) {
        errs.push(`${label} harus berupa bilangan bulat`);
        return null;
      }
      return n;
    };

    // --- kode (hanya saat create) ---
    const code = str("code");
    if (!isEdit && !CODE_PATTERN.test(code)) {
      errs.push(
        "Kode wajib diisi: huruf, angka, dan underscore (1-30 karakter)",
      );
    }

    // --- nama ---
    const name = str("name");
    if (!name) errs.push("Nama aspek wajib diisi");

    // --- relasi ---
    const sectionId = str("sectionId") || null;
    if (type === "SUBTEST" && !sectionId) {
      errs.push("Skala bertipe SUBTEST wajib memilih section");
    }
    const parentScaleId = str("parentScaleId") || null;

    // --- gabungan ---
    let composite: ScalePayload["composite"] = null;
    if (type === "COMPOSITE") {
      if (sourceCodes.length === 0) {
        errs.push(
          "Skala bertipe COMPOSITE wajib memilih minimal satu skala sumber",
        );
      } else {
        composite = { sourceScaleCodes: sourceCodes, method: compositeMethod };
      }
    }

    // --- rentang skor ---
    const rawMin = intOrNull("rawMin", "Skor mentah minimum");
    const rawMax = intOrNull("rawMax", "Skor mentah maksimum");
    if (rawMin !== null && rawMax !== null && rawMin > rawMax) {
      errs.push("Skor mentah minimum tidak boleh lebih besar dari maksimum");
    }

    // --- urutan ---
    const order = intOrNull("order", "Urutan");

    // --- warna ---
    const color = str("color") || null;
    if (color && !COLOR_PATTERN.test(color)) {
      errs.push("Warna harus berformat hex #RRGGBB, contoh #4F46E5");
    }

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);

    let payload = {
      name,
      type,
      role: str("role") as ScaleRole,
      parentScaleId,
      sectionId,
      order,
      description: String(fd.get("description") ?? ""),
      lowLabel: str("lowLabel") || null,
      highLabel: str("highLabel") || null,
      rawMin,
      rawMax,
      scoreType: str("scoreType") as ScoreType,
      composite,
      isReported: fd.get("isReported") === "on",
      isValidityScale,
      color,
    };
    if (isEdit) {
      update.mutate(
        { scaleId: scale.id, payload },
        { onSuccess: () => onCancel() },
      );
    } else {
      create.mutate({ ...payload, code }, { onSuccess: () => onCancel() });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col max-h-[75vh] text-left"
    >
      {/* TABS */}
      <div className="px-4 pt-4 pb-2 border-b border-divider">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tab value="base" label="Dasar" />
          <Tab value="measurement" label="Pengukuran" />
          <Tab value="view" label="Tampilan & Lanjutan" />
        </Tabs>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {/* TAB 1: DASAR */}
        <TabContent
          value="base"
          activeValue={activeTab}
          keepMounted
          className="space-y-4"
        >
          <BaseField
            scale={scale}
            type={type}
            sourceCodes={sourceCodes}
            compositeMethod={compositeMethod}
            scales={scales}
            sections={sections}
            handleTypeChange={(value: ScaleType) => {
              setType(value);
              if (value === "VALIDITY") setIsValidityScale(true);
            }}
            toggleSource={(code: string) => {
              setSourceCodes((prev) =>
                prev.includes(code)
                  ? prev.filter((c) => c !== code)
                  : [...prev, code],
              );
            }}
            handleCompositeMethod={(method) => setCompositeMethod(method)}
          />
        </TabContent>

        {/* TAB 2: PENGUKURAN */}
        <TabContent
          value="measurement"
          activeValue={activeTab}
          keepMounted
          className="space-y-4"
        >
          <MeasurementFields scale={scale} />
        </TabContent>

        {/* TAB 3: TAMPILAN & LANJUTAN */}
        <TabContent
          value="view"
          activeValue={activeTab}
          keepMounted
          className="space-y-4"
        >
          <ViewFields
            isValidityScale={isValidityScale}
            setIsValidityScale={setIsValidityScale}
            scale={scale}
          />
        </TabContent>
      </div>

      {/* KETERANGAN FIELD OTOMATIS */}
      <div className="px-4 py-3 border-t border-divider bg-black/2 text-xs text-text-secondary space-y-1">
        <p className="font-medium">Tidak diisi di form ini (diatur server):</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>
            <span className="font-mono">testId</span>: dari URL halaman,
            mengarah ke <span className="font-mono">test_definitions</span>
          </li>
          <li>
            <span className="font-mono">test_sections.scaleIds</span>: ikut
            diperbarui otomatis saat Section dipilih atau diganti
          </li>
        </ul>
      </div>

      {/* ERROR */}
      {errors.length > 0 && (
        <div className="mx-4 mt-3 rounded-xl border border-error-main/40 bg-error-main/5 px-4 py-3 text-sm text-error-main">
          <ul className="list-disc pl-4 space-y-0.5">
            {errors.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex items-center justify-end gap-3 p-4 border-t border-divider">
        <Button
          type="button"
          variant="outlined"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Menyimpan..."
            : isEdit
              ? "Simpan Perubahan"
              : "Tambah Scale"}
        </Button>
      </div>
    </form>
  );
}
