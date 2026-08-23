import { createFileRoute } from "@tanstack/react-router";
import IndividuAndOrganizationLayout from "./_organization-and-individu/-components/layout";

export const Route = createFileRoute("/_auth/_organization-and-individu")({
  component: IndividuAndOrganizationLayout,
});
