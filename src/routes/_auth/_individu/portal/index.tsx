import { createFileRoute } from "@tanstack/react-router";
import PortalDashboard from "./-components/page";

export const Route = createFileRoute("/_auth/_individu/portal/")({
  component: PortalDashboard,
});
