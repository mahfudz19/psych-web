import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_guest/")({
  beforeLoad: () => redirect({ to: "/login" }),
});
