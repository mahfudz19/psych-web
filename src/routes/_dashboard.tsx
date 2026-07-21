import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { useAuth } from "../hooks/useAuth";
import { api } from "../utils/api";

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
  const { user } = useAuth();

  // Guard clause jika user masih loading
  if (!user) return <p>Memuat layout...</p>;

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Sidebar tersemat di kiri */}
      <Sidebar />

      {/* Area utama yang mengisi sisa layar */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />

        {/* Konten bisa di-scroll di sini */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
