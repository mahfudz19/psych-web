import { useState } from "react";
import { Plus, Trash, Edit } from "lucide-react";
import {
  useGetTestScales,
  useGetTestSections,
  useDeleteTestScaleMutation,
} from "../../-api/test-definitions.query";
import Button from "../../../../../../../components/ui/Button";
import IconButton from "../../../../../../../components/ui/IconButton";
import DialogConfirmAction from "../../../../../../../components/reusebale-components/dialog/DialogConfirmAction";
import ScaleForm from "./ScaleForm";
import type { ScaleFormInitial, ScalePayload } from "./ScaleForm";
import { FormOverlay } from "./FormParts";

type FormState =
  | { mode: "create" }
  | { mode: "edit"; scale: ScaleFormInitial & { id: string } }
  | null;

/** Nama pendek jenis skor untuk kolom tabel. */
const SCORE_TYPE_LABEL: Record<string, string> = {
  RAW_ONLY: "Mentah saja",
  RAW_AVERAGE: "Rata-rata",
  RAW_TO_SW: "ke SW",
  RAW_TO_WS: "ke WS",
  RAW_TO_IQ: "ke IQ",
  RAW_TO_T: "ke T-Score",
  RAW_TO_STEN: "ke Sten",
  RAW_TO_PERCENTILE: "ke Persentil",
  IPSATIVE: "Ipsatif",
  RANK_SUM: "Jumlah peringkat",
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
      {children}
    </span>
  );
}

export default function ScaleManagement({
  testId,
  isLocked,
}: {
  testId: string;
  isLocked: boolean;
}) {
  // Semua hook harus dipanggil sebelum early return.
  const { data, isLoading } = useGetTestScales(testId);
  // Daftar section dipakai untuk pilihan di form dan untuk menampilkan kode section di tabel.
  const { data: sectionData } = useGetTestSections(testId);
  const deleteMutation = useDeleteTestScaleMutation(testId);
  const [formState, setFormState] = useState<FormState>(null);

  if (isLoading) return <div>Memuat scales...</div>;

  const scales = [...(data?.data || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const sections = sectionData?.data || [];

  const sectionById = new Map(sections.map((s) => [s.id, s]));
  const scaleById = new Map(scales.map((s) => [s.id, s]));

  // ---------------------------------------------------------------------
  // SUBMIT: untuk sementara hanya console.log.
  // Nanti ganti isi fungsi ini dengan createMutation / updateMutation.
  // ---------------------------------------------------------------------
  const handleFormSubmit = (payload: ScalePayload) => {
    const isEdit = formState?.mode === "edit";
    const scaleId = formState?.mode === "edit" ? formState.scale.id : null;

    const section = payload.sectionId
      ? sectionById.get(payload.sectionId)
      : null;
    const parent = payload.parentScaleId
      ? scaleById.get(payload.parentScaleId)
      : null;

    console.group("[ScaleForm] submit");
    console.log("Collection tujuan :", "test_scales");
    console.log(
      "Request           :",
      `${isEdit ? "PUT" : "POST"} /api/v1/admin/tests/${testId}/scales${
        scaleId ? `/${scaleId}` : ""
      }`,
    );
    console.log("Body (payload)    :", payload);
    console.log("Body (JSON)       :\n" + JSON.stringify(payload, null, 2));
    console.log("Relasi ke collection lain :", {
      testId: `${testId} -> test_definitions._id (dari URL)`,
      sectionId: payload.sectionId
        ? `${payload.sectionId} -> test_sections._id (${section?.code ?? "?"})`
        : null,
      parentScaleId: payload.parentScaleId
        ? `${payload.parentScaleId} -> test_scales._id (${parent?.code ?? "?"})`
        : null,
      "composite.sourceScaleCodes": payload.composite
        ? `${payload.composite.sourceScaleCodes.join(", ")} -> test_scales.code`
        : null,
    });
    console.log("Efek samping di server :", {
      "test_sections.scaleIds": payload.sectionId
        ? "id skala ini ditambahkan ke section yang dipilih (dan dilepas dari section lama jika diganti)"
        : "tidak ada",
    });
    console.groupEnd();

    setFormState(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Daftar Scale (Aspek)</h3>
        {!isLocked && (
          <Button
            startIcon={<Plus size={16} />}
            size="sm"
            onClick={() => setFormState({ mode: "create" })}
          >
            Tambah Scale
          </Button>
        )}
      </div>

      {isLocked && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Tes ini tidak berstatus DRAFT, sehingga skala tidak bisa ditambah,
          diubah, atau dihapus.
        </div>
      )}

      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Nama Aspek</th>
              <th className="px-4 py-3 font-medium">Tipe</th>
              <th className="px-4 py-3 font-medium">Section</th>
              <th className="px-4 py-3 font-medium">Rentang Skor</th>
              <th className="px-4 py-3 font-medium">Jenis Skor</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {scales.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Belum ada scale.
                </td>
              </tr>
            ) : (
              scales.map((scale) => {
                const section = scale.sectionId
                  ? sectionById.get(scale.sectionId)
                  : null;
                const parent = scale.parentScaleId
                  ? scaleById.get(scale.parentScaleId)
                  : null;

                return (
                  <tr
                    key={scale.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/20"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {scale.code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{scale.name}</div>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-gray-500">
                        {parent && <span>Induk: {parent.code}</span>}
                        {scale.isValidityScale && <span>Validitas</span>}
                        {scale.isReported === false && (
                          <span>Tidak dilaporkan</span>
                        )}
                        {scale.role && scale.role !== "PERFORMANCE" && (
                          <span>Peran: {scale.role}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{scale.type}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {section ? section.code : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {scale.rawMin ?? "-"} s/d {scale.rawMax ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {SCORE_TYPE_LABEL[scale.scoreType ?? ""] ??
                        scale.scoreType ??
                        "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <IconButton
                          size="sm"
                          variant="text"
                          disabled={isLocked}
                          onClick={() => setFormState({ mode: "edit", scale })}
                        >
                          <Edit size={16} />
                        </IconButton>
                        {!isLocked && (
                          <DialogConfirmAction
                            title="Hapus Scale"
                            description={`Yakin ingin menghapus aspek ${scale.name}? Aksi ini akan gagal jika skala masih punya skala anak, menjadi sumber skor gabungan, atau dipakai oleh soal dan norma.`}
                            onConfirm={() => deleteMutation.mutate(scale.id)}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* FORM TAMBAH / EDIT */}
      {formState && (
        <FormOverlay
          title={
            formState.mode === "edit"
              ? `Edit Scale: ${formState.scale.name ?? ""}`
              : "Tambah Scale"
          }
          onClose={() => setFormState(null)}
        >
          <ScaleForm
            key={formState.mode === "edit" ? formState.scale.id : "create"}
            scale={formState.mode === "edit" ? formState.scale : undefined}
            sections={sections.map((s) => ({
              id: s.id,
              code: s.code,
              name: s.name,
            }))}
            scales={scales.map((s) => ({
              id: s.id,
              code: s.code,
              name: s.name,
              parentScaleId: s.parentScaleId,
            }))}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormState(null)}
          />
        </FormOverlay>
      )}
    </div>
  );
}
