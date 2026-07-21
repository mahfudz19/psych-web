import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { api } from "../utils/api";

const fetchUserProfile = () => api<any>("/api/v1/auth/me");

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    staleTime: 1000 * 60 * 5, // Cache selama 5 menit
    retry: false, // Jangan retry jika gagal (kemungkinan 401 Unauthorized)
  });

  const logoutMutation = useMutation({
    mutationFn: () => api("/api/v1/auth/logout", { method: "POST" }),
    onSettled: () => {
      // Hapus semua cache dan paksa pindah ke login
      queryClient.clear();
      router.invalidate().then(() => {
        router.navigate({ to: "/login" });
      });
    },
  });

  return {
    user: data?.data, // Akan berisi object user jika berhasil
    isAuthenticated: !!data?.data,
    isLoading,
    isError,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
};
