import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../../../../hooks/useAuth";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/billing/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuth();

  return (
    <div>
      Hello "/_auth/{user?.organizationId ? "organization" : "individu"}
      /individu"!
    </div>
  );
}
