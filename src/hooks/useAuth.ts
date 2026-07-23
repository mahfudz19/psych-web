import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { User } from "../types/user";
import { api } from "../utils/api";

const fetchUserProfile = () => api<User>("/api/v1/auth/me");

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    staleTime: 1000 * 60 * 5, // 5 menit
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: () => api("/api/v1/auth/logout", { method: "POST" }),
    onSettled: () => {
      queryClient.clear();
      router.invalidate().then(() => router.navigate({ to: "/login" }));
    },
  });

  const logout = async () => {
    try {
      await api("/api/v1/auth/logout", { method: "POST" });
      queryClient.clear();
      router.navigate({ to: "/login", replace: true });
    } catch (error) {
      console.error("Gagal logout", error);
    }
  };
  console.log(data?.data);

  return {
    user: data?.data,
    isAuthenticated: !!data?.data,
    isLoading,
    isError,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
};
