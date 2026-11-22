import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Edit,
  Plus,
  Trash,
  X,
} from "lucide-react";
import { Route } from "..";
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
import { DataTable } from "../../../../../../../../components/reusebale-components/DataTable";
import Chip from "../../../../../../../../components/ui/Chip";
import Dialog from "../../../../../../../../components/ui/Dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  DialogConfirmAction,
  IconButton,
} from "../../norms/-components/NormTableService/Normform/ui";
import ItemForm from "./ItemForm";

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

function evaluateItem(item: TestItem, isAbility: boolean) {
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

function Section(props: {
  sections: TestSection[];
  section: TestSection;
  page: number;
  totalPages: number;
}) {
  const { sections, section, page, totalPages } = props;
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <div className="space-y-2 self-start rounded-xl border border-gray-200 p-3 dark:border-gray-800">
      <p className="px-1 text-xs text-gray-500">Section</p>
      <>
        {sections.map((s) => {
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                navigate({
                  search: (prev) => ({
                    limit: prev.limit,
                    section: s.id === sections[0].id ? undefined : s.id,
                  }),
                  replace: true,
                });
              }}
              className={`flex items-start gap-1 w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                section.id === s.id
                  ? "border-primary-main bg-primary-main/10"
                  : "border-transparent hover:bg-divider"
              }`}
            >
              <div className="bg-secondary-main/25 min-w-4 max-w-4 flex items-center justify-center rounded-full text-xs">
                {s.order}
              </div>
              <div>
                <div className="font-medium">{s.code}</div>
                <div className="line-clamp-1">{s.name}</div>
              </div>
            </button>
          );
        })}
      </>

      {totalPages > 1 && (
        <div className="flex items-center justify-end">
          <IconButton size="sm" variant="text" disabled={page === 1}>
            <ArrowLeft size={12} />
          </IconButton>
          <span className="font-mono text-xs">
            {page}|{totalPages}
          </span>
          <IconButton size="sm" variant="text" disabled={page === totalPages}>
            <ArrowRight size={12} />
          </IconButton>
        </div>
      )}
    </div>
  );
}

const SkalaCell = (props: { row: TestItem; scales: TestScale[] }) => {
  const { row, scales } = props;
  const scaleById = new Map(scales.map((s) => [s.id, s]));
  const scale = row.scaleId ? scaleById.get(row.scaleId) : null;
  return <span className="font-mono text-xs">{scale ? scale.code : "-"}</span>;
};

function ItemMutation(props: {
  testId: string;
  section: TestSection;
  scales: TestScale[];
  isLocked: boolean;
  category: TestCategory;
}) {
  const { testId, scales, isLocked, category, section } = props;

  const tableState = Route.useSearch();

  const createMutation = useCreateTestItem(testId);
  const deleteMutation = useDeleteTestItemMutation(testId);
  const updateMutation = useUpdateTestItem(testId);

  const navigate = useNavigate({ from: Route.fullPath });

  const { data, isLoading, isFetching } = useGetTestItems(testId, {
    ...tableState,
    filter: [`sectionId:contains:${section.id}`],
  });

  const isAbility = category === "ABILITY";
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const pageMax = Math.max(0, ...items.map((i) => i.number));
  const nextNumber = Math.max(pageMax, total) + 1;

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <h3 className="text-lg font-semibold">Daftar Soal {section.code}</h3>
          <p className="text-xs text-gray-500">
            Mode penilaian tes ini:{" "}
            <span className="font-medium">
              {isAbility ? "kunci jawaban" : "aturan skor per opsi"}
            </span>
          </p>
        </div>

        {!isLocked && (
          <div className="flex items-center gap-2">
            <Dialog
              dismissible={false}
              maxWidth="full"
              trigger={(openDialog) => (
                <Button
                  startIcon={<Plus size={16} />}
                  size="sm"
                  onClick={openDialog}
                >
                  Tambah soal ke {section.code}
                </Button>
              )}
            >
              {(closeDialog) => (
                <>
                  <div className="sticky top-0 bg-bg-paper z-10 flex items-center justify-between px-6 py-4 border-b border-divider">
                    <h4 className="text-lg font-semibold text-text-primary">
                      Tambah soal · {section.code}
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
                    key={`create-${section.id}`}
                    mode="create"
                    sectionId={section.id}
                    sectionCode={section.code}
                    nextNumber={nextNumber}
                    defaultType={section.defaultItemType}
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
        meta={data?.meta}
        isLoading={isLoading || isFetching}
        state={{
          ...tableState,
          sortBy: tableState.sortBy || "number",
          sortOrder: tableState.sortOrder || "asc",
        }}
        onStateChange={(newState) => {
          navigate({
            search: (prev) => ({ ...prev, ...newState }),
            replace: true,
          });
        }}
        variant="child"
        columns={[
          {
            header: "No",
            accessorKey: "number",
            sortable: true,
            cell: (row) => `${row.number}.`,
            className: "w-16",
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
                        className="h-8 w-8 shrink-0 rounded border border-divider object-cover"
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
            filterOptions: Object.entries(TYPE_LABEL).map(([value, label]) => ({
              label,
              value,
            })),
            cell: (row) => (
              <Chip color="neutral" size="sm">
                {TYPE_LABEL[row.type] ?? row.type}
              </Chip>
            ),
          },
          {
            header: "Skala",
            accessorKey: "scaleId",
            filterType: "faceted",
            filterOptions: scales.map((s) => ({
              label: `${s.code} - ${s.name}`,
              value: s.id,
            })),
            cell: (row) => <SkalaCell row={row} scales={scales} />,
          },
          {
            header: "Nilai",
            accessorKey: "scoring",
            cell: (row) => {
              const problem = evaluateItem(row, isAbility);
              return problem ? (
                <span
                  title={problem}
                  className="inline-flex items-center gap-1 text-xs text-warning-main"
                >
                  <AlertTriangle size={14} />
                  Kurang
                </span>
              ) : (
                <span
                  className="inline-flex items-center justify-center text-success-main"
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
              const rowSection = row.sectionId === section.id ? section : null;
              const sectionCode = rowSection?.code ?? "-";
              return (
                <div className="flex justify-end">
                  {/* Edit */}
                  <Dialog
                    dismissible={false}
                    maxWidth="full"
                    trigger={(openDialog) => (
                      <IconButton
                        size="sm"
                        disabled={isLocked}
                        onClick={openDialog}
                        variant="ghost"
                        className="rounded-r-xl"
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
                        color="warning"
                        disabled={isLocked}
                        onClick={openDialog}
                        variant="ghost"
                        className="rounded-none"
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
                          color="error"
                          onClick={open}
                          variant="ghost"
                          className="rounded-l-xl"
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
  const tableState = Route.useSearch();

  const { data: sectionData, isLoading } = useGetTestSections(testId);
  const { data: scaleData } = useGetTestScales(testId);

  const sections = sectionData?.data || [];

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

  if (isLoading) return <div>Memuat soal...</div>;

  if (sections.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 px-4 py-6 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
        Belum ada section. Buat section dulu di tab Sections, karena setiap soal
        dikerjakan di sebuah section.
      </div>
    );
  }
  const scales = scaleData?.data || [];

  const sectionId = tableState.section || sections[0].id;
  const section = sections.find((f) => f.id === sectionId) || sections[0];

  return (
    <>
      {isLocked && (
        <Alert severity="warning" variant="standard">
          <AlertTitle>Tes ini tidak berstatus DRAFT</AlertTitle>
          <AlertDescription>
            Tes ini tidak berstatus DRAFT, sehingga soal tidak bisa ditambah,
            diubah, atau dihapus.
          </AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Section
          sections={sections}
          section={section}
          page={sectionData?.meta?.page || 1}
          totalPages={sectionData?.meta?.totalPages || 1}
        />

        <div>
          <ItemMutation
            key={sectionId}
            section={section}
            category={category}
            isLocked={isLocked}
            scales={scales}
            testId={testId}
          />
        </div>
      </div>
    </>
  );
}
