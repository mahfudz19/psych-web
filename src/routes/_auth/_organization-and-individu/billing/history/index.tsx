import { createFileRoute } from "@tanstack/react-router";
import type { BaseListParams } from "../../../../../components/reusebale-components/DataTable";
import HistoryPage from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/billing/history/",
)({
  validateSearch: (search: Record<string, unknown>): BaseListParams => {
    return {
      page: search.page ? Number(search.page) : undefined,
      limit: search.limit ? Number(search.limit) : undefined,
      search: search.search as string | undefined,
      sortBy: search.sortBy as string | undefined,
      sortOrder: search.sortOrder as "asc" | "desc" | undefined,
      filter: search.filter as string | undefined,
    };
  },
  component: HistoryPage,
});
