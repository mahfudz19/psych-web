import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { api } from "../utils/api";

export const Route = createFileRoute("/_guest")({
  beforeLoad: async ({ context: { queryClient } }) => {
    let isSuccess = false;
    try {
      // Coba fetch profile. Jika berhasil, berarti user sudah login.
      await queryClient.fetchQuery({
        queryKey: ["userProfile"],
        queryFn: () => api("/api/v1/auth/me"),
        staleTime: 1000 * 60 * 5,
      });
      isSuccess = true;
    } catch (error) {
      // Normal jika gagal (artinya memang guest)
      isSuccess = false;
    }

    if (isSuccess) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: GuestLayout,
});

function GuestLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        backgroundColor: "#f9fafb",
      }}
    >
      {/* Header Sederhana */}
      <header style={{ marginBottom: "2rem" }}>
        <h2>@psych-web (Area Publik)</h2>
      </header>

      {/* Konten Login / Register akan dirender di sini */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
