import { Edit, Plus, Trash, X } from "lucide-react";
import {
  useDeleteTestScaleMutation,
  useGetTestScales,
  useGetTestSections,
} from "../../../-api/test-definitions.query";
import DialogConfirmAction from "../../../../../../../../components/reusebale-components/dialog/DialogConfirmAction";
import Button from "../../../../../../../../components/ui/Button";
import Dialog from "../../../../../../../../components/ui/Dialog";
import IconButton from "../../../../../../../../components/ui/IconButton";
import ScaleForm from "./ScaleForm";
import {
  DataTable,
  type BaseListParams,
} from "../../../../../../../../components/reusebale-components/DataTable";
import type { TestScale } from "../../../-api/test-definitions.type";
import { useState } from "react";
import Alert from "../../../../../../../../components/ui/Alert";
import AlertTitle from "../../../../../../../../components/ui/Alert/AlertTitle";
import AlertDescription from "../../../../../../../../components/ui/Alert/AlertDescription";

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
  const [tableState, setTableState] = useState<BaseListParams>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading, isFetching } = useGetTestScales(testId, tableState);
  const { data: sectionData } = useGetTestSections(testId);
  const deleteMutation = useDeleteTestScaleMutation(testId);

  const scales = [...(data?.data || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const sections = sectionData?.data || [];

  const sectionById = new Map(sections.map((s) => [s.id, s]));
  const scaleById = new Map(scales.map((s) => [s.id, s]));

  const columns = [
    {
      header: "Kode",
      accessorKey: "code",
      cell: (row: TestScale) => row.code,
    },
    {
      header: "Nama Aspek",
      accessorKey: "name",
      cell: (row: TestScale) => {
        const parent = row.parentScaleId
          ? scaleById.get(row.parentScaleId)
          : null;
        return (
          <>
            <div className="font-medium">{row.name}</div>
            <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-gray-500">
              {parent && <span>Induk: {parent.code}</span>}
              {row.isValidityScale && <span>Validitas</span>}
              {row.isReported === false && <span>Tidak dilaporkan</span>}
              {row.role && row.role !== "PERFORMANCE" && (
                <span>Peran: {row.role}</span>
              )}
            </div>
          </>
        );
      },
    },
    {
      header: "Tipe",
      accessorKey: "type",
      cell: (row: TestScale) => <Badge>{row.type}</Badge>,
    },
    {
      header: "Section",
      accessorKey: "code",
      cell: (row: TestScale) => {
        const section = row.sectionId ? sectionById.get(row.sectionId) : null;
        return section ? section.code : "-";
      },
    },
    // Rentang Skor
    {
      header: "Rentang Skor",
      accessorKey: "rawMin",
      cell: (row: TestScale) => `${row.rawMin ?? "-"} s/d ${row.rawMax ?? "-"}`,
    },
    // Jenis Skor
    {
      header: "Jenis Skor",
      accessorKey: "scoreType",
      cell: (row: TestScale) =>
        SCORE_TYPE_LABEL[row.scoreType ?? ""] ?? row.scoreType ?? "-",
    },

    // Aksi
    {
      header: "Aksi",
      accessorKey: "actions",
      cell: (row: TestScale) => (
        <div className="flex justify-end gap-2">
          <Dialog
            dismissible={false}
            maxWidth="4xl"
            trigger={(openDialog) => (
              <IconButton
                size="sm"
                variant="text"
                disabled={isLocked}
                onClick={openDialog}
              >
                <Edit size={16} />
              </IconButton>
            )}
          >
            {(closeDialog) => (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
                  <h4 className="text-lg font-semibold text-text-primary">
                    Edit Section
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

                <ScaleForm
                  key={`edit-${row.id}`}
                  testId={testId}
                  scale={row}
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
                  onCancel={closeDialog}
                />
              </>
            )}
          </Dialog>
          {!isLocked && (
            <DialogConfirmAction
              title="Hapus Scale"
              description={`Yakin ingin menghapus aspek ${row.name}? Aksi ini akan gagal jika skala masih punya skala anak, menjadi sumber skor gabungan, atau dipakai oleh soal dan norma.`}
              onConfirm={() => deleteMutation.mutate(row.id)}
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
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Daftar Scale (Aspek)</h3>
        {!isLocked && (
          <Dialog
            dismissible={false}
            maxWidth="4xl"
            trigger={(openDialog) => (
              <Button
                startIcon={<Plus size={16} />}
                size="sm"
                onClick={openDialog}
              >
                Tambah Scale
              </Button>
            )}
          >
            {(closeDialog) => (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
                  <h4 className="text-lg font-semibold text-text-primary">
                    Tambah Scale
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

                <ScaleForm
                  testId={testId}
                  key="create"
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
                  onCancel={closeDialog}
                />
              </>
            )}
          </Dialog>
        )}
      </div>

      {isLocked && (
        <Alert severity="warning" variant="standard">
          <AlertTitle>Tes ini tidak berstatus DRAFT</AlertTitle>
          <AlertDescription>
            Tes ini tidak berstatus DRAFT, sehingga skala tidak bisa ditambah,
            diubah, atau dihapus.
          </AlertDescription>
        </Alert>
      )}

      <DataTable<TestScale>
        data={data?.data || []}
        meta={data?.meta}
        isLoading={isLoading || isFetching}
        state={tableState}
        onStateChange={setTableState}
        variant="child"
        columns={columns}
      />
    </div>
  );
}
