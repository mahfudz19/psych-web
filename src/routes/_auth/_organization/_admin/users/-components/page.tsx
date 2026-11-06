import { Link, useNavigate } from "@tanstack/react-router";
import { useGetUsers } from "../-api/user.query";
import type { Users } from "../-api/user.type";
import {
  DataTable,
  type BaseListParams,
  type ColumnDef,
} from "../../../../../../components/reusebale-components/DataTable";
import { Route } from "../index";
import IconButton from "../../../../../../components/ui/IconButton";
import { Eye } from "lucide-react";
import PageHeader from "../../../../../../components/reusebale-components/PageHeader";
import Chip from "../../../../../../components/ui/Chip";

function UsersPage() {
  const tableState = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data, isLoading, isFetching } = useGetUsers(tableState);

  const handleStateChange = (newState: BaseListParams) => {
    navigate({
      search: (prev) => {
        const nextSearch = { ...prev, ...newState };
        return nextSearch;
      },
      replace: true,
    });
  };

  const columns: ColumnDef<Users>[] = [
    {
      header: "Nama Lengkap",
      accessorKey: "fullName",
      sortable: true,
      filterType: "text",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.fullName}</p>
          <p className="text-xs">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Tipe Akun",
      accessorKey: "accountType",
      sortable: true,
      filterType: "faceted",
      filterOptions: [
        { label: "Individual", value: "INDIVIDUAL" },
        { label: "Organisasi", value: "ORGANIZATION" },
      ],
      cell: (row) => (
        <Chip color={row.accountType === "INDIVIDUAL" ? "info" : "warning"}>
          {row.accountType}
        </Chip>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      filterType: "faceted",
      filterOptions: [
        { label: "Active", value: "ACTIVE" },
        { label: "Pending", value: "PENDING" },
        { label: "Suspended", value: "SUSPENDED" },
      ],
      cell: (row) => {
        const isOpt = row.status === "ACTIVE";
        return <Chip color={isOpt ? "success" : "error"}>{row.status}</Chip>;
      },
    },
    {
      header: "Kode Referral",
      accessorKey: "referralCode",
      sortable: false,
    },
    {
      header: "Tanggal Daftar",
      accessorKey: "createdAt",
      filterType: "date-range",
      sortable: true,
      cell: (row) =>
        new Date(row.createdAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      header: "",
      accessorKey: "actions",
      className: "w-4 text-right px-4",
      cell: (row) => (
        <Link to={`${row.id}`}>
          <IconButton variant="text" size="sm" color="info">
            <Eye size={16} />
          </IconButton>
        </Link>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Manajemen Pengguna"
        subtitle="Kelola akses, profil, dan status anggota platform."
        breadcrumbs={["Manajemen Pengguna"]}
      />

      <DataTable<Users>
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

export default UsersPage;
