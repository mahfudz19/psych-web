import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { getRedirectPathByRole } from "../utils/auth";
import * as authApi from "./_guest/-api/auth.api";
import {
  AuthSplitLayout,
  type AuthSplitLayoutProps,
} from "./_guest/-components/AuthSplitLayout";

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
  const location = useLocation();
  const path = location.pathname;

  let layoutKey: AuthSplitLayoutProps["layoutKey"] = "login";
  let imagePosition: "left" | "right" = "left";

  if (path.includes("/register/invite")) {
    layoutKey = "registerInvite";
    imagePosition = "right";
  } else if (path.includes("/register/verify-email")) {
    layoutKey = "registerIndividual";
    imagePosition = "left";
  } else if (path.includes("/register")) {
    layoutKey = "registerIndividual";
    imagePosition = "right";
  } else if (
    path.includes("/reset-password") ||
    path.includes("/forgot-password")
  ) {
    layoutKey = "resetPassword";
    imagePosition = "left";
  }

  return (
    <AuthSplitLayout layoutKey={layoutKey} imagePosition={imagePosition}>
      <Outlet />
    </AuthSplitLayout>
  );
}
