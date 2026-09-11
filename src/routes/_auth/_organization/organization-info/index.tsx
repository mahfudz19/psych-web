import { createFileRoute } from "@tanstack/react-router";
import OrganizationInfoPage from "./-components/page";

export const Route = createFileRoute("/_auth/_organization/organization-info/")(
  { component: OrganizationInfoPage },
);
