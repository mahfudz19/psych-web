import { Edit, Plus, Trash, X } from "lucide-react";
import {
  useDeleteTestSectionMutation,
  useGetTestSections,
} from "../../../-api/test-definitions.query";
import DialogConfirmAction from "../../../../../../../../components/reusebale-components/dialog/DialogConfirmAction";
import Alert from "../../../../../../../../components/ui/Alert";
import AlertDescription from "../../../../../../../../components/ui/Alert/AlertDescription";
import AlertTitle from "../../../../../../../../components/ui/Alert/AlertTitle";
import Button from "../../../../../../../../components/ui/Button";
import Dialog from "../../../../../../../../components/ui/Dialog";
import IconButton from "../../../../../../../../components/ui/IconButton";
import SectionForm from "./SectionForm";
import {
  DataTable,
  type BaseListParams,
} from "../../../../../../../../components/reusebale-components/DataTable";
import type { TestSection } from "../../../-api/test-definitions.type";
import { useState } from "react";

function formatTime(seconds?: number | null) {
  if (!seconds) return "Tanpa Batas";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${seconds} dtk`;
  return `${seconds} dtk (${m} mnt${s ? ` ${s} dtk` : ""})`;
}

export default function SectionManagement({
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
  const { data, isLoading, isFetching } = useGetTestSections(
    testId,
    tableState,
  );
  const deleteMutation = useDeleteTestSectionMutation(testId);

  const sections = [...(data?.data || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const nextOrder = Math.max(0, ...sections.map((s) => s.order ?? 0)) + 1;

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Daftar Section</h3>
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
                  Tambah Section
                </Button>
              )}
            >
              {(closeDialog) => (
                <>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
                    <h4 className="text-lg font-semibold text-text-primary">
                      Tambah Section
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

                  <SectionForm
                    key="create"
                    nextOrder={nextOrder}
                    testId={testId}
                    onClose={() => closeDialog()}
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
              Tes ini tidak berstatus DRAFT, sehingga section tidak bisa
              ditambah, diubah, atau dihapus.
            </AlertDescription>
          </Alert>
        )}

        <DataTable<TestSection>
          data={data?.data || []}
          meta={data?.meta}
          isLoading={isLoading || isFetching}
          state={tableState}
          onStateChange={setTableState}
          variant="child"
          columns={[
            {
              header: "No",
              accessorKey: "order",
              cell: (row: TestSection) => row.order,
            },
            {
              header: "Kode",
              accessorKey: "code",
              cell: (row: TestSection) => row.code,
            },
            {
              header: "Nama Section",
              accessorKey: "name",
              cell: (row: TestSection) => row.name,
            },
            {
              header: "Soal",
              accessorKey: "itemCount",
              cell: (row: TestSection) => row.itemCount ?? 0,
            },
            {
              header: "Waktu",
              accessorKey: "timeLimitSeconds",
              cell: (row: TestSection) => formatTime(row.timeLimitSeconds),
            },
            {
              header: "Navigasi",
              accessorKey: "navigationPolicy",
              cell: (row: TestSection) => row.navigationPolicy,
            },
            {
              header: "Skala",
              accessorKey: "scaleIds",
              cell: (row: TestSection) => row.scaleIds?.length ?? 0,
            },
            {
              header: "Aksi",
              accessorKey: "actions",
              cell: (row: TestSection) => (
                <div className="flex justify-end gap-2">
                  <Dialog
                    dismissible={false}
                    maxWidth="4xl"
                    className="text-left"
                    trigger={(openDialog) => (
                      <IconButton
                        size="sm"
                        variant="text"
                        disabled={isLocked}
                        onClick={openDialog}
                      >
                        <Edit size={18} />
                      </IconButton>
                    )}
                  >
                    {(closeDialog) => (
                      <>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
                          <h4 className="text-lg font-semibold text-text-primary">
                            Edit Section {row.order}
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

                        <SectionForm
                          key={`edit-${row.id}`}
                          nextOrder={nextOrder}
                          testId={testId}
                          onClose={() => closeDialog()}
                          section={{
                            id: row.id,
                            code: row.code,
                            order: row.order,
                            name: row.name,
                            instructions: row.instructions,
                            examples: row.examples,
                            showExamplesFirst: row.showExamplesFirst,
                            timeLimitSeconds: row.timeLimitSeconds,
                            itemCount: row.itemCount,
                            navigationPolicy: row.navigationPolicy,
                            defaultItemType: row.defaultItemType,
                            stimulusPhase: row.stimulusPhase,
                            config: row.config,
                            status: row.status,
                          }}
                        />
                      </>
                    )}
                  </Dialog>

                  {!isLocked && (
                    <DialogConfirmAction
                      title="Hapus Section"
                      description={`Yakin ingin menghapus section ${row.name}? Aksi ini akan gagal jika masih ada soal atau skala di dalamnya.`}
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
          ]}
        />
      </div>
    </>
  );
}
