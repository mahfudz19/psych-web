import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "../../../../components/layout/Sidebar";
import { Topbar } from "../../../../components/layout/Topbar";
import { SidebarProvider } from "../../../../contexts/SidebarContext";
import { useAuth } from "../../../../hooks/useAuth";

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default function Layout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
