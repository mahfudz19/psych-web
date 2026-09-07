import { Outlet } from "@tanstack/react-router";
import { isOrganizationUser } from "../../../../utils/auth";
import { useAuthStore } from "../../../../utils/authStore";
import { PortalLayout } from "../../_individu/-components/layout";
import { DashboardLayout } from "../../_organization/-components/layout";

export default function IndividuAndOrganizationLayout() {
  const { user } = useAuthStore();

  if (isOrganizationUser(user))
    return (
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    );

  return (
    <PortalLayout>
      <Outlet />
    </PortalLayout>
  );
}
