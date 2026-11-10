import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/_exam/exam/result/$attemptId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { attemptId } = Route.useParams();

  return <div>Hello "/_auth/_exam/exam/result/{attemptId}"!</div>;
}
