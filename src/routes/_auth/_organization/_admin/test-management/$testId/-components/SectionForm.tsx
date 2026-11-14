import React, { useState } from "react";
import {
  useCreateTestSectionMutation,
  useUpdateTestSectionMutation,
} from "../../-api/test-definitions.query";
import Button from "../../../../../../../components/ui/Button";
import Tabs from "../../../../../../../components/ui/Tabs";
import Tab from "../../../../../../../components/ui/Tabs/Tab";
import TabContent from "../../../../../../../components/ui/Tabs/TabContent";
import BaseField from "./BaseFields";
import ContinueField from "./ContinueFields";
import TimeField from "./TimeFields";
import toast from "../../../../../../../components/ui/Toast";
import type { TestExample } from "../../-api/test-definitions.type";

export type NavigationPolicy = "FREE" | "FORWARD_ONLY";
export type SectionStatus = "ACTIVE" | "RETIRED";

export interface SectionFormInitial {
  id?: string;
  code?: string;
  order?: number;
  name?: string;
  instructions?: string | null;
  examples?: TestExample[] | null;
  showExamplesFirst?: boolean | null;
  timeLimitSeconds?: number | null;
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
}: Props) {
  const createMutation = useCreateTestSectionMutation(testId);
  const updateMutation = useUpdateTestSectionMutation(testId);

  const isEdit = Boolean(section);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("base");
  const [useStimulus, setUseStimulus] = useState<boolean>(
    Boolean(section?.stimulusPhase),
  );

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    try {
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
        toast.error(errs.join(", "));
        return;
      }

      let payload = {
        order,
        name,
        instructions: String(fd.get("instructions") ?? ""),
        examples: examples as unknown[],
        showExamplesFirst: fd.get("showExamplesFirst") === "on",
        timeLimitSeconds,
        navigationPolicy: str("navigationPolicy") as NavigationPolicy,
        defaultItemType: str("defaultItemType"),
        stimulusPhase,
        config: config as Record<string, unknown>,
        status: str("status") as SectionStatus,
      };

      setIsSubmitting(true);
      if (isEdit) {
        if (!(section && section.id)) {
          toast.error("Invalid request payload structure");
          return;
        }
        const sectionId = section?.id;
        await updateMutation.mutateAsync({
          sectionId,
          payload: { ...payload, id: section.id },
        });
      } else {
        await createMutation.mutateAsync({ ...payload, code });
      }
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
          className="space-y-4 h-[calc(100dvh-333px)]"
        >
          <BaseField section={section} nextOrder={nextOrder} />
        </TabContent>

        <TabContent
          value="time"
          activeValue={activeTab}
          keepMounted
          className="space-y-4 h-[calc(100dvh-333px)]"
        >
          <TimeField section={section} />
        </TabContent>

        <TabContent
          value="continue"
          activeValue={activeTab}
          keepMounted
          className="space-y-4 h-[calc(100dvh-333px)]"
        >
          <ContinueField
            section={section}
            useStimulus={useStimulus}
            setUseStimulus={setUseStimulus}
          />
        </TabContent>
      </div>

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
