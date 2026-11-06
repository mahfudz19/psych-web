import { createFileRoute } from "@tanstack/react-router";
import { validateSearch } from "../../../_organization-and-individu/profile/sessions/validateSearch";
import TransactionsPage from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_organization/_admin/transactions/",
)({ validateSearch, component: TransactionsPage });
