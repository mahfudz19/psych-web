import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/invite/$token")({
  beforeLoad: async ({ context: { auth }, params }) => {
    if (auth.isAuthenticated()) {
      throw redirect({
        to: "/joint/invite/$token",
        params: { token: params.token },
      });
    }

    throw redirect({
      to: "/register/invite/$token",
      params: { token: params.token },
    });
  },
});
