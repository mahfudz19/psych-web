import { createFileRoute } from "@tanstack/react-router";
import { validateSearch } from "../../../../components/utility/validateSearch";
import OrganizationMembersPage from "./-components/page";

export const Route = createFileRoute("/_auth/_organization/members/")({
  validateSearch,
  component: OrganizationMembersPage,
});
