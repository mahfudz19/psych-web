import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/tests/history/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_dashboard/tests/history/"!</div>;
}
