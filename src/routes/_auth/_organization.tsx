import { createFileRoute, redirect } from "@tanstack/react-router";
import type { User } from "../../types/user";
import { api } from "../../utils/api";
import { getRedirectPathByRole } from "../../utils/auth";
import DashboardLayout from "./_organization/components/layout";

export const Route = createFileRoute("/_auth/_organization")({
  beforeLoad: async ({ context: { queryClient } }) => {
    let isError = false;
    let data = null;
    try {
      data = await queryClient.fetchQuery({
        queryKey: ["userProfile"],
        queryFn: () => api<User>("/api/v1/auth/me"),
        staleTime: 1000 * 60 * 5,
      });
    } catch (error) {
      isError = true;
    }

    if (isError) {
      throw redirect({ to: getRedirectPathByRole(data?.data) });
    }
  },
  component: DashboardLayout,
});
