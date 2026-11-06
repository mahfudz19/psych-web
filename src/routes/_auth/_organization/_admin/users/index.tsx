import { createFileRoute } from "@tanstack/react-router";
import { validateSearch } from "../../../../../components/utility/validateSearch";
import UsersPage from "./-components/page";

export const Route = createFileRoute("/_auth/_organization/_admin/users/")({
  validateSearch,
  component: UsersPage,
});
