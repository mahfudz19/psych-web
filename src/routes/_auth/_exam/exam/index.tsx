import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/_exam/exam/")({
  beforeLoad: () => redirect({ to: "/", replace: true }),
});
