import { createFileRoute } from "@tanstack/react-router";
import SessionPage from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/profile/sessions/",
)({
  component: SessionPage,
});
