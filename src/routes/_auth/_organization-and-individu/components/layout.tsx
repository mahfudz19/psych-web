import { Outlet } from "@tanstack/react-router";
import { useAuth } from "../../../../hooks/useAuth";
import { PortalLayout } from "../../_individu/components/layout";
import { DashboardLayout } from "../../_organization/components/layout";

export default function IndividuAndOrganizationLayout() {
  const { user } = useAuth();

  if (user?.organizationId)
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
