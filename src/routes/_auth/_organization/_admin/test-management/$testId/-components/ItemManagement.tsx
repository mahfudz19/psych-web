import { useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, Check, Copy, Edit, Plus, Trash, X } from "lucide-react";
import type { TestCategory } from "../../-api/test-definitions.type";
import type { TestItem } from "../../-api/test-items.type";
import IconButton from "../../../../../../../components/ui/IconButton";
import {
  useGetTestScales,
  useGetTestSections,
} from "../../-api/test-definitions.query";
import {
  useDeleteTestItemMutation,
  useGetTestItems,
} from "../../-api/test-items.query";
import type { ItemPayload } from "./ItemForm";
import Button from "../../../../../../../components/ui/Button";
import Select from "../../../../../../../components/ui/Select";
import { FIELD_CLASS } from "./FormParts";
import DialogConfirmAction from "../../../../../../../components/reusebale-components/dialog/DialogConfirmAction";
import ItemForm from "./ItemForm";

const PAGE_SIZE = 50;

interface SectionProgress {
  sectionId: string;
  enteredItems: number;
  expectedItems: number;
}

interface Props {
  testId: string;
  isLocked: boolean;
  /** Kategori tes (test.category). Menentukan mode penilaian: ABILITY = kunci jawaban. */
  category: TestCategory;
  /**
   * Opsional. Isi jika section yang difokuskan diatur dari TestDetailLayout,
   * supaya tab lain bisa melompat ke sini dengan section sudah terpilih.
   */
  sectionId?: string | null;
  onSectionChange?: (sectionId: string) => void;
  /** Opsional. `progress` dari detail tes, untuk menampilkan jumlah soal di setiap chip section. */
  progress?: SectionProgress[];
}

type FormState =
  { mode: "create"; seed?: TestItem } | { mode: "edit"; item: TestItem } | null;

const TYPE_LABEL: Record<string, string> = {
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
};

/**
 * Memeriksa apakah penilaian soal sudah lengkap.
 * Mengembalikan null jika lengkap, atau alasan jika ada yang kurang.
 */
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

function Panel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="self-start overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:sticky lg:top-4">
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

export default function ItemManagement({
  testId,
  isLocked,
  category,
  sectionId: sectionIdProp,
  onSectionChange,
  progress,
}: Props) {
  // Semua hook harus dipanggil sebelum early return.
  const { data: sectionData, isLoading: sectionsLoading } =
    useGetTestSections(testId);
  const { data: scaleData } = useGetTestScales(testId);
  const [internalSectionId, setInternalSectionId] = useState<string | null>(
    null,
  );
  const [page, setPage] = useState(0);
  const [filterScaleId, setFilterScaleId] = useState("");
  const [filterType, setFilterType] = useState("");
  const [formState, setFormState] = useState<FormState>(null);

  const sections = [...(sectionData?.data || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const scales = scaleData?.data || [];

  // Section aktif: dari props, atau pilihan internal, atau section pertama.
  const requestedId = sectionIdProp ?? internalSectionId;
  const activeSection =
    sections.find((s) => s.id === requestedId) ?? sections[0] ?? null;

  const { data: itemData, isLoading: itemsLoading } = useGetTestItems(testId, {
    sectionId: activeSection?.id,
    scaleId: filterScaleId || undefined,
    type: filterType || undefined,
    page,
    size: PAGE_SIZE,
  });
  const deleteMutation = useDeleteTestItemMutation(testId);

  const isAbility = category === "ABILITY";

  // --- Tes tanpa bank soal ---
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

  if (!activeSection) {
    return (
      <div className="rounded-xl border border-gray-200 px-4 py-6 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
        Belum ada section. Buat section dulu di tab Sections, karena setiap soal
        dikerjakan di sebuah section.
      </div>
    );
  }

  const items = itemData?.data ?? [];
  const pageInfo = itemData?.page;
  const total = pageInfo?.totalElements ?? 0;
  const totalPages = pageInfo?.totalPages ?? 0;
  const isFiltered = Boolean(filterScaleId || filterType);

  const scaleById = new Map(scales.map((s) => [s.id, s]));
  const sectionById = new Map(sections.map((s) => [s.id, s]));

  // Saran nomor berikutnya. Saat filter aktif, total tidak mewakili seluruh soal.
  const pageMax = Math.max(0, ...items.map((i) => i.number));
  const nextNumber = (isFiltered ? pageMax : Math.max(pageMax, total)) + 1;

  const expected = activeSection.itemCount ?? 0;

  // --- Chip section ---
  const chipInfo = (id: string, itemCount: number | undefined) => {
    const p = progress?.find((x) => x.sectionId === id);
    if (p) {
      return {
        text: `${p.enteredItems}/${p.expectedItems}`,
        done: p.expectedItems > 0 && p.enteredItems >= p.expectedItems,
      };
    }
    if (id === activeSection.id && !isFiltered) {
      return {
        text: `${total}/${itemCount ?? 0}`,
        done: (itemCount ?? 0) > 0 && total >= (itemCount ?? 0),
      };
    }
    return { text: `${itemCount ?? 0} soal`, done: false };
  };

  const selectSection = (id: string) => {
    setInternalSectionId(id);
    onSectionChange?.(id);
    setPage(0);
    setFilterScaleId("");
    setFilterType("");
    setFormState(null);
  };

  // ---------------------------------------------------------------------
  // SUBMIT: untuk sementara hanya console.log.
  // Nanti ganti isi fungsi ini dengan createMutation / updateMutation, dan
  // kembalikan true hanya jika berhasil (form baru mengosongkan diri setelah itu).
  // ---------------------------------------------------------------------
  const handleFormSubmit = (
    payload: ItemPayload,
    addNext: boolean,
  ): boolean => {
    const isEdit = formState?.mode === "edit";
    const itemId = formState?.mode === "edit" ? formState.item.id : null;
    const scale = payload.scaleId ? scaleById.get(payload.scaleId) : null;

    console.group("[ItemForm] submit");
    console.log("Collection tujuan :", "test_items");
    console.log(
      "Request           :",
      `${isEdit ? "PUT" : "POST"} /api/v1/admin/tests/${testId}/items${itemId ? `/${itemId}` : ""}`,
    );
    console.log("Body (payload)    :", payload);
    console.log("Body (JSON)       :\n" + JSON.stringify(payload, null, 2));
    console.log(
      "Mode penilaian    :",
      isAbility
        ? "Kunci jawaban -> answerKey.correct (opsi tidak membawa scoring)"
        : "Aturan skor -> options[].scoring (answerKey null)",
    );
    console.log("Relasi ke collection lain :", {
      testId: `${testId} -> test_definitions._id (dari URL)`,
      sectionId: isEdit
        ? "tidak dikirim saat edit (section tidak bisa diubah)"
        : `${payload.sectionId} -> test_sections._id (${activeSection.code})`,
      scaleId: payload.scaleId
        ? `${payload.scaleId} -> test_scales._id (${scale?.code ?? "?"})`
        : null,
    });
    console.log("Diisi server      :", {
      testVersion: "disalin dari test_definitions.version",
      createdAt: "waktu simpan",
      updatedAt: "waktu simpan",
    });
    console.log(
      "Catatan keamanan  :",
      "answerKey dan options[].scoring hanya boleh ada di API admin, jangan dikirim ke peserta",
    );
    console.log(
      "Aksi form         :",
      addNext ? "simpan dan tambah berikutnya" : "simpan",
    );
    console.groupEnd();

    if (!addNext) setFormState(null);
    return true;
  };

  const formTitle =
    formState?.mode === "edit"
      ? `Edit soal ${activeSection.code} · No. ${formState.item.number}`
      : formState?.seed
        ? `Salin soal · ${activeSection.code}`
        : `Tambah soal · ${activeSection.code}`;

  return (
    <div className="space-y-4">
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
          <Button
            startIcon={<Plus size={16} />}
            size="sm"
            onClick={() => setFormState({ mode: "create" })}
          >
            Tambah soal ke {activeSection.code}
          </Button>
        )}
      </div>

      {isLocked && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Tes ini tidak berstatus DRAFT, sehingga soal tidak bisa ditambah,
          diubah, atau dihapus.
        </div>
      )}

      {/* CHIP SECTION */}
      <div>
        <p className="mb-1.5 text-xs text-gray-500">Section</p>
        <div className="flex flex-wrap gap-2">
          {sections.map((s) => {
            const info = chipInfo(s.id, s.itemCount);
            const selected = s.id === activeSection.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => selectSection(s.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                  selected
                    ? "border-primary-main bg-primary-main/10 text-primary-main"
                    : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/30"
                }`}
              >
                {info.done && <Check size={13} className="text-green-600" />}
                <span className="font-mono">{s.code}</span>
                <span className="text-gray-500">{info.text}</span>
              </button>
            );
          })}
        </div>
        {sections.length === 1 && (
          <p className="mt-1 text-xs text-gray-500">
            Tes ini hanya punya satu section, jadi semua soal masuk ke{" "}
            {activeSection.code}.
          </p>
        )}
      </div>

      {/* TOOLBAR FILTER */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filterScaleId}
          onChange={(e) => {
            setFilterScaleId(e.target.value);
            setPage(0);
          }}
          className={`${FIELD_CLASS} max-w-56`}
          aria-label="Filter skala"
        >
          <option value="">Semua skala</option>
          {scales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code} - {s.name}
            </option>
          ))}
        </Select>
        <Select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setPage(0);
          }}
          className={`${FIELD_CLASS} max-w-48`}
          aria-label="Filter tipe soal"
        >
          <option value="">Semua tipe</option>
          {Object.entries(TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {/* DAFTAR + PANEL */}
      <div
        className={`grid grid-cols-1 gap-4 ${
          formState ? "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" : ""
        }`}
      >
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className="px-3 py-3 font-medium">No</th>
                <th className="px-3 py-3 font-medium">Soal</th>
                <th className="px-3 py-3 font-medium">Tipe</th>
                <th className="px-3 py-3 font-medium">Skala</th>
                <th className="px-3 py-3 font-medium">Nilai</th>
                <th className="px-3 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {itemsLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Memuat soal...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {isFiltered
                      ? "Tidak ada soal yang cocok dengan filter."
                      : `Belum ada soal di section ${activeSection.code}.`}
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const problem = evaluateItem(item, isAbility);
                  const thumb = item.content?.images?.[0]?.url;
                  const editing =
                    formState?.mode === "edit" && formState.item.id === item.id;
                  const scale = item.scaleId
                    ? scaleById.get(item.scaleId)
                    : null;
                  return (
                    <tr
                      key={item.id}
                      className={
                        editing
                          ? "bg-primary-main/5"
                          : problem
                            ? "bg-yellow-50 dark:bg-yellow-900/10"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800/20"
                      }
                    >
                      <td className="px-3 py-3">{item.number}</td>
                      <td className="max-w-64 px-3 py-3">
                        <div className="flex items-center gap-2">
                          {thumb && (
                            <img
                              key={thumb}
                              src={thumb}
                              alt=""
                              className="h-8 w-8 shrink-0 rounded border border-gray-200 object-cover dark:border-gray-700"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                          <span className="line-clamp-2">
                            {summarize(item)}
                          </span>
                        </div>
                        {item.status === "RETIRED" && (
                          <span className="text-xs text-gray-500">
                            Dipensiunkan
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                          {TYPE_LABEL[item.type] ?? item.type}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs">
                        {scale ? scale.code : "-"}
                      </td>
                      <td className="px-3 py-3">
                        {problem ? (
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
                        )}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <IconButton
                            size="sm"
                            variant="text"
                            disabled={isLocked}
                            onClick={() => setFormState({ mode: "edit", item })}
                          >
                            <Edit size={16} />
                          </IconButton>
                          <IconButton
                            size="sm"
                            variant="text"
                            disabled={isLocked}
                            onClick={() =>
                              setFormState({ mode: "create", seed: item })
                            }
                          >
                            <Copy size={16} />
                          </IconButton>
                          {!isLocked && (
                            <DialogConfirmAction
                              title="Hapus Soal"
                              description={`Yakin ingin menghapus soal nomor ${item.number}?`}
                              onConfirm={() => deleteMutation.mutate(item.id)}
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

          {/* RINGKASAN & PAGING */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 px-4 py-3 text-xs text-gray-500 dark:border-gray-800">
            <span>
              {total} soal{" "}
              {!isFiltered && expected > 0 && (
                <>
                  dari target {expected}
                  {total < expected && ` (kurang ${expected - total})`}
                </>
              )}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outlined"
                  disabled={page <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Sebelumnya
                </Button>
                <span>
                  Halaman {page + 1} dari {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outlined"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Berikutnya
                </Button>
              </div>
            )}
          </div>
        </div>

        {formState && (
          <Panel title={formTitle} onClose={() => setFormState(null)}>
            <ItemForm
              key={
                formState.mode === "edit"
                  ? formState.item.id
                  : `create-${activeSection.id}-${formState.seed?.id ?? "new"}`
              }
              mode={formState.mode}
              item={formState.mode === "edit" ? formState.item : formState.seed}
              sectionId={activeSection.id}
              sectionCode={
                sectionById.get(activeSection.id)?.code ?? activeSection.code
              }
              nextNumber={nextNumber}
              defaultType={activeSection.defaultItemType}
              isAbility={isAbility}
              scales={scales.map((s) => ({
                id: s.id,
                code: s.code,
                name: s.name,
                sectionId: s.sectionId,
              }))}
              onSubmit={handleFormSubmit}
              onCancel={() => setFormState(null)}
            />
          </Panel>
        )}
      </div>
    </div>
  );
}
