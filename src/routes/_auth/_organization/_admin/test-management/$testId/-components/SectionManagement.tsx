import { useState } from "react";
import type { ReactNode } from "react";
import { Plus, Trash, Edit, X } from "lucide-react";
import {
  useGetTestSections,
  useDeleteTestSectionMutation,
} from "../../-api/test-definitions.query";
import Button from "../../../../../../../components/ui/Button";
import IconButton from "../../../../../../../components/ui/IconButton";
import DialogConfirmAction from "../../../../../../../components/reusebale-components/dialog/DialogConfirmAction";
import type { SectionFormInitial, SectionPayload } from "./SectionForm";
import SectionForm from "./SectionForm";

type FormState =
  | { mode: "create" }
  | { mode: "edit"; section: SectionFormInitial & { id: string } }
  | null;

/** 360 -> "360 dtk (6 mnt)", 90 -> "90 dtk (1 mnt 30 dtk)" */
function formatTime(seconds?: number | null) {
  if (!seconds) return "Tanpa Batas";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${seconds} dtk`;
  return `${seconds} dtk (${m} mnt${s ? ` ${s} dtk` : ""})`;
}

/**
 * Overlay sederhana supaya komponen ini tidak bergantung pada API modal lain.
 * Ganti dengan komponen Modal/Dialog milik proyek jika sudah ada.
 */
function FormOverlay({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h4 className="text-lg font-semibold">{title}</h4>
          <IconButton size="sm" variant="text" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function SectionManagement({
  testId,
  isLocked,
}: {
  testId: string;
  isLocked: boolean;
}) {
  // Semua hook harus dipanggil sebelum early return.
  const { data, isLoading } = useGetTestSections(testId);
  const deleteMutation = useDeleteTestSectionMutation(testId);
  const [formState, setFormState] = useState<FormState>(null);

  if (isLoading) return <div>Memuat sections...</div>;

  const sections = [...(data?.data || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const nextOrder = Math.max(0, ...sections.map((s) => s.order ?? 0)) + 1;

  // ---------------------------------------------------------------------
  // SUBMIT: untuk sementara hanya console.log.
  // Nanti ganti isi fungsi ini dengan createMutation / updateMutation.
  // ---------------------------------------------------------------------
  const handleFormSubmit = (payload: SectionPayload) => {
    const isEdit = formState?.mode === "edit";
    const sectionId = formState?.mode === "edit" ? formState.section.id : null;

    console.group("[SectionForm] submit");
    console.log("Collection tujuan :", "test_sections");
    console.log(
      "Request           :",
      `${isEdit ? "PUT" : "POST"} /api/v1/admin/tests/${testId}/sections${
        sectionId ? `/${sectionId}` : ""
      }`,
    );
    console.log("Body (payload)    :", payload);
    console.log("Body (JSON)       :\n" + JSON.stringify(payload, null, 2));
    console.log("Dari URL, bukan body :", {
      testId: `${testId} -> test_definitions._id`,
      ...(sectionId ? { sectionId: `${sectionId} -> test_sections._id` } : {}),
    });
    console.log("Diisi server      :", {
      testVersion: "disalin dari test_definitions.version",
      scaleIds: "otomatis dari test_scales.sectionId",
      createdAt: "waktu simpan",
      updatedAt: "waktu simpan",
    });
    console.groupEnd();

    setFormState(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Daftar Section</h3>
        {!isLocked && (
          <Button
            startIcon={<Plus size={16} />}
            size="sm"
            onClick={() => setFormState({ mode: "create" })}
          >
            Tambah Section
          </Button>
        )}
      </div>

      {isLocked && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Tes ini tidak berstatus DRAFT, sehingga section tidak bisa ditambah,
          diubah, atau dihapus.
        </div>
      )}

      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Nama Section</th>
              <th className="px-4 py-3 font-medium">Soal</th>
              <th className="px-4 py-3 font-medium">Waktu</th>
              <th className="px-4 py-3 font-medium">Navigasi</th>
              <th className="px-4 py-3 font-medium">Skala</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {sections.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Belum ada section.
                </td>
              </tr>
            ) : (
              sections.map((section) => (
                <tr
                  key={section.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/20"
                >
                  <td className="px-4 py-3">{section.order}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {section.code}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{section.name}</div>
                    {section.status === "RETIRED" && (
                      <span className="text-xs text-gray-500">
                        Dipensiunkan
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{section.itemCount ?? 0}</td>
                  <td className="px-4 py-3">
                    {formatTime(section.timeLimitSeconds)}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {section.navigationPolicy === "FORWARD_ONLY"
                      ? "Hanya maju"
                      : "Bebas"}
                  </td>
                  <td className="px-4 py-3">{section.scaleIds?.length ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <IconButton
                        size="sm"
                        variant="text"
                        disabled={isLocked}
                        onClick={() =>
                          setFormState({
                            mode: "edit",
                            section: {
                              id: section.id,
                              code: section.code,
                              order: section.order,
                              name: section.name,
                              instructions: section.instructions,
                              examples: section.examples,
                              showExamplesFirst: section.showExamplesFirst,
                              timeLimitSeconds: section.timeLimitSeconds,
                              itemCount: section.itemCount,
                              navigationPolicy: section.navigationPolicy,
                              defaultItemType: section.defaultItemType,
                              stimulusPhase: section.stimulusPhase,
                              config: section.config,
                              status: section.status,
                            },
                          })
                        }
                      >
                        <Edit size={16} />
                      </IconButton>
                      {!isLocked && (
                        <DialogConfirmAction
                          title="Hapus Section"
                          description={`Yakin ingin menghapus section ${section.name}? Aksi ini akan gagal jika masih ada soal atau skala di dalamnya.`}
                          onConfirm={() => deleteMutation.mutate(section.id)}
                          trigger={(open) => (
                            <IconButton
                              size="sm"
                              variant="text"
                              color="error"
                              onClick={open}
                            >
                              <Trash size={16} />
                            </IconButton>
                          )}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FORM TAMBAH / EDIT */}
      {formState && (
        <FormOverlay
          title={
            formState.mode === "edit"
              ? `Edit Section: ${formState.section.name ?? ""}`
              : "Tambah Section"
          }
          onClose={() => setFormState(null)}
        >
          <SectionForm
            key={formState.mode === "edit" ? formState.section.id : "create"}
            section={formState.mode === "edit" ? formState.section : undefined}
            nextOrder={nextOrder}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormState(null)}
          />
        </FormOverlay>
      )}
    </div>
  );
}
