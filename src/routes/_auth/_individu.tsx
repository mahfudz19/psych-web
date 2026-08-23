import { createFileRoute, redirect } from "@tanstack/react-router";
import { isOrganizationUser } from "../../utils/auth";
import PortalLayout from "./_individu/-components/layout";

export const Route = createFileRoute("/_auth/_individu")({
  beforeLoad: ({ context: { auth } }) => {
    if (isOrganizationUser(auth.get().user))
      throw redirect({ to: "/dashboard" });
  },
  component: PortalLayout,
});
