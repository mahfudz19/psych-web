import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { getRedirectPathByRole } from "../../../../utils/auth";
import toast from "../../../../components/ui/Toast";
import { register, type RegisterRequest } from "./register.api";

export function useRegisterMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: RegisterRequest) => register(credentials),
    onSuccess: ({ data }) => {
      toast.success("Register success");
      router
        .invalidate()
        .then(() => router.navigate({ to: getRedirectPathByRole(data?.user) }));
    },
    onError: () => toast.error("Register failed"),
  });
}
