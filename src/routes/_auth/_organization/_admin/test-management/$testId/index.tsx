import { createFileRoute } from "@tanstack/react-router";
import { validateSearch } from "../../../../../../components/utility/validateSearch";
import TestDetail from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_organization/_admin/test-management/$testId/",
)({ validateSearch, component: TestDetail });
