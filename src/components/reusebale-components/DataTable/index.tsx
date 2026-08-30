import { ChevronLeft, ChevronRight } from "lucide-react";
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

  const fields = filterStr.split(";"); //[cite: 12]
  fields.forEach((field) => {
    const firstColonIdx = field.indexOf(":"); //[cite: 12]
    if (firstColonIdx === -1) return; //[cite: 12]

    const key = field.slice(0, firstColonIdx); //[cite: 12]
    let value = field.slice(firstColonIdx + 1); //[cite: 12]

    // Penanganan untuk "in:" (Faceted)[cite: 12]
    if (value.startsWith("in:")) {
      value = value.slice(3);
    }
    // Penanganan untuk "between:" (Date Range)
    else if (value.startsWith("between:")) {
      value = value.slice(8);
    }
    result[key] = value; //[cite: 12]
  });
  return result; //[cite: 12]
};

const buildFilterString = (
  filters: Record<string, string>,
): string | undefined => {
  const parts: string[] = []; //[cite: 12]
  Object.entries(filters).forEach(([key, val]) => {
    //[cite: 12]
    if (!val) return; //[cite: 12]

    // Jika formatnya adalah tanggal rentang (YYYY-MM-DD,YYYY-MM-DD)
    if (
      val.match(/^\d{4}-\d{2}-\d{2},?\d{4}-\d{2}-\d{2}?$/) ||
      val.match(/^,\d{4}-\d{2}-\d{2}$/) ||
      val.match(/^\d{4}-\d{2}-\d{2},$/)
    ) {
      parts.push(`${key}:between:${val}`);
    }
    // Jika value memiliki koma (karena multi-select dari faceted)[cite: 12]
    else if (val.includes(",")) {
      parts.push(`${key}:in:${val}`); //[cite: 12]
    }
    // Filter teks biasa[cite: 12]
    else {
      parts.push(`${key}:${val}`); //[cite: 12]
    }
  });
  return parts.length > 0 ? parts.join(";") : undefined; //[cite: 12]
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
    //[cite: 12]
    const cleanState: UserListParams = {
      //[cite: 12]
      ...newState, //[cite: 12]
      search: newState.search === "" ? undefined : newState.search, //[cite: 12]
      sortBy: newState.sortBy === "" ? undefined : newState.sortBy, //[cite: 12]
      sortOrder: newState.sortOrder === "" ? undefined : newState.sortOrder, //[cite: 12]
      filter: newState.filter === "" ? undefined : newState.filter, //[cite: 12]
    }; //[cite: 12]
    onStateChange(cleanState); //[cite: 12]
  }; //[cite: 12]

  useEffect(() => {
    //[cite: 12]
    const timer = setTimeout(() => {
      //[cite: 12]
      if (searchInput !== (state.search || "")) {
        //[cite: 12]
        emitCleanState({ ...state, search: searchInput, page: 1 }); //[cite: 12]
      } //[cite: 12]
    }, 500); //[cite: 12]
    return () => clearTimeout(timer); //[cite: 12]
  }, [searchInput, state]); //[cite: 12]

  useEffect(() => {
    //[cite: 12]
    const timer = setTimeout(() => {
      //[cite: 12]
      const currentFilterStr = state.filter || ""; //[cite: 12]
      const newFilterStr = buildFilterString(localFilters) || ""; //[cite: 12]

      if (currentFilterStr !== newFilterStr) {
        //[cite: 12]
        emitCleanState({ ...state, filter: newFilterStr, page: 1 }); //[cite: 12]
      } //[cite: 12]
    }, 500); //[cite: 12]
    return () => clearTimeout(timer); //[cite: 12]
  }, [localFilters, state]); //[cite: 12]

  const handleSort = (accessorKey: string, isSortable?: boolean) => {
    //[cite: 12]
    if (!isSortable) return; //[cite: 12]
    let newOrder: "asc" | "desc" = "asc"; //[cite: 12]
    if (state.sortBy === accessorKey) {
      //[cite: 12]
      newOrder = state.sortOrder === "asc" ? "desc" : "asc"; //[cite: 12]
    } //[cite: 12]
    emitCleanState({
      //[cite: 12]
      ...state, //[cite: 12]
      sortBy: accessorKey, //[cite: 12]
      sortOrder: newOrder, //[cite: 12]
      page: 1, //[cite: 12]
    }); //[cite: 12]
  }; //[cite: 12]

  const handleFilterChange = (key: string, value: string) => {
    //[cite: 12]
    setLocalFilters((prev) => ({ ...prev, [key]: value })); //[cite: 12]
  }; //[cite: 12]

  return (
    <div className="flex flex-col gap-4 w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <Input
          type="text"
          placeholder="Cari global..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <div className="flex items-center gap-2 text-sm text-gray-600">
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
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none"
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs border-b border-gray-200">
            <tr className="uppercase">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() =>
                    handleSort(col.accessorKey as string, col.sortable)
                  }
                  className={`px-6 py-3 font-semibold tracking-wider ${col.sortable ? "cursor-pointer hover:bg-gray-100 select-none" : ""}`}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && state.sortBy === col.accessorKey && (
                      <span className="text-primary-main text-xs">
                        {state.sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}{" "}
                    {col.sortable && state.sortBy !== col.accessorKey && (
                      <span className="text-gray-300 text-xs">↕</span>
                    )}{" "}
                  </div>{" "}
                </th>
              ))}{" "}
            </tr>

            <tr className="border-t border-gray-100 bg-gray-50/50">
              {columns.map((col, idx) => (
                <th
                  key={`filter-${idx}`}
                  className="px-3 py-2 font-normal align-top"
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
                      className="w-full text-xs py-1 h-7.5"
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
                  {/* TAMPILKAN FILTER TANGGAL */}
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

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  <span className="animate-pulse">Memuat data...</span>
                </td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            ) : (
              data?.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
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

      {meta && (
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Menampilkan{" "}
            <span className="font-medium">
              {(meta.page - 1) * meta.limit + 1}
            </span>{" "}
            hingga{" "}
            <span className="font-medium">
              {Math.min(meta.page * meta.limit, meta.total)}
            </span>{" "}
            dari <span className="font-medium">{meta.total}</span> entitas
          </div>

          <div className="flex gap-2">
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
