import { createFileRoute } from "@tanstack/react-router";
import { validateSearch } from "../../../_organization-and-individu/profile/sessions/validateSearch";
import OrganizationsPage from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_organization/_admin/organizations/",
)({ validateSearch, component: OrganizationsPage });
