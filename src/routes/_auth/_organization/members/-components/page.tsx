import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useMembersListQuery } from "../-api/organization.query";
import ModalInvite from "../-components/ModalInvite";
import ModalKickMember from "../-components/ModalKickMember";
import {
  DataTable,
  type BaseListParams,
  type ColumnDef,
} from "../../../../../components/reusebale-components/DataTable";
import type { OrganizationMember } from "../../../../../types";
import { useAuthStore } from "../../../../../utils/authStore";
import { Route } from "../index";
import ModalMemberDetail from "./ModalMemberDetail";
import Chip from "../../../../../components/ui/Chip";

function getRoleBadgeClass(organizationRole?: string) {
  switch (organizationRole?.toLowerCase()) {
    case "owner":
      return "warning" as const;
    case "admin":
      return "info" as const;
    default:
      return "neutral" as const;
  }
}

function OrganizationMembersPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const orgId = user?.organizationId;

  const tableState = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const handleStateChange = (newState: BaseListParams) => {
    navigate({
      search: (prev) => {
        const nextSearch = { ...prev, ...newState };
        return nextSearch;
      },
      replace: true,
    });
  };

  const { data, isLoading, isFetching } = useMembersListQuery(
    orgId || "",
    tableState,
  );

  const columns: ColumnDef<OrganizationMember>[] = [
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
      header: "Peran",
      accessorKey: "organizationRole",
      sortable: true,
      filterType: "faceted",
      filterOptions: [
        { label: "Owner", value: "owner" },
        { label: "Admin", value: "admin" },
        { label: "Member", value: "member" },
      ],
      cell: (row) => (
        <Chip color={getRoleBadgeClass(row.organizationRole)}>
          {row.organizationRole}
        </Chip>
      ),
    },
    {
      header: "Bergabung",
      accessorKey: "joinedAt",
      sortable: true,
      filterType: "date-range",
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
      className: "w-4 text-right",
      cell: (row) =>
        orgId && (
          <span className="inline-flex items-center justify-end gap-1">
            <ModalKickMember
              orgId={orgId}
              member={row}
              key={`kick-member-${row.id}`}
            />
            <ModalMemberDetail
              orgId={orgId}
              member={row}
              key={`member-detail-${row.id}`}
            />
          </span>
        ),
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl font-bold">
            {t("organization.members.title")}
          </h1>
          <p className="text-sm">{t("organization.members.subtitle")}</p>
        </div>
        <div>
          <ModalInvite />
        </div>
      </div>

      <DataTable<OrganizationMember>
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

export default OrganizationMembersPage;
