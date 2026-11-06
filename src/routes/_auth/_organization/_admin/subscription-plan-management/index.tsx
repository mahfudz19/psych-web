import { createFileRoute } from "@tanstack/react-router";
import { validateSearch } from "../../../../../components/utility/validateSearch";
import SubscriptionPlanManagement from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_organization/_admin/subscription-plan-management/",
)({ validateSearch, component: SubscriptionPlanManagement });
