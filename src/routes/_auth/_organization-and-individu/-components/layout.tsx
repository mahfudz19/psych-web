import { Outlet } from "@tanstack/react-router";
import { useAuth } from "../../../../hooks/useAuth";
import { PortalLayout } from "../../_individu/-components/layout";
import { DashboardLayout } from "../../_organization/-components/layout";
import { isOrganizationUser } from "../../../../utils/auth";

export default function IndividuAndOrganizationLayout() {
  const { user } = useAuth();

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
