import { createFileRoute, redirect } from "@tanstack/react-router";
import { getRedirectPathByRole } from "../../utils/auth";
import { api } from "../../utils/api";
import type { User } from "../../types/user";
import ExamLayout from "./_exam/components/layout.tsx";

export const Route = createFileRoute("/_auth/_exam")({
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
  component: ExamLayout,
});
