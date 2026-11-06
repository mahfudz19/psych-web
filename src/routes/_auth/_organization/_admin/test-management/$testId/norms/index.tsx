import { createFileRoute } from "@tanstack/react-router";
import { validateSearch } from "../../../../../../../components/utility/validateSearch";
import TestNorms from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_organization/_admin/test-management/$testId/norms/",
)({ validateSearch, component: TestNorms });
