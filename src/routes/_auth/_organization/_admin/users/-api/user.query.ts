import { useQuery } from "@tanstack/react-query";
import * as api from "./user.api";
import toast from "../../../../../../components/ui/Toast";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useUsersQuery(params: api.UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () =>
      api
        .getUsers(params)
        .catch((error) =>
          toast.error(error?.data?.message || "Gagal mengambil data pengguna"),
        ),
  });
}

// /**
//  * Hook untuk mengambil detail satu User berdasarkan ID
//  */
// export function useUserDetailQuery(userId: string) {
//   return useQuery({
//     queryKey: userKeys.detail(userId),
//     queryFn: () => api.getUserById(userId),
//     // Praktik Terbaik: 'enabled' mencegah query berjalan jika userId masih kosong/undefined
//     enabled: !!userId,
//   });
// }

// // ============================================================================
// // MUTATIONS (Untuk proses POST, PUT, DELETE / Write)
// // ============================================================================

// /**
//  * Contoh Hook Mutation untuk menghapus User
//  */
// export function useDeleteUserMutation() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (userId: string) => api.deleteUser(userId),
//     onSuccess: () => {
//       // Praktik Terbaik: Invalidasi cache list agar tabel/daftar otomatis ter-refresh (fetch ulang)
//       // tanpa harus me-refresh halaman browser
//       queryClient.invalidateQueries({ queryKey: userKeys.lists() });
//     },
//   });
// }
