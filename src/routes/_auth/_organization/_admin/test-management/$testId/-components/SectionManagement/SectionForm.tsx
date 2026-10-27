import React, { useState } from "react";
import {
  useCreateTestSectionMutation,
  useUpdateTestSectionMutation,
} from "../../../-api/test-definitions.query";
import Button from "../../../../../../../../components/ui/Button";
import Tabs from "../../../../../../../../components/ui/Tabs";
import Tab from "../../../../../../../../components/ui/Tabs/Tab";
import TabContent from "../../../../../../../../components/ui/Tabs/TabContent";
import BaseField from "./BaseFields";
import ContinueField from "./ContinueFields";
import TimeField from "./TimeFields";

export type NavigationPolicy = "FREE" | "FORWARD_ONLY";
export type SectionStatus = "ACTIVE" | "RETIRED";

export interface SectionFormInitial {
  id?: string;
  code?: string;
  order?: number;
  name?: string;
  instructions?: string | null;
  examples?: string | null;
  showExamplesFirst?: boolean | null;
  timeLimitSeconds?: number | null;
  itemCount?: number | null;
  navigationPolicy?: string | null;
  defaultItemType?: string | null;
  stimulusPhase?: Record<string, unknown> | null;
  config?: Record<string, unknown> | null;
  status?: string | null;
}

interface Props {
  testId: string;
  section?: SectionFormInitial;
  nextOrder: number;
  onClose: () => void;
  isSubmitting?: boolean;
}

const CODE_PATTERN = /^[A-Z0-9_]{1,20}$/;

function parseJsonField(
  raw: string,
  label: string,
  kind: "array" | "object",
  errors: string[],
): unknown {
  const text = raw.trim();
  if (!text) return kind === "array" ? [] : {};
  try {
    const parsed: unknown = JSON.parse(text);
    const valid =
      kind === "array"
        ? Array.isArray(parsed)
        : parsed !== null &&
          typeof parsed === "object" &&
          !Array.isArray(parsed);
    if (!valid) {
      errors.push(
        `${label} harus berupa ${kind === "array" ? "array [ ]" : "object { }"}`,
      );
      return null;
    }
    return parsed;
  } catch {
    errors.push(`${label}: format JSON tidak valid`);
    return null;
  }
}

export default function SectionForm({
  testId,
  section,
  nextOrder,
  onClose,
  isSubmitting = false,
}: Props) {
  const createMutation = useCreateTestSectionMutation(testId);
  const updateMutation = useUpdateTestSectionMutation(testId);

  const isEdit = Boolean(section);
  const [activeTab, setActiveTab] = useState<string>("base");
  const [useStimulus, setUseStimulus] = useState<boolean>(
    Boolean(section?.stimulusPhase),
  );
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs: string[] = [];

    const str = (key: string) => String(fd.get(key) ?? "").trim();

    const code = str("code").toUpperCase();
    if (!isEdit && !CODE_PATTERN.test(code)) {
      errs.push(
        "Kode wajib diisi: huruf besar, angka, dan underscore (1-20 karakter)",
      );
    }

    const name = str("name");
    if (!name) errs.push("Nama section wajib diisi");

    const order = Number(str("order"));
    if (!Number.isInteger(order) || order < 1) {
      errs.push("Order wajib diisi, bilangan bulat minimal 1");
    }

    const timeRaw = str("timeLimitSeconds");
    const timeLimitSeconds = timeRaw === "" ? null : Number(timeRaw);
    if (
      timeLimitSeconds !== null &&
      (!Number.isInteger(timeLimitSeconds) || timeLimitSeconds <= 0)
    ) {
      errs.push("Batas waktu harus bilangan bulat lebih dari 0, atau kosong");
    }

    const itemCount = Number(str("itemCount") || 0);
    if (!Number.isInteger(itemCount) || itemCount < 0) {
      errs.push("Jumlah soal tidak boleh negatif");
    }

    const examples = parseJsonField(
      str("examples"),
      "Contoh soal",
      "array",
      errs,
    );
    const config = parseJsonField(str("config"), "Config", "object", errs);

    let stimulusPhase: Record<string, unknown> | null = null;
    if (useStimulus) {
      const contentType = str("stimulusContentType");
      const displaySeconds = Number(str("stimulusDisplaySeconds"));
      if (!contentType) errs.push("Fase hafalan: jenis konten wajib diisi");
      if (!(displaySeconds > 0)) {
        errs.push("Fase hafalan: lama tampil wajib diisi dan lebih dari 0");
      }
      const content = parseJsonField(
        str("stimulusContent"),
        "Fase hafalan: isi konten",
        "object",
        errs,
      );
      stimulusPhase = {
        contentType,
        displaySeconds,
        hideAfter: fd.get("stimulusHideAfter") === "on",
        content,
      };
    }

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);

    let payload = {
      order,
      name,
      instructions: String(fd.get("instructions") ?? ""),
      examples: examples as unknown[],
      showExamplesFirst: fd.get("showExamplesFirst") === "on",
      timeLimitSeconds,
      itemCount,
      navigationPolicy: str("navigationPolicy") as NavigationPolicy,
      defaultItemType: str("defaultItemType"),
      stimulusPhase,
      config: config as Record<string, unknown>,
      status: str("status") as SectionStatus,
    };

    if (isEdit) {
      const sectionId = section?.id;
      updateMutation.mutate(
        { sectionId, payload: { ...payload, id: section.id } },
        { onSuccess: () => onClose() },
      );
    } else {
      createMutation.mutate(
        { ...payload, code },
        { onSuccess: () => onClose() },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-h-[75vh]">
      <div className="px-4 pt-4 pb-2 border-b border-divider">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tab value="base" label="Dasar" />
          <Tab value="time" label="Waktu & Navigasi" />
          <Tab value="continue" label="Lanjutan" />
        </Tabs>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <TabContent
          value="base"
          activeValue={activeTab}
          keepMounted
          className="min-h-80.75 space-y-4 mt-0"
        >
          <BaseField section={section} nextOrder={nextOrder} />
        </TabContent>

        <TabContent
          value="time"
          activeValue={activeTab}
          keepMounted
          className="min-h-80.75 space-y-4 mt-0"
        >
          <TimeField section={section} />
        </TabContent>

        <TabContent
          value="continue"
          activeValue={activeTab}
          keepMounted
          className="min-h-76.75 space-y-5"
        >
          <ContinueField
            section={section}
            useStimulus={useStimulus}
            setUseStimulus={setUseStimulus}
          />
        </TabContent>
      </div>

      <div className="px-4 py-3 border-t border-divider bg-secondary-main/10 text-xs text-text-secondary space-y-1">
        <p className="font-medium">Tidak diisi di form ini (diatur server):</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>
            <span className="font-mono">testId</span>: dari URL halaman,
            mengarah ke <span className="font-mono">test_definitions</span>
          </li>
          <li>
            <span className="font-mono">testVersion</span>: disalin dari tes
          </li>
          <li>
            <span className="font-mono">scaleIds</span>: terisi otomatis dari{" "}
            <span className="font-mono">test_scales.sectionId</span>
          </li>
        </ul>
      </div>

      {errors.length > 0 && (
        <div className="mx-4 mt-3 rounded-xl border border-error-main/40 bg-error-main/5 px-4 py-3 text-sm text-error-main">
          <ul className="list-disc pl-4 space-y-0.5">
            {errors.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 p-4 border-t border-divider">
        <Button
          type="button"
          variant="outlined"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Menyimpan..."
            : isEdit
              ? "Simpan Perubahan"
              : "Tambah Section"}
        </Button>
      </div>
    </form>
  );
}
