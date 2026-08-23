import { createFileRoute, redirect } from "@tanstack/react-router";
import { isIndividualUser, needsOrganizationCreation } from "../../utils/auth";
import DashboardLayout from "./_organization/-components/layout";

export const Route = createFileRoute("/_auth/_organization")({
  beforeLoad: ({ context: { auth }, location }) => {
    const user = auth.get().user;

    if (isIndividualUser(user)) {
      throw redirect({ to: "/portal" });
    }

    if (needsOrganizationCreation(user)) {
      if (location.pathname !== "/create-organization") {
        throw redirect({ to: "/create-organization" });
      }
    }
  },
  component: DashboardLayout,
});
