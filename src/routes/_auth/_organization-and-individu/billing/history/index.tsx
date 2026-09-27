import { createFileRoute } from "@tanstack/react-router";
import HistoryPage from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/billing/history/",
)({
  component: HistoryPage,
});
