import { Copy, Plus, X } from "lucide-react";
import { useState } from "react";
import {
  useGetTestNorms,
  useGetTestScales,
} from "../../../-api/test-definitions.query";
import type { NormTable } from "../../../-api/test-definitions.type";
import Alert from "../../../../../../../../components/ui/Alert";
import AlertDescription from "../../../../../../../../components/ui/Alert/AlertDescription";
import AlertTitle from "../../../../../../../../components/ui/Alert/AlertTitle";
import Button from "../../../../../../../../components/ui/Button";
import Dialog from "../../../../../../../../components/ui/Dialog";
import IconButton from "../../../../../../../../components/ui/IconButton";
import Tooltip from "../../../../../../../../components/ui/Tooltip";
import {
  criteriaLabel,
  isNormCovered,
  needsNorm,
  targetFromScoreType,
} from "./norm-utils";
import NormForm from "./Normform";

interface Props {
  testId: string;
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

export default function NormManagement({ testId, isLocked }: Props) {
  // Semua hook harus dipanggil sebelum early return.
  const { data: scaleData, isLoading: scalesLoading } =
    useGetTestScales(testId);
  const { data: normData, isLoading: normsLoading } = useGetTestNorms(testId);
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
        <Alert severity="warning" variant="standard">
          <AlertTitle>Tes ini sudah diarsipkan</AlertTitle>
          <AlertDescription>
            Tes ini sudah diarsipkan, sehingga norma tidak bisa ditambah,
            diubah, atau dihapus.
          </AlertDescription>
        </Alert>
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
              <Dialog
                dismissible={false}
                maxWidth="full"
                scroll="paper"
                trigger={(openDialog) => (
                  <Button
                    startIcon={<Plus size={16} />}
                    size="sm"
                    onClick={openDialog}
                  >
                    Tambah norma
                  </Button>
                )}
              >
                {(closeDialog) => (
                  <>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
                      <h4 className="text-lg font-semibold text-text-primary">
                        Tambah norma · {selected.code}
                      </h4>
                      <IconButton
                        size="sm"
                        variant="text"
                        color="error"
                        onClick={closeDialog}
                      >
                        <X size={18} />
                      </IconButton>
                    </div>

                    <NormForm
                      testId={testId}
                      key={`create-${selected.id}-new"`}
                      mode="create"
                      scale={{
                        id: selected.id,
                        code: selected.code,
                        name: selected.name,
                        scoreType: selected.scoreType,
                        rawMin: selected.rawMin,
                        rawMax: selected.rawMax,
                      }}
                      readOnly={isLocked}
                      onCancel={() => setFormState(null)}
                      canActivate={!isLocked}
                      canArchive={!isLocked}
                      canDelete={!isLocked}
                    />
                  </>
                )}
              </Dialog>
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
                  <div className="flex gap-1" key={n.id}>
                    <Dialog
                      dismissible={false}
                      maxWidth="full"
                      scroll="paper"
                      trigger={(openDialog) => (
                        <Button
                          type="button"
                          onClick={openDialog}
                          size="sm"
                          variant={open ? "ghost" : "outlined"}
                          startIcon={criteriaLabel(n.criteria)}
                          endIcon={
                            <>
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
                              {gap && (
                                <span className="text-yellow-700">
                                  ada celah
                                </span>
                              )}
                            </>
                          }
                        >
                          <span className="text-gray-500">{n.normVersion}</span>
                        </Button>
                      )}
                    >
                      {(closeDialog) => (
                        <>
                          <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
                            <h4 className="text-lg font-semibold text-text-primary">
                              Norma {selected.code} ·{" "}
                              {criteriaLabel(n.criteria)}
                            </h4>
                            <IconButton
                              size="sm"
                              variant="text"
                              color="error"
                              onClick={closeDialog}
                            >
                              <X size={18} />
                            </IconButton>
                          </div>

                          <NormForm
                            testId={testId}
                            key={n.id}
                            mode="edit"
                            norm={n}
                            scale={{
                              id: selected.id,
                              code: selected.code,
                              name: selected.name,
                              scoreType: selected.scoreType,
                              rawMin: selected.rawMin,
                              rawMax: selected.rawMax,
                            }}
                            readOnly={isLocked || n.status !== "DRAFT"}
                            onCancel={() => setFormState(null)}
                            canActivate={!isLocked}
                            canArchive={!isLocked}
                            canDelete={!isLocked}
                          />
                        </>
                      )}
                    </Dialog>

                    {!(isLocked || n.status !== "DRAFT") && (
                      <Dialog
                        dismissible={false}
                        maxWidth="full"
                        scroll="paper"
                        trigger={(openDialog) => (
                          <Tooltip
                            classNames={{ tooltip: "bg-divider" }}
                            title="Copy Norma"
                          >
                            <IconButton
                              size="sm"
                              color="warning"
                              variant="ghost"
                              onClick={openDialog}
                            >
                              <Copy size={16} />
                            </IconButton>
                          </Tooltip>
                        )}
                      >
                        {(closeDialog) => (
                          <>
                            <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
                              <h4 className="text-lg font-semibold text-text-primary">
                                Salin norma · {selected.code}
                              </h4>
                              <IconButton
                                size="sm"
                                variant="text"
                                color="error"
                                onClick={closeDialog}
                              >
                                <X size={18} />
                              </IconButton>
                            </div>

                            <NormForm
                              testId={testId}
                              key="create-${selected.id}-new"
                              mode={"create"}
                              norm={n}
                              scale={{
                                id: selected.id,
                                code: selected.code,
                                name: selected.name,
                                scoreType: selected.scoreType,
                                rawMin: selected.rawMin,
                                rawMax: selected.rawMax,
                              }}
                              readOnly={isLocked || n.status !== "DRAFT"}
                              onCancel={() => setFormState(null)}
                              canActivate={!isLocked}
                              canArchive={!isLocked}
                              canDelete={!isLocked}
                            />
                          </>
                        )}
                      </Dialog>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* EDITOR */}
          {selectedNorms.length > 0 && (
            <p className="text-sm text-gray-500">
              Pilih salah satu norma di atas untuk melihat atau mengubahnya.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
