import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  blankRow,
  formatGaps,
  formatStandard,
  type analyzeRows,
  type computeCoverage,
  type DraftRow,
} from "../norm-utils";
import type { NormTargetScoreType } from "../../../../-api/test-definitions.type";
import { MAX_GENERATED_ROWS } from "./constants";
import { hasData, type RowField, type RowsAction } from "./state";
import type { NormScaleInfo } from "./types";
import { Button, IconButton, Input } from "./ui";
import ConversionTester from "./ConversionTester";
import PastePanel from "./PastePanel";
import toast from "../../../../../../../../../components/ui/Toast";

type Analysis = ReturnType<typeof analyzeRows>;
type Coverage = ReturnType<typeof computeCoverage>;

interface Column {
  key: RowField;
  label: string;
  aria: string;
  type: "number" | "text";
  placeholder?: string;
}

const COLUMNS: Column[] = [
  { key: "rawMin", label: "Mentah dari", aria: "Mentah dari", type: "number" },
  { key: "rawMax", label: "sampai", aria: "Mentah sampai", type: "number" },
  {
    key: "standard",
    label: "Skor standar",
    aria: "Skor standar",
    type: "text",
    placeholder: "14 atau 17-20",
  },
  { key: "category", label: "Kategori", aria: "Kategori", type: "text" },
  { key: "percentile", label: "Persentil", aria: "Persentil", type: "number" },
];

interface Props {
  rows: DraftRow[];
  dispatch: (action: RowsAction) => void;
  analysis: Analysis;
  coverage: Coverage | null;
  scale: NormScaleInfo;
  target: NormTargetScoreType | null;
  readOnly: boolean;
}

export default function LookupSection({
  rows,
  dispatch,
  analysis,
  coverage,
  scale,
  target,
  readOnly,
}: Props) {
  const [showPaste, setShowPaste] = useState(false);

  const rMin = scale.rawMin ?? null;
  const rMax = scale.rawMax ?? null;
  const hasRange = rMin !== null && rMax !== null;
  const { errors: rowErrors, parsed } = analysis;

  const generateRows = () => {
    if (rMin === null || rMax === null) return;
    const span = rMax - rMin + 1;
    if (span < 1 || span > MAX_GENERATED_ROWS) {
      toast.error(
        `Rentang skor mentah terlalu besar untuk dibuat otomatis (maksimal ${MAX_GENERATED_ROWS} baris)`,
      );
      return;
    }
    if (
      hasData(rows) &&
      !window.confirm("Isi tabel saat ini akan diganti. Lanjutkan?")
    ) {
      return;
    }
    dispatch({
      type: "replace",
      rows: Array.from({ length: span }, (_, i) => ({
        ...blankRow(),
        rawMin: String(rMin + i),
        rawMax: String(rMin + i),
      })),
    });
  };

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowPaste((v) => !v)}
          >
            Tempel dari spreadsheet
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={generateRows}
            disabled={!hasRange}
          >
            Buat baris per skor
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => dispatch({ type: "add" })}
            startIcon={<Plus size={16} />}
          >
            Baris
          </Button>
        </div>
      )}

      {!hasRange && (
        <p className="text-xs text-text-secondary">
          Skala ini belum punya rentang skor mentah, jadi cakupan tidak bisa
          diperiksa dan &quot;Buat baris per skor&quot; tidak tersedia. Isi di
          tab Scales.
        </p>
      )}

      {showPaste && !readOnly && (
        <PastePanel
          rows={rows}
          dispatch={dispatch}
          onApplied={() => setShowPaste(false)}
        />
      )}

      {/* TABEL */}
      <div className="max-h-80 overflow-auto rounded-lg border border-divider">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-white text-xs text-text-secondary dark:bg-gray-900">
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.key} className="px-2 py-2 font-medium">
                  {c.label}
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const problem = rowErrors.get(i);
              return (
                <tr
                  key={i}
                  title={problem}
                  className={problem ? "bg-error-main/10" : undefined}
                >
                  {COLUMNS.map((c) => (
                    <td key={c.key} className="px-1 py-1">
                      <Input
                        type={c.type}
                        value={row[c.key]}
                        readOnly={readOnly}
                        placeholder={c.placeholder}
                        onChange={(e) =>
                          dispatch({
                            type: "set",
                            index: i,
                            field: c.key,
                            value: e.target.value,
                          })
                        }
                        size="sm"
                        className="w-full"
                        aria-label={`${c.aria}, baris ${i + 1}`}
                      />
                    </td>
                  ))}
                  <td className="px-1 py-1 text-center">
                    {!readOnly && (
                      <IconButton
                        type="button"
                        onClick={() => dispatch({ type: "remove", index: i })}
                        size="sm"
                        aria-label={`Hapus baris ${i + 1}`}
                        variant="ghost"
                        disabled={rows.length === 1}
                        color="error"
                      >
                        <X size={16} />
                      </IconButton>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rowErrors.size > 0 && (
        <p className="text-xs text-error-main">
          {rowErrors.size} baris bermasalah. Arahkan kursor ke baris merah untuk
          melihat sebabnya.
        </p>
      )}

      {/* CAKUPAN */}
      {coverage && rMin !== null && rMax !== null && (
        <div>
          <p className="mb-1 text-xs text-text-secondary">
            Cakupan skor mentah {rMin}-{rMax}
          </p>
          <div className="flex h-3 overflow-hidden rounded-md border border-divider">
            {coverage.segments.map((s) => (
              <div
                key={`${s.from}-${s.to}`}
                style={{ flex: s.to - s.from + 1 }}
                title={`${s.from}-${s.to}: ${s.covered ? "tercakup" : "belum ada konversi"}`}
                className={s.covered ? "bg-green-500/60" : "bg-yellow-500"}
              />
            ))}
          </div>
          {coverage.covered ? (
            <p className="mt-1 text-xs text-green-700">
              Seluruh rentang skor mentah tercakup.
            </p>
          ) : (
            <p className="mt-1 text-xs text-yellow-700">
              Celah: skor mentah {formatGaps(coverage.gaps)} belum punya
              konversi. Norma belum bisa diaktifkan.
            </p>
          )}
        </div>
      )}

      <ConversionTester
        compute={(n) => {
          const hit = parsed.find(
            (p) => p.std && n >= p.rawMin && n <= p.rawMax,
          );
          if (hit?.std) {
            return {
              text: `${target ?? ""} ${formatStandard(hit.std)}${hit.category ? ` · ${hit.category}` : ""}`,
              isGap: false,
            };
          }
          return { text: "tidak ada norma (celah)", isGap: true };
        }}
      />
    </div>
  );
}
