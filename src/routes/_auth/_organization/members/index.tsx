import { createFileRoute } from "@tanstack/react-router";
import OrganizationMembersPage from "./-components/page";

export const Route = createFileRoute("/_auth/_organization/members/")({
  component: OrganizationMembersPage,
});
