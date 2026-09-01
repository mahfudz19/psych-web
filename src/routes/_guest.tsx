import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getRedirectPathByRole } from "../utils/auth";
import * as authApi from "./_guest/-api/auth.api";
import { AuthSplitLayout } from "./_guest/-components/AuthSplitLayout";

export const Route = createFileRoute("/_guest")({
  beforeLoad: async ({ context: { queryClient, auth } }) => {
    if (auth?.isAuthenticated?.()) {
      throw redirect({ to: getRedirectPathByRole(auth.get().user) });
    }

    try {
      const response = await queryClient.query({
        queryKey: ["userProfile"],
        queryFn: () => authApi.me(),
        staleTime: 1000 * 60 * 5,
      });

      if (response?.data) {
        auth.set({ user: response.data });
        throw redirect({ to: getRedirectPathByRole(response.data) });
      }
    } catch (error) {
      return;
    }
  },
  component: GuestLayout,
});

function GuestLayout() {
  return (
    <AuthSplitLayout>
      <Outlet />
    </AuthSplitLayout>
  );
}
