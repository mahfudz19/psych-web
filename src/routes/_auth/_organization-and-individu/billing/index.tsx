import { createFileRoute } from "@tanstack/react-router";
import { authStore } from "../../../../utils/authStore";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/billing/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = authStore.get();

  return (
    <div>
      Hello "/_auth/{user?.organizationId ? "organization" : "individu"}
      /individu"!
    </div>
  );
}
