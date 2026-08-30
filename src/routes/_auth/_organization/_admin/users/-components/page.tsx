import { useUsersQuery } from "../-api/user.query";
import { Route } from "../index";
import { useNavigate } from "@tanstack/react-router";
import {
  DataTable,
  type ColumnDef,
} from "../../../../../../components/reusebale-components/DataTable";
import type { Users } from "../-api/user.type";
import type { UserListParams } from "../-api/user.api";

function UsersPage() {
  const tableState = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: response, isLoading, isFetching } = useUsersQuery(tableState);

  const handleStateChange = (newState: UserListParams) => {
    navigate({
      search: (prev) => {
        const nextSearch = { ...prev, ...newState };
        return nextSearch;
      },
      replace: true,
    });
  };

  const userColumns: ColumnDef<Users>[] = [
    {
      header: "Nama Lengkap",
      accessorKey: "fullName",
      sortable: true,
      filterType: "text",
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.fullName}</p>
          <p className="text-xs text-gray-500">{row.email}</p>
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
        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
          {row.accountType}
        </span>
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
        return (
          <span
            className={`px-2 py-1 text-xs rounded-full border ${isOpt ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"}`}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      header: "Kode Referral",
      accessorKey: "referralCode",
      sortable: false,
      // Tanpa filterType, cell header bawah akan kosong
    },
    {
      header: "Tanggal Daftar",
      accessorKey: "createdAt",
      sortable: true,
      cell: (row) =>
        new Date(row.createdAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <p className="text-sm text-gray-500">
          Kelola akses, profil, dan status anggota platform.
        </p>
      </div>

      <DataTable<Users>
        columns={userColumns}
        data={response?.data || []}
        meta={response?.meta}
        isLoading={isLoading || isFetching}
        state={tableState}
        onStateChange={handleStateChange}
      />
    </div>
  );
}

export default UsersPage;
