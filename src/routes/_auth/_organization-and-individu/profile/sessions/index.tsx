import { createFileRoute } from "@tanstack/react-router";
import SessionPage from "./-components/page";
import { validateSearch } from "../../../../../components/utility/validateSearch";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/profile/sessions/",
)({ validateSearch, component: SessionPage });
