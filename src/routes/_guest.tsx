import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { api } from "../utils/api";

export const Route = createFileRoute("/_guest")({
  beforeLoad: async ({ context: { queryClient } }) => {
    let isSuccess = false;
    try {
      await queryClient.fetchQuery({
        queryKey: ["userProfile"],
        queryFn: () => api("/api/v1/auth/me"),
        staleTime: 1000 * 60 * 5,
      });
      isSuccess = true;
    } catch (error) {
      isSuccess = false;
    }

    if (isSuccess) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: GuestLayout,
});

function GuestLayout() {
  return <Outlet />;
}
