import { createFileRoute } from "@tanstack/react-router";
import HistoryDetailPage from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_individu/test-history/$attemptId/",
)({ component: HistoryDetailPage });
