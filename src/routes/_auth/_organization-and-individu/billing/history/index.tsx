import { createFileRoute } from "@tanstack/react-router";
import { validateSearch } from "../../../../../components/utility/validateSearch";
import HistoryPage from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/billing/history/",
)({ validateSearch, component: HistoryPage });
