import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import * as authApi from "./_guest/-api/auth.api";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context: { queryClient, auth }, location }) => {
    if (auth.isAuthenticated()) {
      return;
    }

    try {
      const response = await queryClient.query({
        queryKey: ["userProfile"],
        queryFn: () => authApi.me(),
        staleTime: 1000 * 60 * 5,
      });

      auth.set({ user: response.data });
    } catch (error) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
