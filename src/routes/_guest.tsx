import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { api } from "../utils/api";
import { getRedirectPathByRole } from "../utils/auth";
import type { User } from "../types/user";

export const Route = createFileRoute("/_guest")({
  beforeLoad: async ({ context: { queryClient } }) => {
    let isSuccess = false;
    let data = null;
    try {
      data = await queryClient.fetchQuery({
        queryKey: ["userProfile"],
        queryFn: () => api<User>("/api/v1/auth/me"),
        staleTime: 1000 * 60 * 5,
      });
      isSuccess = true;
    } catch (error) {
      isSuccess = false;
    }

    if (isSuccess) {
      throw redirect({ to: getRedirectPathByRole(data?.data) });
    }
  },
  component: GuestLayout,
});

function GuestLayout() {
  return <Outlet />;
}
