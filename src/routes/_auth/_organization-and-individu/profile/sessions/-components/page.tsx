import { useNavigate } from "@tanstack/react-router";
import { Laptop, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetSessions } from "../-api/sessions.query";
import {
  DataTable,
  type BaseListParams,
  type ColumnDef,
} from "../../../../../../components/reusebale-components/DataTable";
import type { Session } from "../../../../../../types/user";
import { Route } from "../index";
import Revoke from "./Revoke";
import Chip from "../../../../../../components/ui/Chip";

function SessionPage() {
  const { t } = useTranslation();
  const tableState = Route.useSearch();

  const navigate = useNavigate({ from: Route.fullPath });
  const { data: response, isLoading, isFetching } = useGetSessions(tableState);

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
      header: t("profile.sessions.columns.device"),
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
                  {row.deviceInfo?.os || t("profile.sessions.unknownDevice")} •{" "}
                  {row.deviceInfo?.browser || "Browser"}
                </p>
                {row.isCurrentSession && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-main/10 text-success-main border border-success-main/20">
                    {t("profile.sessions.currentSession")}
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
      header: t("profile.sessions.columns.locationIp"),
      accessorKey: "ip",
      filterType: "text",
      cell: (row) => (
        <div>
          <p className="font-mono text-xs text-text-primary">
            {row.deviceInfo?.ip || "-"}
          </p>
          <p className="text-xs text-text-secondary">
            {row.deviceInfo?.location || t("profile.sessions.unknownLocation")}
          </p>
        </div>
      ),
    },
    {
      header: t("profile.sessions.columns.lastActive"),
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
      header: t("profile.sessions.columns.status"),
      accessorKey: "status",
      filterType: "faceted",
      filterOptions: [
        { value: "active", label: "Active" },
        { value: "revoked", label: "Revoked" },
        { value: "expired", label: "Expired" },
        { value: "rotated", label: "Rotated" },
      ],
      cell: (row) => (
        <Chip
          color={
            row.status === "active"
              ? "success"
              : row.status === "revoked"
                ? "error"
                : row.status === "expired"
                  ? "warning"
                  : "default"
          }
        >
          {row.status}
        </Chip>
      ),
    },
    {
      header: "",
      accessorKey: "actions",
      className: "w-4 text-right px-4",
      cell: (row) => !row.isCurrentSession && <Revoke data={row} />,
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("profile.sessions.title")}</h1>
        <p className="text-sm">{t("profile.sessions.subtitle")}</p>
      </div>

      <DataTable<Session>
        columns={columns}
        data={response?.data || []}
        meta={response?.meta}
        isLoading={isLoading || isFetching}
        state={{
          ...tableState,
          sortBy: tableState.sortBy || "lastActive",
          sortOrder: tableState.sortOrder || "desc",
        }}
        onStateChange={handleStateChange}
      />
    </>
  );
}

export default SessionPage;
