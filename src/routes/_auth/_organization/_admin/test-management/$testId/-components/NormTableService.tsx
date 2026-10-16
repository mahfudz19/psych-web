import { useState } from "react";
import type { ReactNode } from "react";
import { Plus, X } from "lucide-react";
import {
  criteriaLabel,
  isNormCovered,
  needsNorm,
  targetFromScoreType,
} from "./norm-utils";
import type { NormPayload } from "./Normform";
import NormForm from "./Normform";
import type { NormTable } from "../../-api/test-norms.type";
import { useGetTestScales } from "../../-api/test-definitions.query";
import IconButton from "../../../../../../../components/ui/IconButton";
import {
  useActivateTestNormMutation,
  useArchiveTestNormMutation,
  useDeleteTestNormMutation,
  useGetTestNorms,
} from "../../-api/test-norms.query";
import Button from "../../../../../../../components/ui/Button";

interface Props {
  testId: string;
  /**
   * Berbeda dari tab lain: isi dengan `test.status === "ARCHIVED"`, bukan `!== "DRAFT"`.
   * Norma punya status sendiri dan masih boleh ditambah pada tes ACTIVE.
   */
  isLocked: boolean;
}

type FormState =
  | { mode: "create"; seed?: NormTable }
  | { mode: "edit"; norm: NormTable }
  | null;

type Light = "red" | "yellow" | "green";

const DOT: Record<Light, string> = {
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "draft",
  ACTIVE: "aktif",
  ARCHIVED: "arsip",
};

interface ScaleRow {
  id: string;
  code: string;
  name: string;
  order?: number | null;
  scoreType?: string | null;
  rawMin?: number | null;
  rawMax?: number | null;
  sectionId?: string | null;
}

/** Status norma sebuah skala, untuk titik warna di daftar kiri. */
function scaleStatus(
  scale: ScaleRow,
  norms: NormTable[],
): { light: Light; text: string } {
  const live = norms.filter(
    (n) => n.scaleId === scale.id && n.status !== "ARCHIVED",
  );
  if (live.length === 0) return { light: "red", text: "belum ada norma" };

  const active = live.filter((n) => n.status === "ACTIVE");
  const drafts = live.filter((n) => n.status === "DRAFT");
  const hasGap = active.some((n) => !isNormCovered(n, scale));
  const text = `${active.length} aktif${drafts.length > 0 ? ` · ${drafts.length} draft` : ""}`;

  const light: Light =
    active.length > 0 && drafts.length === 0 && !hasGap ? "green" : "yellow";
  return { light, text };
}

const byGroup = (a: NormTable, b: NormTable) =>
  (a.criteria.ageMin ?? -1) - (b.criteria.ageMin ?? -1) ||
  a.createdAt.localeCompare(b.createdAt);

function EditorPanel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <h4 className="text-base font-semibold">{title}</h4>
        <IconButton size="sm" variant="text" onClick={onClose}>
          <X size={18} />
        </IconButton>
      </div>
      {children}
    </div>
  );
}

export default function NormManagement({ testId, isLocked }: Props) {
  // Semua hook harus dipanggil sebelum early return.
  const { data: scaleData, isLoading: scalesLoading } =
    useGetTestScales(testId);
  const { data: normData, isLoading: normsLoading } = useGetTestNorms(testId);
  const deleteMutation = useDeleteTestNormMutation(testId);
  const activateMutation = useActivateTestNormMutation(testId);
  const archiveMutation = useArchiveTestNormMutation(testId);
  const [selectedScaleId, setSelectedScaleId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(null);

  if (scalesLoading || normsLoading) return <div>Memuat norma...</div>;

  const scales: ScaleRow[] = [...(scaleData?.data || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const norms = normData?.data || [];

  if (scales.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 px-4 py-6 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
        Belum ada skala. Norma dibuat untuk sebuah skala, jadi buat skala dulu
        di tab Scales.
      </div>
    );
  }

  const needing = scales.filter((s) => needsNorm(s.scoreType));
  const others = scales.filter((s) => !needsNorm(s.scoreType));

  if (needing.length === 0) {
    return (
      <div className="space-y-2 rounded-xl border border-gray-200 px-4 py-6 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
        <p>
          Tidak ada skala yang membutuhkan norma. Norma hanya dipakai skala yang
          jenis skornya diawali RAW_TO (mis. RAW_TO_WS, RAW_TO_T).
        </p>
        <p>
          Jika tes ini seharusnya memakai norma, ubah jenis skor skalanya di tab
          Scales.
        </p>
      </div>
    );
  }

  const selected = needing.find((s) => s.id === selectedScaleId) ?? needing[0];
  const selectedNorms = norms
    .filter((n) => n.scaleId === selected.id)
    .sort(byGroup);
  const completeCount = needing.filter(
    (s) => scaleStatus(s, norms).light === "green",
  ).length;
  const hasRange =
    selected.rawMin !== null &&
    selected.rawMin !== undefined &&
    selected.rawMax !== null &&
    selected.rawMax !== undefined;

  const selectScale = (id: string) => {
    setSelectedScaleId(id);
    setFormState(null);
  };

  // ---------------------------------------------------------------------
  // SUBMIT: untuk sementara hanya console.log.
  // Nanti ganti isi fungsi ini dengan createMutation / updateMutation, dan
  // kembalikan true hanya jika berhasil.
  // ---------------------------------------------------------------------
  const handleFormSubmit = (payload: NormPayload): boolean => {
    const isEdit = formState?.mode === "edit";
    const normId = formState?.mode === "edit" ? formState.norm.id : null;

    console.group("[NormForm] submit");
    console.log("Collection tujuan :", "norm_tables");
    console.log(
      "Request           :",
      `${isEdit ? "PUT" : "POST"} /api/v1/admin/tests/${testId}/norms${normId ? `/${normId}` : ""}`,
    );
    console.log("Body (payload)    :", payload);
    console.log("Body (JSON)       :\n" + JSON.stringify(payload, null, 2));
    console.log("Relasi ke collection lain :", {
      testId: `${testId} -> test_definitions._id (dari URL)`,
      scaleId: isEdit
        ? "tidak dikirim saat edit (skala tidak bisa diubah)"
        : `${payload.scaleId} -> test_scales._id (${selected.code})`,
      sectionId: selected.sectionId
        ? `${selected.sectionId} -> test_sections._id (otomatis dari skala)`
        : "null (skala tidak terhubung ke section)",
    });
    console.log("Diisi server      :", {
      testVersion: "disalin dari test_definitions.version",
      status: "DRAFT (norma baru selalu draf)",
      coverage: "dihitung dari entries dibanding rawMin/rawMax skala",
      validFrom: "waktu simpan jika kosong",
    });
    console.log(
      "Langkah berikutnya:",
      "POST .../norms/{id}/activate untuk mengaktifkan",
    );
    console.groupEnd();

    setFormState(null);
    return true;
  };

  const activate = (norm: NormTable) => {
    console.log(
      `[NormManagement] POST /api/v1/admin/tests/${testId}/norms/${norm.id}/activate`,
      "Server memeriksa: NORM_OVERLAP (kelompok bertumpuk dengan norma aktif) dan NORM_INCOMPLETE (celah rentang skor mentah)",
    );
    activateMutation.mutate(norm.id);
    setFormState(null);
  };

  const archive = (norm: NormTable) => {
    console.log(
      `[NormManagement] POST /api/v1/admin/tests/${testId}/norms/${norm.id}/archive`,
    );
    archiveMutation.mutate(norm.id);
    setFormState(null);
  };

  const remove = (norm: NormTable) => {
    console.log(
      `[NormManagement] DELETE /api/v1/admin/tests/${testId}/norms/${norm.id}`,
    );
    deleteMutation.mutate(norm.id);
    setFormState(null);
  };

  const panelTitle =
    formState?.mode === "edit"
      ? `Norma ${selected.code} · ${criteriaLabel(formState.norm.criteria)}`
      : formState?.seed
        ? `Salin norma · ${selected.code}`
        : `Tambah norma · ${selected.code}`;

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div>
        <h3 className="text-lg font-semibold">Norma</h3>
        <p className="text-xs text-gray-500">
          {completeCount} dari {needing.length} skala yang butuh norma sudah
          lengkap
        </p>
      </div>

      {isLocked && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Tes ini sudah diarsipkan, sehingga norma tidak bisa ditambah, diubah,
          atau dihapus.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* DAFTAR SKALA */}
        <div className="space-y-2 self-start rounded-xl border border-gray-200 p-3 dark:border-gray-800">
          <p className="px-1 text-xs text-gray-500">Skala yang butuh norma</p>
          {needing.map((s) => {
            const st = scaleStatus(s, norms);
            const target = targetFromScoreType(s.scoreType);
            const isSelected = s.id === selected.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => selectScale(s.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                  isSelected
                    ? "border-primary-main bg-primary-main/10"
                    : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${DOT[st.light]}`}
                  />
                  <span className="font-mono font-medium">{s.code}</span>
                  {target && (
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">
                      {target}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 pl-4 text-gray-500">{st.text}</div>
              </button>
            );
          })}

          {others.length > 0 && (
            <details className="px-1 pt-1 text-xs text-gray-500">
              <summary className="cursor-pointer">
                Tidak butuh norma ({others.length})
              </summary>
              <ul className="mt-1 space-y-0.5">
                {others.map((s) => (
                  <li key={s.id}>
                    <span className="font-mono">{s.code}</span> ·{" "}
                    {s.scoreType ?? "-"}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>

        {/* AREA NORMA */}
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium">
                <span className="font-mono">{selected.code}</span> ·{" "}
                {selected.name}
              </p>
              <p className="text-xs text-gray-500">
                Jenis skor {selected.scoreType} · rentang skor mentah{" "}
                {hasRange
                  ? `${selected.rawMin} s/d ${selected.rawMax}`
                  : "belum diisi"}
              </p>
            </div>
            {!isLocked && (
              <Button
                size="sm"
                startIcon={<Plus size={16} />}
                onClick={() => setFormState({ mode: "create" })}
              >
                Tambah norma
              </Button>
            )}
          </div>

          {!hasRange && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              Skala ini belum punya rentang skor mentah, jadi cakupan norma
              tidak bisa diperiksa. Isi skor mentah minimum dan maksimum di tab
              Scales.
            </div>
          )}

          {/* CHIP NORMA */}
          {selectedNorms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700">
              Belum ada norma untuk skala {selected.code}.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedNorms.map((n) => {
                const open =
                  formState?.mode === "edit" && formState.norm.id === n.id;
                const gap =
                  n.status !== "ARCHIVED" && !isNormCovered(n, selected);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setFormState({ mode: "edit", norm: n })}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                      open
                        ? "border-primary-main bg-primary-main/10 text-primary-main"
                        : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/30"
                    } ${n.status === "ARCHIVED" ? "opacity-60" : ""}`}
                  >
                    <span>{criteriaLabel(n.criteria)}</span>
                    <span className="text-gray-500">{n.normVersion}</span>
                    <span
                      className={
                        n.status === "ACTIVE"
                          ? "text-green-600"
                          : n.status === "DRAFT"
                            ? "text-yellow-700"
                            : "text-gray-500"
                      }
                    >
                      {STATUS_LABEL[n.status] ?? n.status}
                    </span>
                    {gap && <span className="text-yellow-700">ada celah</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* EDITOR */}
          {formState ? (
            <EditorPanel title={panelTitle} onClose={() => setFormState(null)}>
              <NormForm
                key={
                  formState.mode === "edit"
                    ? formState.norm.id
                    : `create-${selected.id}-${formState.seed?.id ?? "new"}`
                }
                mode={formState.mode}
                norm={
                  formState.mode === "edit" ? formState.norm : formState.seed
                }
                scale={{
                  id: selected.id,
                  code: selected.code,
                  name: selected.name,
                  scoreType: selected.scoreType,
                  rawMin: selected.rawMin,
                  rawMax: selected.rawMax,
                }}
                readOnly={
                  isLocked ||
                  (formState.mode === "edit" &&
                    formState.norm.status !== "DRAFT")
                }
                onSubmit={handleFormSubmit}
                onCancel={() => setFormState(null)}
                onActivate={
                  !isLocked && formState.mode === "edit"
                    ? () => activate(formState.norm)
                    : undefined
                }
                onArchive={
                  !isLocked && formState.mode === "edit"
                    ? () => archive(formState.norm)
                    : undefined
                }
                onCopy={
                  !isLocked && formState.mode === "edit"
                    ? () =>
                        setFormState({ mode: "create", seed: formState.norm })
                    : undefined
                }
                onDelete={
                  !isLocked && formState.mode === "edit"
                    ? () => remove(formState.norm)
                    : undefined
                }
              />
            </EditorPanel>
          ) : (
            selectedNorms.length > 0 && (
              <p className="text-sm text-gray-500">
                Pilih salah satu norma di atas untuk melihat atau mengubahnya.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
