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

export function useUserDetailQuery(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => api.getUserById(userId),
    enabled: !!userId,
  });
}
