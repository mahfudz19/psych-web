import { SidebarProvider } from "../../contexts/SidebarContext";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Sidebar } from "../../components/layout/Sidebar";
import { Topbar } from "../../components/layout/Topbar";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../utils/api";
import type { User } from "../../types/user";
import { getRedirectPathByRole } from "../../utils/auth";

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

function DashboardLayout() {
  const { user } = useAuth();

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-default text-text-secondary">
        Memuat layout...
      </div>
    );

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-bg-default font-sans overflow-hidden">
        <Sidebar />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
