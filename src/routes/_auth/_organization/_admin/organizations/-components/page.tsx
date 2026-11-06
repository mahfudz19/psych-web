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
import PageHeader from "../../../../../../components/reusebale-components/PageHeader";
import Chip from "../../../../../../components/ui/Chip";

function OrganizationsPage() {
  const tableState = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data, isLoading, isFetching } = useGetOrganizations(tableState);

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
        <Chip color={row.status ? "success" : "error"}>
          {row.status ? "Aktif" : "Nonaktif"}
        </Chip>
      ),
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
      <PageHeader
        title="Manajemen Oragnisation"
        subtitle="Kelola akses, profil, dan status organisasi platform."
        breadcrumbs={["Manajemen Oragnisation"]}
      />

      <DataTable<Organization>
        columns={columns}
        data={data?.data}
        meta={data?.meta}
        isLoading={isLoading || isFetching}
        state={{
          ...tableState,
          sortBy: tableState.sortBy || "createdAt",
          sortOrder: tableState.sortOrder || "desc",
        }}
        onStateChange={handleStateChange}
      />
    </>
  );
}

export default OrganizationsPage;
