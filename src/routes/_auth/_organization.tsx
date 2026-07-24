import { createFileRoute, redirect } from "@tanstack/react-router";
import type { User } from "../../types/user";
import { api } from "../../utils/api";
import {
  getRedirectPathByRole,
  isIndividualUser,
  needsOrganizationCreation,
} from "../../utils/auth";
import DashboardLayout from "./_organization/-components/layout";

export const Route = createFileRoute("/_auth/_organization")({
  beforeLoad: async ({ context: { queryClient }, location }) => {
    let isError = false;
    let data = null;
    try {
      data = await queryClient.fetchQuery({
        queryKey: ["userProfile"],
        queryFn: () => api.get<User>("/api/v1/auth/me"),
        staleTime: 1000 * 60 * 5,
      });
    } catch (error) {
      isError = true;
    }

    if (isError || !data?.data) {
      throw redirect({ to: getRedirectPathByRole(data?.data) });
    }

    const user = data.data;

    // Validasi: User INDIVIDUAL tidak boleh akses organization routes
    if (isIndividualUser(user)) {
      throw redirect({ to: "/portal" });
    }

    // Validasi: User ORGANIZATION tanpa organizationId harus create organization dulu
    if (needsOrganizationCreation(user)) {
      // Hindari redirect loop jika sudah di halaman create organization
      if (location.pathname !== "/create-organization") {
        throw redirect({ to: "/create-organization" });
      }
    }
  },
  component: DashboardLayout,
});
