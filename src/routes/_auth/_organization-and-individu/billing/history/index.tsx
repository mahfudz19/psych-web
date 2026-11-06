import { createFileRoute } from "@tanstack/react-router";
import { validateSearch } from "../../profile/sessions/validateSearch";
import HistoryPage from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/billing/history/",
)({ validateSearch, component: HistoryPage });
