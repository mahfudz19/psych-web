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

      if (data.user) {
        authStore.set({ user: data.user, accessToken: data.accessToken });
      }

      queryClient.setQueryData(["userProfile"], { data: data.user });
      toast.success("Login success");

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

export function useResendVerifyEmailMutation() {
  return useMutation({
    mutationFn: (email: string) => api.resendVerifyEmail(email),
    onSuccess: () => toast.success("Verification email resent successfully"),
    onError: () => toast.error("Failed to resend verification email"),
  });
}

export function useVerifyEmailMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    retry: false,
    mutationFn: ({
      email,
      plainToken,
    }: {
      email: string;
      plainToken: string;
    }) => api.verifyEmail(email, plainToken),
    onSuccess: ({ data }) => {
      toast.success("Email verified successfully");
      router.navigate({ to: getRedirectPathByRole(data?.user), replace: true });
      if (data?.user)
        queryClient.setQueryData(["userProfile"], { data: data.user });
    },
    onError: ({ message }) => toast.error(message || "Failed to verify email"),
  });
}
