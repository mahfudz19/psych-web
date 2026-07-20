import { createFileRoute, redirect } from "@tanstack/react-router";
import { apiFetch } from "../src/utils/api";

const fetchUserProfile = () => apiFetch("/api/v1/auth/me");

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context: { queryClient } }) => {
    let isSuccess = false;

    try {
      await queryClient.fetchQuery({
        queryKey: ["userProfile"],
        queryFn: fetchUserProfile,
        staleTime: 1000 * 60 * 5,
      });
      // Jika berhasil, ubah flag menjadi true
      isSuccess = true;
    } catch (error) {
      // Jika error (misal 401 dari backend), biarkan flag tetap false
      isSuccess = false;
    }

    // Lakukan pelemparan redirect di LUAR blok try-catch
    if (isSuccess) {
      throw redirect({ to: "/dashboard" });
    } else {
      throw redirect({ to: "/login" });
    }
  },
  component: () => null,
});
