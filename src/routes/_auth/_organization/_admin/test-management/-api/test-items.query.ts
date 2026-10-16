/**
 * HOOK SEMENTARA (STUB).
 *
 * Backend TestItemService belum ada, jadi file ini mengembalikan data contoh
 * agar tampilan daftar soal bisa dicoba. Saat endpoint siap, ganti isi kedua
 * hook dengan pemanggilan API sebenarnya, tanpa mengubah bentuk kembaliannya:
 *
 *   useGetTestItems    -> GET    /tests/{testId}/items?sectionId=&scaleId=&type=&page=&size=
 *                         (aktifkan hanya jika sectionId terisi: enabled: !!params.sectionId)
 *   useDeleteTestItemMutation -> DELETE /tests/{testId}/items/{itemId}
 *
 * Bentuk respons yang diharapkan sama dengan hook lain di proyek ini:
 *   { data: TestItem[], page: { number, size, totalElements, totalPages } }
 *
 * Setelah mutation delete sukses, invalidasi query daftar soal dan query
 * detail tes (karena statistik jumlah soal ikut berubah).
 */
import type { ItemListParams, PageInfo, TestItem } from "./test-items.type";

const USE_MOCK = true;

function mockItems(sectionId: string): TestItem[] {
  const base = {
    testId: "mock",
    testVersion: "1.0.0",
    sectionId,
    groupId: null,
    reverseScored: false,
    weight: 1,
    scoredInTotal: true,
    consistencyGroup: null,
    timeLimitSeconds: null,
    constraints: {},
    difficulty: null,
    isExample: false,
    status: "ACTIVE" as const,
    tags: [],
    createdAt: "2026-10-04T09:00:00Z",
    updatedAt: "2026-10-04T09:00:00Z",
  };
  const choice = (n: number, withKey: boolean): TestItem => ({
    ...base,
    id: `mock-${n}`,
    number: n,
    type: "SINGLE_CHOICE",
    content: {
      text: `Contoh soal pilihan tunggal nomor ${n}`,
      images: [],
      audioUrl: null,
    },
    options: ["1", "2", "3", "4"].map((k, i) => ({
      key: k,
      label: `Pilihan ${k}`,
      imageUrl: null,
      order: i + 1,
      scoring: null,
    })),
    scaleId: null,
    answerKey: withKey ? { correct: ["2"] } : null,
  });
  const likert: TestItem = {
    ...base,
    id: "mock-3",
    number: 3,
    type: "LIKERT",
    content: {
      text: "Contoh soal Likert: saya mudah bergaul",
      images: [],
      audioUrl: null,
    },
    options: [1, 2, 3, 4, 5].map((p) => ({
      key: String(p),
      label: `Opsi ${p}`,
      imageUrl: null,
      order: p,
      scoring: { points: p },
    })),
    scaleId: null,
    answerKey: null,
  };
  return [choice(1, true), choice(2, false), likert];
}

export function useGetTestItems(
  _testId: string,
  params: ItemListParams,
): { data?: { data: TestItem[]; page: PageInfo }; isLoading: boolean } {
  if (!USE_MOCK || !params.sectionId) {
    return {
      isLoading: false,
      data: {
        data: [],
        page: { number: 0, size: params.size, totalElements: 0, totalPages: 0 },
      },
    };
  }
  const rows = mockItems(params.sectionId);
  return {
    isLoading: false,
    data: {
      data: rows,
      page: {
        number: 0,
        size: params.size,
        totalElements: rows.length,
        totalPages: 1,
      },
    },
  };
}

export function useDeleteTestItemMutation(_testId: string): {
  mutate: (itemId: string) => void;
} {
  return {
    mutate: (itemId: string) => {
      console.log(
        "[useDeleteTestItemMutation] belum tersambung ke API. itemId:",
        itemId,
      );
    },
  };
}
