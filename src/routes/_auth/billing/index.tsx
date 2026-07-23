import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../../../hooks/useAuth";
import { PortalLayout } from "../_individu/components/layout";
import { DashboardLayout } from "../_organization/components/layout";

export const Route = createFileRoute("/_auth/billing/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuth();

  if (user?.organizationId)
    return (
      <DashboardLayout>Hello "/_auth/billing/organization"!</DashboardLayout>
    );

  return <PortalLayout>Hello "/_auth/billing/individu"!</PortalLayout>;
}
