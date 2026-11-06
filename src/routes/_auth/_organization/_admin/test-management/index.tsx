import { createFileRoute } from "@tanstack/react-router";
import { validateSearch } from "../../../../../components/utility/validateSearch";
import TestManagement from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_organization/_admin/test-management/",
)({ validateSearch, component: TestManagement });
