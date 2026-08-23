import { Outlet } from "@tanstack/react-router";
import { PortalLayout } from "../../_individu/-components/layout";
import { DashboardLayout } from "../../_organization/-components/layout";
import { isOrganizationUser } from "../../../../utils/auth";
import { authStore } from "../../../../utils/authStore";

export default function IndividuAndOrganizationLayout() {
  const { user } = authStore.get();

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
