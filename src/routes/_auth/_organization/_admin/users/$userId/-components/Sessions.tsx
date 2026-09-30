import { useState } from "react";
import { Laptop, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DataTable,
  type BaseListParams,
  type ColumnDef,
} from "../../../../../../../components/reusebale-components/DataTable";
import { useSessionsByUserIdQuery } from "../../-api/user.query";
import type { Session } from "../../../../../../../types/user";

function Sessions({ userId }: { userId: string }) {
  const { t } = useTranslation();

  const [tableState, setTableState] = useState<BaseListParams>({
    page: 1,
    limit: 10,
  });

  const {
    data: response,
    isLoading,
    isFetching,
  } = useSessionsByUserIdQuery(userId, tableState);

  const columns: ColumnDef<Session>[] = [
    {
      header: t("profile.sessions.columns.device", "Perangkat"),
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
                  {row.deviceInfo?.os ||
                    t(
                      "profile.sessions.unknownDevice",
                      "Perangkat Tidak Diketahui",
                    )}{" "}
                  • {row.deviceInfo?.browser || "Browser"}
                </p>
                {row.isCurrentSession && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-main/10 text-success-main border border-success-main/20">
                    {t("profile.sessions.currentSession", "Perangkat Ini")}
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
      header: t("profile.sessions.columns.locationIp", "Lokasi & IP"),
      accessorKey: "ip",
      filterType: "text",
      cell: (row) => (
        <div>
          <p className="font-mono text-xs text-text-primary">
            {row.deviceInfo?.ip || "-"}
          </p>
          <p className="text-xs text-text-secondary">
            {row.deviceInfo?.location ||
              t("profile.sessions.unknownLocation", "Lokasi Tidak Diketahui")}
          </p>
        </div>
      ),
    },
    {
      header: t("profile.sessions.columns.lastActive", "Terakhir Aktif"),
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
      header: t("profile.sessions.columns.status", "Status"),
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
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div>
        <h3 className="text-base font-bold text-text-primary">
          Sesi Perangkat Aktif
        </h3>
        <p className="text-xs text-text-secondary">
          Daftar perangkat yang terhubung ke akun ini.
        </p>
      </div>

      <DataTable<Session, BaseListParams>
        columns={columns}
        data={response?.data || []}
        meta={response?.meta}
        isLoading={isLoading || isFetching}
        state={tableState}
        onStateChange={setTableState}
      />
    </div>
  );
}

export default Sessions;
