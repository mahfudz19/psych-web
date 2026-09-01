import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { MembersListParams } from "../../../../types";
import { authStore } from "../../../../utils/authStore";
import { useMembersListQuery } from "./-api/organization.query";
import ModalInvite from "./-components/ModalInvite";
import ModalKickMember from "./-components/ModalKickMember";

export const Route = createFileRoute("/_auth/_organization/members/")({
  component: OrganizationMembersPage,
});

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}

function getRoleBadgeClass(organizationRole?: string) {
  switch (organizationRole?.toLowerCase()) {
    case "owner":
      return "bg-warning-main/10 text-warning-main";
    case "admin":
      return "bg-info-main/10 text-info-main";
    default:
      return "bg-divider text-text-secondary";
  }
}

function OrganizationMembersPage() {
  const { t } = useTranslation();
  const { user } = authStore.get();
  const orgId = user?.organizationId;

  // State untuk pagination, search, dan sort
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] =
    useState<MembersListParams["sortBy"]>("createdAt");
  const [sortOrder, setSortOrder] =
    useState<MembersListParams["sortOrder"]>("desc");

  // Query parameters untuk API
  const queryParams: MembersListParams = useMemo(
    () => ({
      page: pagination.page,
      limit: pagination.limit,
      search: search || undefined,
      sortBy,
      sortOrder,
    }),
    [pagination, search, sortBy, sortOrder],
  );

  const { data, isLoading, isError } = useMembersListQuery(
    orgId || "",
    queryParams,
  );

  const members = data?.data || [];
  const meta = data?.meta;

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination({ page: 1, limit: newLimit });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset ke halaman 1 saat search
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center text-text-secondary">
        {t("common.processing")}
      </div>
    );
  }

  // Error state
  if (isError || !orgId) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center text-error-main">
        {t("organization.members.loadError")}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-divider">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            {t("organization.members.title")}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t("organization.members.subtitle")}
          </p>
        </div>
        <ModalInvite />
      </div>

      {/* Search dan Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled"
            size={16}
          />
          <input
            type="text"
            placeholder={t("organization.members.searchPlaceholder")}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-divider bg-bg-default text-text-primary focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm"
          >
            <option value="fullName">
              {t("organization.members.sortByName")}
            </option>
            <option value="email">
              {t("organization.members.sortByEmail")}
            </option>
            <option value="role">{t("organization.members.sortByRole")}</option>
            <option value="joinedAt">
              {t("organization.members.sortByJoinedAt")}
            </option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-divider bg-bg-default text-text-primary focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm"
          >
            <option value="asc">{t("common.sort.asc")}</option>
            <option value="desc">{t("common.sort.desc")}</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-bg-paper border border-divider rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-divider bg-divider/5 font-bold text-text-secondary uppercase tracking-wider text-xs">
                <th className="p-4 px-6">
                  {t("organization.members.table.memberInfo")}
                </th>
                <th className="p-4 px-6">
                  {t("organization.members.table.role")}
                </th>
                <th className="p-4 px-6">
                  {t("organization.members.table.joinedAt")}
                </th>
                <th className="p-4 px-6 text-right">
                  {t("organization.members.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-divider/5 transition-colors"
                >
                  {/* Kolom Profil */}
                  <td className="p-4 px-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-main/10 text-primary-main flex items-center justify-center font-bold uppercase shadow-sm">
                      {getInitials(member.fullName)}
                    </div>
                    <div>
                      <p className="font-bold text-text-primary">
                        {member.fullName}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {member.email}
                      </p>
                    </div>
                  </td>

                  {/* Kolom Role */}
                  <td className="p-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeClass(member.organizationRole)}`}
                    >
                      {member.organizationRole}
                    </span>
                  </td>

                  {/* Kolom Tanggal Bergabung */}
                  <td className="p-4 px-6 text-text-secondary text-xs font-medium">
                    {formatDate(member.joinedAt)}
                  </td>

                  {/* Kolom Aksi */}
                  <td className="p-4 px-6 text-right">
                    <ModalKickMember
                      orgId={orgId}
                      member={member}
                      key={`kick-member-${member.id}`}
                    />
                  </td>
                </tr>
              ))}

              {members.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-text-secondary"
                  >
                    {search
                      ? t("organization.members.noResults")
                      : t("organization.members.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-divider bg-bg-default">
            {/* Info */}
            <div className="text-xs text-text-secondary">
              {t("organization.members.pagination.info", {
                from: (meta.page - 1) * meta.limit + 1,
                to: Math.min(meta.page * meta.limit, meta.total),
                total: meta.total,
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Limit Selector */}
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="px-2 py-1.5 rounded-lg border border-divider bg-bg-default text-text-primary focus:outline-none focus:border-primary-main text-xs"
              >
                <option value={10}>10 / {t("common.page")}</option>
                <option value={25}>25 / {t("common.page")}</option>
                <option value={50}>50 / {t("common.page")}</option>
              </select>

              {/* Page Navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page === 1}
                  className="p-1.5 rounded-lg hover:bg-divider/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="px-3 py-1 text-xs font-medium text-text-primary">
                  {meta.page} / {meta.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page === meta.totalPages}
                  className="p-1.5 rounded-lg hover:bg-divider/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
