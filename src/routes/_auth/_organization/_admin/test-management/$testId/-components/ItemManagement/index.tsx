import { AlertTriangle, Check, Copy, Edit, Plus, Trash, X } from "lucide-react";
import { useState } from "react";
import {
  useCreateTestItem,
  useDeleteTestItemMutation,
  useGetTestItems,
  useGetTestScales,
  useGetTestSections,
  useUpdateTestItem,
} from "../../../-api/test-definitions.query";
import type {
  ItemType,
  TestCategory,
  TestItem,
  TestItemCreatePayload,
  TestScale,
  TestSection,
} from "../../../-api/test-definitions.type";
import {
  DataTable,
  type BaseListParams,
} from "../../../../../../../../components/reusebale-components/DataTable";
import DialogConfirmAction from "../../../../../../../../components/reusebale-components/dialog/DialogConfirmAction";
import Button from "../../../../../../../../components/ui/Button";
import Dialog from "../../../../../../../../components/ui/Dialog";
import IconButton from "../../../../../../../../components/ui/IconButton";
import Select from "../../../../../../../../components/ui/Select";
import ItemForm from "./ItemForm";
import Alert from "../../../../../../../../components/ui/Alert";
import AlertTitle from "../../../../../../../../components/ui/Alert/AlertTitle";
import AlertDescription from "../../../../../../../../components/ui/Alert/AlertDescription";

interface Props {
  testId: string;
  isLocked: boolean;
  category: TestCategory;
}

const TYPE_LABEL: Record<ItemType, string> = {
  SINGLE_CHOICE: "Pilihan tunggal",
  MULTI_CHOICE: "Pilihan ganda",
  TRUE_FALSE: "Benar/salah",
  YES_NO: "Ya/tidak",
  LIKERT: "Likert",
  FORCED_CHOICE: "Pilihan paksa",
  MOST_LEAST: "Paling/paling tidak",
  RANKING: "Peringkat",
  NUMERIC_INPUT: "Isian angka",
  TEXT_INPUT: "Isian teks",
  DRAWING: "Gambar",
  MATRIX_TASK: "Tugas matriks",
};

function evaluateItem(item: TestItem, isAbility: boolean): string | null {
  if (item.type === "DRAWING") return null;

  if (isAbility) {
    const hasKey =
      (item.answerKey?.correct?.length ?? 0) > 0 ||
      (item.answerKey?.accepted?.length ?? 0) > 0;
    return hasKey ? null : "Kunci jawaban belum diisi";
  }

  if (item.type === "NUMERIC_INPUT" || item.type === "TEXT_INPUT") {
    return (item.answerKey?.accepted?.length ?? 0) > 0
      ? null
      : "Jawaban yang diterima belum diisi";
  }
  if (item.options.some((o) => !o.scoring)) return "Ada opsi tanpa aturan skor";
  if (item.type === "LIKERT" && !item.scaleId) return "Skala belum dipilih";
  return null;
}

function summarize(item: TestItem) {
  const text = item.content?.text?.trim();
  if (text) return text;
  const n = item.content?.images?.length ?? 0;
  return n > 0 ? `[${n} gambar]` : "(tanpa isi)";
}

function ItemMutation({
  testId,
  scales,
  sections,
  isLocked,
  category,
}: {
  testId: string;
  scales: TestScale[];
  sections: TestSection[];
  isLocked: boolean;
  category: TestCategory;
}) {
  const createMutation = useCreateTestItem(testId);
  const deleteMutation = useDeleteTestItemMutation(testId);
  const updateMutation = useUpdateTestItem(testId);
  const [createSectionId, setCreateSectionId] = useState<string>("");

  // Default createSectionId ke section pertama jika belum dipilih
  if (!createSectionId && sections.length > 0) {
    setCreateSectionId(sections[0].id);
  }

  const isAbility = category === "ABILITY";
  const [tableState, setTableState] = useState<BaseListParams>({
    page: 1,
    limit: 50,
  });

  const {
    data: itemData,
    isLoading: itemsLoading,
    isFetching,
  } = useGetTestItems(testId, tableState);

  const items = itemData?.data ?? [];
  const total = itemData?.meta?.total ?? 0;

  const pageMax = Math.max(0, ...items.map((i) => i.number));
  const nextNumber = Math.max(pageMax, total) + 1;

  const scaleById = new Map(scales.map((s) => [s.id, s]));
  const sectionFilterOptions = sections.map((s) => ({
    label: `${s.code} - ${s.name}`,
    value: s.id,
  }));

  const scaleFilterOptions = scales.map((s) => ({
    label: `${s.code} - ${s.name}`,
    value: s.id,
  }));

  const typeFilterOptions = Object.entries(TYPE_LABEL).map(
    ([value, label]) => ({ label, value }),
  );

  const sectionById = new Map(sections.map((s) => [s.id, s]));

  const createSection = sectionById.get(createSectionId) ?? sections[0];

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">Daftar Soal</h3>
          <p className="text-xs text-gray-500">
            Mode penilaian tes ini:{" "}
            <span className="font-medium">
              {isAbility ? "kunci jawaban" : "aturan skor per opsi"}
            </span>
          </p>
        </div>
        {!isLocked && (
          <div className="flex items-center gap-2">
            {sections.length > 1 && (
              <Select
                value={createSectionId}
                onChange={(e) => setCreateSectionId(e.target.value)}
                aria-label="Section tujuan"
                size="sm"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </Select>
            )}
            <Dialog
              dismissible={false}
              maxWidth="full"
              trigger={(openDialog) => (
                <Button
                  startIcon={<Plus size={16} />}
                  size="sm"
                  onClick={openDialog}
                >
                  Tambah soal ke {createSection.code}
                </Button>
              )}
            >
              {(closeDialog) => (
                <>
                  <div className="sticky top-0 bg-bg-paper z-10 flex items-center justify-between px-6 py-4 border-b border-divider">
                    <h4 className="text-lg font-semibold text-text-primary">
                      Tambah soal · {createSection.code}
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
                  <ItemForm
                    key={`create-${createSection.id}`}
                    mode="create"
                    sectionId={createSection.id}
                    sectionCode={createSection.code}
                    nextNumber={nextNumber}
                    defaultType={createSection.defaultItemType}
                    isAbility={isAbility}
                    scales={scales.map((s) => ({
                      id: s.id,
                      code: s.code,
                      name: s.name,
                      sectionId: s.sectionId,
                    }))}
                    onSubmit={async (payload, addNext) => {
                      try {
                        await createMutation.mutateAsync(
                          payload as TestItemCreatePayload,
                        );
                        if (!addNext) closeDialog();
                        return true;
                      } catch {
                        return false;
                      }
                    }}
                    onCancel={closeDialog}
                  />
                </>
              )}
            </Dialog>
          </div>
        )}
      </div>

      <DataTable<TestItem>
        data={items}
        meta={itemData?.meta}
        isLoading={itemsLoading || isFetching}
        state={tableState}
        onStateChange={setTableState}
        variant="child"
        columns={[
          {
            header: "No",
            accessorKey: "number",
            sortable: true,
            cell: (row) => row.number,
            className: "w-16",
          },
          {
            header: "Section",
            accessorKey: "sectionId",
            filterType: "faceted",
            filterOptions: sectionFilterOptions,
            cell: (row) => {
              const section = row.sectionId
                ? sectionById.get(row.sectionId)
                : null;
              return (
                <span className="font-mono text-xs">
                  {section ? section.code : "-"}
                </span>
              );
            },
          },
          {
            header: "Soal",
            accessorKey: "content.text",
            filterType: "text",
            cell: (row) => {
              const thumb = row.content?.images?.[0]?.url;
              return (
                <div className="max-w-64">
                  <div className="flex items-center gap-2">
                    {thumb && (
                      <img
                        src={thumb}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded border border-gray-200 object-cover dark:border-gray-700"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <span className="line-clamp-2">{summarize(row)}</span>
                  </div>
                  {row.status === "RETIRED" && (
                    <span className="text-xs text-gray-500">Dipensiunkan</span>
                  )}
                </div>
              );
            },
          },
          {
            header: "Tipe",
            accessorKey: "type",
            filterType: "faceted",
            filterOptions: typeFilterOptions,
            cell: (row) => (
              <span className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                {TYPE_LABEL[row.type] ?? row.type}
              </span>
            ),
          },
          {
            header: "Skala",
            accessorKey: "scaleId",
            filterType: "faceted",
            filterOptions: scaleFilterOptions,
            cell: (row) => {
              const scale = row.scaleId ? scaleById.get(row.scaleId) : null;
              return (
                <span className="font-mono text-xs">
                  {scale ? scale.code : "-"}
                </span>
              );
            },
          },
          {
            header: "Nilai",
            accessorKey: "scoring",
            cell: (row) => {
              const problem = evaluateItem(row, isAbility);
              return problem ? (
                <span
                  title={problem}
                  className="inline-flex items-center gap-1 text-xs text-yellow-700"
                >
                  <AlertTriangle size={14} />
                  Kurang
                </span>
              ) : (
                <span
                  className="inline-flex items-center text-green-600"
                  title="Penilaian lengkap"
                >
                  <Check size={16} />
                </span>
              );
            },
          },
          {
            header: "Aksi",
            accessorKey: "actions",
            cell: (row) => {
              const rowSection = row.sectionId
                ? sectionById.get(row.sectionId)
                : null;
              const sectionCode = rowSection?.code ?? "-";
              return (
                <div className="flex justify-end gap-1">
                  {/* Edit */}
                  <Dialog
                    dismissible={false}
                    maxWidth="full"
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
                        <div className="sticky top-0 bg-bg-paper z-10 flex items-center justify-between px-6 py-4 border-b border-divider">
                          <h4 className="text-lg font-semibold text-text-primary">
                            Edit soal {sectionCode} · No. {row.number}
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
                        <ItemForm
                          key={`edit-${row.id}`}
                          mode="edit"
                          item={row}
                          sectionId={row.sectionId}
                          sectionCode={sectionCode}
                          nextNumber={row.number}
                          defaultType={rowSection?.defaultItemType}
                          isAbility={isAbility}
                          scales={scales.map((s) => ({
                            id: s.id,
                            code: s.code,
                            name: s.name,
                            sectionId: s.sectionId,
                          }))}
                          onSubmit={async (payload, addNext) => {
                            try {
                              await updateMutation.mutateAsync({
                                itemId: row.id,
                                payload,
                              });
                              if (!addNext) closeDialog();
                              return true;
                            } catch {
                              return false;
                            }
                          }}
                          onCancel={closeDialog}
                        />
                      </>
                    )}
                  </Dialog>
                  {/* Salin */}
                  <Dialog
                    dismissible={false}
                    maxWidth="full"
                    trigger={(openDialog) => (
                      <IconButton
                        size="sm"
                        variant="text"
                        disabled={isLocked}
                        onClick={openDialog}
                      >
                        <Copy size={16} />
                      </IconButton>
                    )}
                  >
                    {(closeDialog) => (
                      <>
                        <div className="sticky top-0 bg-bg-paper z-10 flex items-center justify-between px-6 py-4 border-b border-divider">
                          <h4 className="text-lg font-semibold text-text-primary">
                            Salin soal · {sectionCode}
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
                        <ItemForm
                          key={`copy-${row.id}`}
                          mode="create"
                          item={row}
                          sectionId={row.sectionId}
                          sectionCode={sectionCode}
                          nextNumber={nextNumber}
                          defaultType={rowSection?.defaultItemType}
                          isAbility={isAbility}
                          scales={scales.map((s) => ({
                            id: s.id,
                            code: s.code,
                            name: s.name,
                            sectionId: s.sectionId,
                          }))}
                          onSubmit={async (payload, addNext) => {
                            try {
                              await createMutation.mutateAsync(
                                payload as TestItemCreatePayload,
                              );
                              if (!addNext) closeDialog();
                              return true;
                            } catch {
                              return false;
                            }
                          }}
                          onCancel={closeDialog}
                        />
                      </>
                    )}
                  </Dialog>
                  {/* Hapus */}
                  {!isLocked && (
                    <DialogConfirmAction
                      title="Hapus Soal"
                      description={`Yakin ingin menghapus soal nomor ${row.number}?`}
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
              );
            },
          },
        ]}
      />
    </>
  );
}

export default function ItemManagement({ testId, isLocked, category }: Props) {
  const { data: sectionData, isLoading: sectionsLoading } =
    useGetTestSections(testId);
  const { data: scaleData } = useGetTestScales(testId);

  const sections = [...(sectionData?.data || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  if (category === "SPEED_ENDURANCE") {
    return (
      <div className="rounded-xl border border-gray-200 px-4 py-6 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
        Tes berkategori kecepatan dan ketahanan (Kraepelin) tidak memakai bank
        soal. Soalnya dibangkitkan dari konfigurasi (
        <span className="font-mono">config</span>) pada definisi tes, jadi tidak
        ada soal yang perlu diinput di sini.
      </div>
    );
  }

  if (sectionsLoading) return <div>Memuat soal...</div>;

  if (sections.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 px-4 py-6 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
        Belum ada section. Buat section dulu di tab Sections, karena setiap soal
        dikerjakan di sebuah section.
      </div>
    );
  }
  const scales = scaleData?.data || [];

  return (
    <div className="space-y-4">
      {isLocked && (
        <Alert severity="warning" variant="standard">
          <AlertTitle>Tes ini tidak berstatus DRAFT</AlertTitle>
          <AlertDescription>
            Tes ini tidak berstatus DRAFT, sehingga soal tidak bisa ditambah,
            diubah, atau dihapus.
          </AlertDescription>
        </Alert>
      )}

      <ItemMutation
        category={category}
        isLocked={isLocked}
        scales={scales}
        sections={sections}
        testId={testId}
      />
    </div>
  );
}
