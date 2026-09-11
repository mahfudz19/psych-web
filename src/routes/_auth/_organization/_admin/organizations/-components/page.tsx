import { useNavigate } from "@tanstack/react-router";
import { useGetOrganizations } from "../../../-api/organization.query";
import {
  DataTable,
  type BaseListParams,
  type ColumnDef,
} from "../../../../../../components/reusebale-components/DataTable";
import type { Organization } from "../../../../../../types";
import { Route } from "../index";
import DetailOrganization from "./DetailOrganization";

function OrganizationsPage() {
  const tableState = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const {
    data: response,
    isLoading,
    isFetching,
  } = useGetOrganizations(tableState);

  const handleStateChange = (newState: BaseListParams) => {
    navigate({
      search: (prev) => {
        const nextSearch = { ...prev, ...newState };
        return nextSearch;
      },
      replace: true,
    });
  };

  const columns: ColumnDef<Organization>[] = [
    {
      header: "Organisasi",
      accessorKey: "name",
      sortable: true,
      filterType: "text",
      cell: (row) => (
        <div>
          <p className="font-medium text-text-primary">{row.name}</p>
          <p className="text-xs text-text-secondary">{row.email || "-"}</p>
        </div>
      ),
    },
    {
      header: "Plan",
      accessorKey: "plan",
      sortable: true,
      filterType: "faceted",
      filterOptions: [
        { label: "Free Trial", value: "free_trial" },
        { label: "Free", value: "free" },
        { label: "Premium", value: "premium" },
        { label: "Enterprise", value: "enterprise" },
      ],
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      filterType: "faceted",
      filterOptions: [
        { label: "Aktif", value: "true" },
        { label: "Nonaktif", value: "false" },
      ],
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${row.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {row.status ? "Aktif" : "Nonaktif"}
        </span>
      ),
    },
    {
      header: "Seats",
      accessorKey: "seats",
      cell: (row) => `${row.seatsUsed} / ${row.seats}`,
    },
    {
      header: "Tanggal Dibuat",
      accessorKey: "createdAt",
      sortable: true,
      filterType: "date-range",
      cell: (row) => new Date(row.createdAt).toLocaleDateString("id-ID"),
    },
    {
      header: "",
      accessorKey: "actions",
      className: "w-4 text-right px-4",
      cell: (row) => (
        <DetailOrganization id={row.id} key={`detail-${row.id}`} />
      ),
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manajemen Oragnisation</h1>
        <p className="text-sm">
          Kelola akses, profil, dan status anggota platform.
        </p>
      </div>

      <DataTable<Organization, BaseListParams>
        columns={columns}
        data={response?.data || []}
        meta={response?.meta}
        isLoading={isLoading || isFetching}
        state={tableState}
        onStateChange={handleStateChange}
      />
    </>
  );
}

export default OrganizationsPage;
