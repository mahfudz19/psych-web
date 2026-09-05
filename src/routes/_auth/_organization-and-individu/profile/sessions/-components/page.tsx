import { useNavigate } from "@tanstack/react-router";
import {
  useGetSessions,
  useRevokeSessionMutation,
} from "../-api/sessions.query";
import { Route } from "../index";
import {
  DataTable,
  type BaseListParams,
  type ColumnDef,
} from "../../../../../../components/reusebale-components/DataTable";
import type { Session } from "../../../../../../types/user";
import IconButton from "../../../../../../components/ui/IconButton";
import { Laptop, LogOut, Smartphone } from "lucide-react";

function SessionPage() {
  const tableState = Route.useSearch();

  const navigate = useNavigate({ from: Route.fullPath });
  const { data: response, isLoading, isFetching } = useGetSessions(tableState);

  const revokeMutation = useRevokeSessionMutation();
  const handleStateChange = (newState: BaseListParams) => {
    navigate({
      search: (prev) => {
        const nextSearch = { ...prev, ...newState };
        return nextSearch;
      },
      replace: true,
    });
  };

  const columns: ColumnDef<Session>[] = [
    {
      header: "Perangkat & Browser",
      accessorKey: "deviceInfo",
      filterType: "text",
      cell: (row) => {
        const isMobile =
          row.deviceInfo?.os?.toLowerCase().includes("android") ||
          row.deviceInfo?.os?.toLowerCase().includes("ios");
        const Icon = isMobile ? Smartphone : Laptop;

        return (
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-text-secondary shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-text-primary">
                  {row.deviceInfo?.os || "Perangkat Tidak Dikenal"} •{" "}
                  {row.deviceInfo?.browser || "Browser"}
                </p>
                {row.isCurrentSession && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-main/10 text-success-main border border-success-main/20">
                    Sesi Ini
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary">
                {row.deviceInfo?.browserVersion
                  ? `v${row.deviceInfo.browserVersion}`
                  : ""}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Lokasi & IP",
      accessorKey: "ip",
      filterType: "text",
      cell: (row) => (
        <div>
          <p className="font-mono text-xs text-text-primary">
            {row.deviceInfo?.ip || "-"}
          </p>
          <p className="text-xs text-text-secondary">
            {row.deviceInfo?.location || "Lokasi tidak diketahui"}
          </p>
        </div>
      ),
    },
    {
      header: "Terakhir Aktif",
      accessorKey: "lastActive",
      sortable: true,
      filterType: "date-range",
      cell: (row) => (
        <p className="text-xs">
          {row.lastActive
            ? new Date(row.lastActive).toLocaleString("id-ID")
            : "-"}
        </p>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      filterType: "faceted",
      filterOptions: [
        { value: "active", label: "Active" },
        { value: "revoked", label: "Revoked" },
        { value: "expired", label: "Expired" },
        { value: "rotated", label: "Rotated" },
      ],
      cell: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
            row.status === "active"
              ? "bg-success-main/10 text-success-main"
              : "bg-divider text-text-secondary"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "",
      accessorKey: "actions",
      className: "w-4 text-right px-4",
      cell: (row) =>
        !row.isCurrentSession && (
          <IconButton
            size="sm"
            variant="text"
            color="error"
            title="Akhiri Sesi"
            loading={
              revokeMutation.isPending &&
              revokeMutation.variables?.[0] === row.id
            }
            onClick={() => revokeMutation.mutate(row.id)}
          >
            <LogOut className="w-4 h-4" />
          </IconButton>
        ),
    },
  ];
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
        <p className="text-sm">
          Kelola akses, profil, dan status anggota platform.
        </p>
      </div>

      <DataTable<Session, BaseListParams>
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

export default SessionPage;
