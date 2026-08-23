import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import toast from "../../../components/ui/Toast";
import * as api from "./auth.api";
import { getRedirectPathByRole } from "../../../utils/auth";
import { authStore } from "../../../utils/authStore";

export function useLoginMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api.login(credentials),
    onSuccess: ({ data }) => {
      if (!data) throw new Error("Login failed");
      // 1. Simpan ke memory (synchronous)
      authStore.set({
        user: data.user,
        accessToken: data.accessToken,
      });

      // 2. Pre-populate cache Query agar tidak fetch ulang
      queryClient.setQueryData(["userProfile"], { data: data.user });

      toast.success("Login success");

      // 3. Invalidate router & redirect
      router.invalidate().then(() => {
        router.navigate({ to: getRedirectPathByRole(data.user) });
      });
    },
    onError: () => toast.error("Login failed"),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (credentials: api.RegisterRequest) => api.register(credentials),
    onSuccess: () => toast.success("Register success"),
    onError: () => toast.error("Register failed"),
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => api.logout(),
    onSuccess: () => {
      authStore.clear();
      queryClient.clear();
      router.navigate({ to: "/login", replace: true });
      toast.success("Logout success");
    },
    onError: () => {
      authStore.clear();
      queryClient.clear();
      router.navigate({ to: "/login", replace: true });
      toast.error("Logout failed");
    },
  });
}
