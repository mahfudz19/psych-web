import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "../../../../components/layout/Sidebar";
import { Topbar } from "../../../../components/layout/Topbar";
import { SidebarProvider } from "../../../../contexts/SidebarContext";
import { authStore } from "../../../../utils/authStore";

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = authStore.get();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-bg-default font-sans overflow-hidden">
        <Sidebar />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar
            fullName={user?.fullName || ""}
            accountType={user?.accountType || ""}
            email={user?.email || ""}
            subscriptionTier={user?.subscriptionTier || ""}
            status={user?.status || ""}
          />
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
