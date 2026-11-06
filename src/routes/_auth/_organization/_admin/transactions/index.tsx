import { createFileRoute } from "@tanstack/react-router";
import { validateSearch } from "../../../../../components/utility/validateSearch";
import TransactionsPage from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_organization/_admin/transactions/",
)({ validateSearch, component: TransactionsPage });
