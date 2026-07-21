import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
} from "@tanstack/react-router";
import { api } from "../utils/api";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/_dashboard")({
  beforeLoad: async ({ context: { queryClient } }) => {
    let isError = false;
    try {
      await queryClient.fetchQuery({
        queryKey: ["userProfile"],
        queryFn: () => api("/api/v1/auth/me"),
        staleTime: 1000 * 60 * 5,
      });
    } catch (error) {
      isError = true;
    }

    if (isError) {
      throw redirect({ to: "/login" });
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const { user, logout, isLoggingOut } = useAuth();

  // Guard clause jika user masih loading
  if (!user) return <p>Memuat layout...</p>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: "250px",
          borderRight: "1px solid #ccc",
          padding: "1rem",
        }}
      >
        <h3>Menu Aplikasi</h3>
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginTop: "1rem",
          }}
        >
          <Link to="/dashboard">Overview</Link>
          <Link to="/tests">Psikotes</Link>

          {/* Sidebar Dinamis Berdasarkan Tipe Akun */}
          {user.accountType === "ORGANIZATION" && (
            <Link to="/members">Manajemen Anggota</Link>
          )}

          {user.roles?.includes("ADMIN") && (
            <Link to="/admin">Super Admin Panel</Link>
          )}
        </nav>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* TOPBAR */}
        <header
          style={{
            borderBottom: "1px solid #ccc",
            padding: "1rem",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>
            Halo, {user.fullName} ({user.accountType})
          </span>
          <button onClick={logout} disabled={isLoggingOut}>
            {isLoggingOut ? "Keluar..." : "Logout"}
          </button>
        </header>

        {/* KONTEN UTAMA */}
        <main style={{ padding: "2rem" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
