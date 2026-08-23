import { createFileRoute } from "@tanstack/react-router";
import OrganizationSettingsPage from "./-components/page";

export const Route = createFileRoute("/_auth/_organization/settings/")({
  component: OrganizationSettingsPage,
});
