import { createFileRoute } from "@tanstack/react-router";
import { validateSearch } from "../../../../../components/utility/validateSearch";
import OrganizationsPage from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_organization/_admin/organizations/",
)({ validateSearch, component: OrganizationsPage });
