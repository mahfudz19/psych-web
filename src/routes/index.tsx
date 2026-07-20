import { createFileRoute, redirect } from "@tanstack/react-router";
import { apiFetch } from "../src/utils/api";

const fetchUserProfile = () => apiFetch("/api/v1/users/me");

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context: { queryClient } }) => {
    try {
      await queryClient.fetchQuery({
        queryKey: ["userProfile"],
        queryFn: fetchUserProfile,
        staleTime: 1000 * 60 * 5,
      });
      throw redirect({ to: "/dashboard" });
    } catch (error) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => null,
});
