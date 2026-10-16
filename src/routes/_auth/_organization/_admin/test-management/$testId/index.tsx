import { createFileRoute } from "@tanstack/react-router";
import TestDetail from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_organization/_admin/test-management/$testId/",
)({
  component: TestDetail,
});
