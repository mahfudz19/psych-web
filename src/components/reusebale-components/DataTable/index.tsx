import {
  ChevronLeft,
  ChevronRight,
  ArrowDownUp,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { PaginationMeta } from "../../../types";
import IconButton from "../../ui/IconButton";
import Input from "../../ui/Input";
import FacetedFilter from "./FacetedFilter";
import type { UserListParams } from "../../../routes/_auth/_organization/_admin/users/-api/user.api";
import DateRangeFilter from "./DateRangeFilter";

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T | string;
  sortable?: boolean;
  cell?: (row: T) => React.ReactNode;
  filterType?: "text" | "faceted" | "date-range";
  filterOptions?: { label: string; value: string }[];
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data?: T[] | null;
  meta?: PaginationMeta | null;
  isLoading?: boolean;
  state: UserListParams;
  onStateChange: (newState: UserListParams) => void;
}

const parseFilterString = (filterStr?: string): Record<string, string> => {
  const result: Record<string, string> = {};
  if (!filterStr) return result;

  const fields = filterStr.split(";");
  fields.forEach((field) => {
    const firstColonIdx = field.indexOf(":");
    if (firstColonIdx === -1) return;

    const key = field.slice(0, firstColonIdx);
    let value = field.slice(firstColonIdx + 1);

    if (value.startsWith("in:")) value = value.slice(3);
    else if (value.startsWith("between:")) value = value.slice(8);
    result[key] = value;
  });
  return result;
};

const buildFilterString = (
  filters: Record<string, string>,
): string | undefined => {
  const parts: string[] = [];
  Object.entries(filters).forEach(([key, val]) => {
    if (!val) return;

    if (
      val.match(/^\d{4}-\d{2}-\d{2},?\d{4}-\d{2}-\d{2}?$/) ||
      val.match(/^,\d{4}-\d{2}-\d{2}$/) ||
      val.match(/^\d{4}-\d{2}-\d{2},$/)
    ) {
      parts.push(`${key}:between:${val}`);
    } else if (val.includes(",")) {
      parts.push(`${key}:in:${val}`);
    } else {
      parts.push(`${key}:${val}`);
    }
  });
  return parts.length > 0 ? parts.join(";") : undefined;
};

// --- HELPER PAGINATION ---
const generatePagination = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

export function DataTable<T>({
  columns,
  data,
  meta,
  isLoading,
  state,
  onStateChange,
}: DataTableProps<T>) {
  const [searchInput, setSearchInput] = useState(state.search || "");

  const [localFilters, setLocalFilters] = useState<Record<string, string>>(() =>
    parseFilterString(state.filter),
  );

  const emitCleanState = (newState: UserListParams) => {
    const cleanState: UserListParams = {
      ...newState,
      search: newState.search === "" ? undefined : newState.search,
      sortBy: newState.sortBy === "" ? undefined : newState.sortBy,
      sortOrder: newState.sortOrder === "" ? undefined : newState.sortOrder,
      filter: newState.filter === "" ? undefined : newState.filter,
    };
    onStateChange(cleanState);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (state.search || "")) {
        emitCleanState({ ...state, search: searchInput, page: 1 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, state]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentFilterStr = state.filter || "";
      const newFilterStr = buildFilterString(localFilters) || "";

      if (currentFilterStr !== newFilterStr) {
        emitCleanState({ ...state, filter: newFilterStr, page: 1 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localFilters, state]);

  const handleSort = (accessorKey: string, isSortable?: boolean) => {
    if (!isSortable) return;
    let newOrder: "asc" | "desc" = "asc";
    if (state.sortBy === accessorKey) {
      newOrder = state.sortOrder === "asc" ? "desc" : "asc";
    }
    emitCleanState({
      ...state,
      sortBy: accessorKey,
      sortOrder: newOrder,
      page: 1,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col w-full bg-bg-paper rounded-3xl shadow-sm border border-divider overflow-hidden">
      {/* --- TOOLBAR UTAMA --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-b border-divider">
        <div className="w-full sm:w-72">
          <Input
            type="text"
            placeholder="Cari global..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary shrink-0">
          <span>Tampilkan</span>
          <select
            value={state.limit || 10}
            onChange={(e) =>
              emitCleanState({
                ...state,
                limit: Number(e.target.value),
                page: 1,
              })
            }
            className="border border-divider rounded-lg px-2 py-1.5 text-sm focus:outline-none bg-transparent hover:bg-divider/10 transition-colors cursor-pointer"
          >
            {[5, 10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>baris</span>
        </div>
      </div>

      {/* --- AREA TABEL --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          {/* Header Tabel Bersih */}
          <thead className="bg-bg-paper text-text-secondary text-xs border-b border-divider">
            {/* Baris 1: Nama Kolom & Sortir */}
            <tr className="uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() =>
                    handleSort(col.accessorKey as string, col.sortable)
                  }
                  className={`px-6 py-4 font-bold ${
                    col.sortable
                      ? "cursor-pointer hover:bg-divider/20 select-none transition-colors"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && state.sortBy === col.accessorKey && (
                      <span className="text-primary-main">
                        {state.sortOrder === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                    {col.sortable && state.sortBy !== col.accessorKey && (
                      <span className="text-text-disabled opacity-40">
                        <ArrowDownUp className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>

            {/* Baris 2: Filter per Kolom (Dikembalikan ke sini) */}
            <tr className="border-t border-divider bg-divider/10">
              {columns.map((col, idx) => (
                <th
                  key={`filter-${idx}`}
                  className="px-3 py-2 font-normal align-top min-w-48"
                >
                  {col.filterType === "text" && (
                    <Input
                      type="text"
                      placeholder={`Saring...`}
                      value={localFilters[col.accessorKey as string] || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          col.accessorKey as string,
                          e.target.value,
                        )
                      }
                      size="sm"
                    />
                  )}
                  {col.filterType === "faceted" && col.filterOptions && (
                    <FacetedFilter
                      title={col.header}
                      options={col.filterOptions}
                      currentValue={
                        localFilters[col.accessorKey as string] || ""
                      }
                      onChange={(val) =>
                        handleFilterChange(col.accessorKey as string, val)
                      }
                    />
                  )}
                  {col.filterType === "date-range" && (
                    <DateRangeFilter
                      title="Rentang"
                      currentValue={
                        localFilters[col.accessorKey as string] || ""
                      }
                      onChange={(val) =>
                        handleFilterChange(col.accessorKey as string, val)
                      }
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-divider">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-text-secondary"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="w-6 h-6 border-2 border-primary-main border-t-transparent rounded-full animate-spin"></span>
                    <span className="text-sm font-medium animate-pulse">
                      Memuat data...
                    </span>
                  </div>
                </td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-text-secondary"
                >
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            ) : (
              data?.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-divider/10 transition-colors group"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap text-text-primary"
                    >
                      {col.cell
                        ? col.cell(row)
                        : ((row[
                            col.accessorKey as keyof T
                          ] as React.ReactNode) ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- AREA PAGINASI RESPONSIVE --- */}
      {meta && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-t border-divider bg-bg-paper">
          <div className="text-sm text-text-secondary text-center md:text-left">
            Menampilkan{" "}
            <span className="font-bold text-text-primary">
              {(meta.page - 1) * meta.limit + 1}
            </span>{" "}
            hingga{" "}
            <span className="font-bold text-text-primary">
              {Math.min(meta.page * meta.limit, meta.total)}
            </span>{" "}
            dari{" "}
            <span className="font-bold text-text-primary">{meta.total}</span>{" "}
            entitas
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <IconButton
              disabled={meta.page <= 1}
              variant="outlined"
              size="sm"
              onClick={() =>
                emitCleanState({ ...state, page: (state.page || 1) - 1 })
              }
            >
              <ChevronLeft className="w-4 h-4" />
            </IconButton>

            {/* Desktop Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {generatePagination(meta.page, meta.totalPages).map(
                (pageNum, idx) => {
                  if (pageNum === "...") {
                    return (
                      <div
                        key={`ellipsis-${idx}`}
                        className="px-2 text-text-disabled"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </div>
                    );
                  }
                  const isActive = pageNum === meta.page;
                  return (
                    <button
                      key={`page-${pageNum}`}
                      onClick={() =>
                        emitCleanState({ ...state, page: pageNum as number })
                      }
                      className={`min-w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary-main text-white"
                          : "text-text-secondary hover:bg-divider/20 hover:text-text-primary"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                },
              )}
            </div>

            {/* Mobile Page Indicator (Hanya muncul di layar HP) */}
            <div className="flex sm:hidden items-center justify-center px-4 text-sm font-medium text-text-primary">
              {meta.page} / {meta.totalPages}
            </div>

            <IconButton
              disabled={meta.page >= meta.totalPages}
              variant="outlined"
              size="sm"
              onClick={() =>
                emitCleanState({ ...state, page: (state.page || 1) + 1 })
              }
            >
              <ChevronRight className="w-4 h-4" />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
}
