import { createFileRoute } from "@tanstack/react-router";
import BillingPage from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/billing/",
)({
  component: BillingPage,
});
