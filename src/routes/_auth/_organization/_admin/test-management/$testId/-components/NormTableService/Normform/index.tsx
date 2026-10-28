import { Trash } from "lucide-react";
import { useMemo, useReducer, useState } from "react";
import {
  useActivateTestNormMutation,
  useArchiveTestNormMutation,
  useCreateTestNormMutation,
  useDeleteTestNormMutation,
  useUpdateTestNormMutation,
} from "../../../../-api/test-definitions.query";
import type {
  NormMethod,
  NormTable,
  NormTargetScoreType,
} from "../../../../-api/test-definitions.type";
import toast from "../../../../../../../../../components/ui/Toast";
import {
  analyzeRows,
  computeCoverage,
  formatGaps,
  targetFromScoreType,
} from "../norm-utils";
import AdvancedFields from "./AdvancedFields";
import { buildNormPayload } from "./build-payload";
import CutoffList from "./CutoffList";
import IdentityFields from "./IdentityFields";
import LookupSection from "./LookupSection";
import MeanSdSection from "./MeanSdSection";
import {
  cutoffsReducer,
  initCutoffs,
  initRows,
  rowsReducer,
  type CutoffsAction,
  type RowsAction,
} from "./state";
import type { NormScaleInfo } from "./types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  DialogConfirmAction,
  Label,
} from "./ui";

// Dipertahankan agar import lama (`from ".../norm-form"`) tidak rusak
export type { NormEntryPayload, NormPayload, NormScaleInfo } from "./types";

interface Props {
  testId: string;
  mode: "create" | "edit";
  norm?: NormTable;
  scale: NormScaleInfo;
  readOnly: boolean;
  onCancel: () => void;
  canActivate?: boolean;
  canArchive?: boolean;
  canDelete?: boolean;
}

const METHODS: { value: NormMethod; label: string }[] = [
  { value: "LOOKUP", label: "Tabel" },
  { value: "MEAN_SD", label: "Mean / SD" },
];

/**
 * Wrapper: `key` memaksa seluruh form (termasuk field uncontrolled
 * yang memakai defaultValue) dibuat ulang saat norma yang diedit berganti.
 */
export default function NormForm(props: Props) {
  return <NormFormBody key={props.norm?.id ?? "new"} {...props} />;
}

function NormFormBody({
  testId,
  mode,
  norm,
  scale,
  readOnly,
  onCancel,
  canActivate,
  canArchive,
  canDelete,
}: Props) {
  const isEdit = mode === "edit";
  const status = isEdit ? norm?.status : undefined;

  const createMutation = useCreateTestNormMutation(testId);
  const updateMutation = useUpdateTestNormMutation(testId);
  const deleteMutation = useDeleteTestNormMutation(testId);
  const activateMutation = useActivateTestNormMutation(testId);
  const archiveMutation = useArchiveTestNormMutation(testId);

  const target: NormTargetScoreType | null =
    norm?.targetScoreType ?? targetFromScoreType(scale.scoreType);

  // --- satu-satunya state yang memang dibutuhkan di level form ---
  const [method, setMethod] = useState<NormMethod>(norm?.method ?? "LOOKUP");
  const [rows, dispatchRows] = useReducer(rowsReducer, norm, initRows);
  const [cutoffs, dispatchCutoffs] = useReducer(
    cutoffsReducer,
    norm,
    initCutoffs,
  );
  const [dirty, setDirty] = useState(false);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const disabled = readOnly || isSubmitting;

  const markDirty = () => setDirty(true);
  const updateRows = (action: RowsAction) => {
    dispatchRows(action);
    markDirty();
  };
  const updateCutoffs = (action: CutoffsAction) => {
    dispatchCutoffs(action);
    markDirty();
  };

  const handleChange = (e: React.FormEvent<HTMLFormElement>) => {
    if ((e.target as HTMLInputElement).name) markDirty();
  };

  // --- analisis tabel ---
  const analysis = useMemo(() => analyzeRows(rows), [rows]);

  const rMin = scale.rawMin ?? null;
  const rMax = scale.rawMax ?? null;
  const coverage = useMemo(() => {
    if (method !== "LOOKUP" || rMin === null || rMax === null) return null;
    return computeCoverage(
      analysis.parsed
        .filter((p) => p.std)
        .map((p) => ({ rawMin: p.rawMin, rawMax: p.rawMax })),
      rMin,
      rMax,
    );
  }, [method, analysis.parsed, rMin, rMax]);

  // --- submit ---
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (readOnly || isSubmitting) return;

    const result = buildNormPayload({
      form: new FormData(e.currentTarget),
      method,
      analysis,
      cutoffs,
      scale,
      target,
      isEdit,
    });

    if (!result.ok) {
      toast.error(result.errors.join(", "));
      return;
    }

    if (isEdit && norm) {
      const { scaleId: _omit, ...rest } = result.payload;
      updateMutation.mutateAsync({ normId: norm.id, payload: rest });
    } else {
      createMutation.mutateAsync(result.payload);
    }
    setDirty(false);
    onCancel();
  };

  // --- alasan tombol Aktifkan dinonaktifkan ---
  let activateBlocked: string | null = null;
  if (dirty) activateBlocked = "Simpan perubahan dulu sebelum mengaktifkan";
  else if (analysis.errors.size > 0) {
    activateBlocked = "Masih ada baris yang bermasalah";
  } else if (coverage && !coverage.covered) {
    activateBlocked = `Skor mentah ${formatGaps(coverage.gaps)} belum punya konversi`;
  }

  return (
    <form onSubmit={handleSubmit} onChange={handleChange} noValidate>
      <fieldset
        disabled={disabled}
        className="m-0 min-w-0 space-y-5 border-0 p-4"
      >
        {readOnly && (
          <Alert severity="warning" variant="standard">
            <AlertTitle>Tes ini tidak berstatus DRAFT</AlertTitle>
            <AlertDescription>
              {status === "DRAFT" || !status
                ? "Tes ini sudah diarsipkan, jadi norma tidak bisa diubah."
                : `Norma berstatus ${status} tidak bisa diubah. Gunakan "Salin sebagai versi baru" untuk menggantinya.`}
            </AlertDescription>
          </Alert>
        )}

        <IdentityFields norm={norm} isEdit={isEdit} target={target} />

        {/* METODE */}
        <div className="space-y-3 border-t border-divider pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label tooltip="Tabel = daftar baris skor mentah ke skor standar. Mean/SD = norma berupa rata-rata dan simpangan baku.">
              Isi konversi
            </Label>
            <div className="inline-flex overflow-hidden rounded-lg border border-divider text-sm">
              {METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => {
                    setMethod(m.value);
                    markDirty();
                  }}
                  className={`px-3 py-1.5 ${
                    method === m.value
                      ? "bg-primary-main/10 text-primary-main"
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Keduanya selalu ter-mount (hanya disembunyikan) supaya isian tidak hilang saat berpindah metode dan FormData tetap lengkap */}
          <div hidden={method !== "LOOKUP"}>
            <LookupSection
              rows={rows}
              dispatch={updateRows}
              analysis={analysis}
              coverage={coverage}
              scale={scale}
              target={target}
              readOnly={readOnly}
            />
          </div>
          <div hidden={method !== "MEAN_SD"}>
            <MeanSdSection
              defaultMean={norm?.mean?.toString() ?? ""}
              defaultSd={norm?.sd?.toString() ?? ""}
              target={target}
            />
          </div>
        </div>
        <CutoffList
          cutoffs={cutoffs}
          dispatch={updateCutoffs}
          readOnly={readOnly}
        />

        <AdvancedFields norm={norm} onDirty={markDirty} />
      </fieldset>

      {/* FOOTER */}
      <div className="sticky bottom-0 bg-bg-paper flex flex-wrap items-center justify-end gap-2 border-t border-divider p-4">
        {isEdit && status === "DRAFT" && !readOnly && canDelete && norm && (
          <DialogConfirmAction
            title="Hapus Norma"
            description={`Yakin ingin menghapus norma ${norm.name ?? ""}?`}
            onConfirm={() => deleteMutation.mutate(norm.id)}
            trigger={(open) => (
              <Button
                type="button"
                variant="ghost"
                startIcon={<Trash size={16} />}
                color="error"
                onClick={open}
              >
                Hapus
              </Button>
            )}
          />
        )}

        <Button
          type="button"
          variant="outlined"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {readOnly ? "Tutup" : "Batal"}
        </Button>

        {readOnly && status === "ACTIVE" && canArchive && norm && (
          <DialogConfirmAction
            title="Arsipkan Norma"
            description="Norma yang diarsipkan tidak dipakai lagi untuk perhitungan baru. Hasil lama tetap menunjuk versi norma ini."
            onConfirm={() => archiveMutation.mutate(norm.id)}
            trigger={(open) => (
              <Button type="button" onClick={open}>
                Arsipkan
              </Button>
            )}
          />
        )}

        {!readOnly && (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Menyimpan..."
              : isEdit
                ? "Simpan perubahan"
                : "Simpan draf"}
          </Button>
        )}

        {!readOnly && isEdit && status === "DRAFT" && canActivate && norm && (
          <DialogConfirmAction
            title="Aktifkan Norma"
            description="Setelah aktif, norma ini dipakai untuk perhitungan dan tidak bisa diubah lagi. Server akan memeriksa kelengkapan dan tumpang tindih dengan norma aktif lain."
            onConfirm={() => activateMutation.mutate(norm.id)}
            trigger={(open) => (
              <Button
                type="button"
                onClick={open}
                disabled={activateBlocked !== null || isSubmitting}
              >
                Aktifkan
              </Button>
            )}
          />
        )}
      </div>

      {!readOnly && isEdit && status === "DRAFT" && activateBlocked && (
        <p className="px-4 pb-3 text-right text-xs text-text-secondary">
          Aktifkan belum tersedia: {activateBlocked}.
        </p>
      )}
    </form>
  );
}
