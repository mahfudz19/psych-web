import { createFileRoute } from "@tanstack/react-router";
import UsersPage from "./-components/page";
import type { UserListParams } from "./-api/user.api";

export const Route = createFileRoute("/_auth/_organization/_admin/users/")({
  validateSearch: (search: Record<string, unknown>): UserListParams => {
    return {
      page: search.page ? Number(search.page) : undefined,
      limit: search.limit ? Number(search.limit) : undefined,
      search: search.search as string | undefined,
      sortBy: search.sortBy as string | undefined,
      sortOrder: search.sortOrder as "asc" | "desc" | "" | undefined,
      filter: search.filter as string | undefined,
    };
  },
  component: UsersPage,
});
