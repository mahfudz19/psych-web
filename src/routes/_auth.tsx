import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type { User } from "../types/user";
import { api } from "../utils/api";

/**
 * Layout route untuk area yang memerlukan autentikasi
 * Semua route di bawah /_auth akan melewati guard ini
 */
export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context: { queryClient } }) => {
    try {
      await queryClient.fetchQuery({
        queryKey: ["userProfile"],
        queryFn: () => api.get<User>("/api/v1/auth/me"),
        staleTime: 1000 * 60 * 5,
      });
    } catch (error) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthLayout,
});

/**
 * Layout sederhana untuk area autentikasi
 * Child routes akan me-render melalui Outlet
 */
function AuthLayout() {
  return <Outlet />;
}
