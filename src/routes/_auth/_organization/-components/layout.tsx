import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "../../../../components/layout/Sidebar";
import { Topbar } from "../../../../components/layout/Topbar";
import { SidebarProvider } from "../../../../contexts/SidebarContext";

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-bg-default font-sans overflow-hidden">
        <Sidebar />

        <main id="main-scroll-area" className="flex-1 overflow-y-auto relative">
          <Topbar />

          <div className="p-6">{children}</div>
        </main>
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
