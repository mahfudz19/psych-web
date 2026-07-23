import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { login } from "./login.api";
import { getRedirectPathByRole } from "../../../../utils/auth";
import toast from "../../../../components/ui/Toast";

export function useLoginMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      login(credentials),
    onSuccess: ({ data }) => {
      toast.success("Login success");
      router
        .invalidate()
        .then(() => router.navigate({ to: getRedirectPathByRole(data?.user) }));
    },
    onError: () => toast.error("Login failed"),
  });
}
