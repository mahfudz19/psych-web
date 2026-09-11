import { Calendar, Eye, Mail, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { useMemberByIdQuery } from "../-api/organization.query";
import { useChangeRoleOrganization } from "../../-api/organization.query";
import Dialog from "../../../../../components/ui/Dialog";
import IconButton from "../../../../../components/ui/IconButton";
import type { OrganizationMember } from "../../../../../types";
import { useAuthStore } from "../../../../../utils/authStore";

interface Props {
  orgId: string;
  member: OrganizationMember;
}

function getRoleBadge(role?: string) {
  switch (role?.toLowerCase()) {
    case "owner":
      return "bg-warning-main/10 text-warning-main border-warning-main/20";
    case "admin":
      return "bg-info-main/10 text-info-main border-info-main/20";
    default:
      return "bg-primary-main/10 text-primary-main border-primary-main/20";
  }
}

function getStatusBadge(status?: string) {
  const isOk = status?.toLowerCase() === "active";
  return isOk
    ? "bg-success-main/10 text-success-main border-success-main/20"
    : "bg-error-main/10 text-error-main border-error-main/20";
}

interface ChangeRoleProps {
  orgId: string;
  memberId: string;
  currentRole?: "owner" | "admin" | "member";
}

function ChangeRole({
  orgId,
  memberId,
  currentRole = "member",
}: ChangeRoleProps) {
  const { user } = useAuthStore();
  const { mutate, isPending } = useChangeRoleOrganization(orgId);

  if (currentRole === "owner" || user?.id === memberId) return null;

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as "member" | "admin";
    if (role === currentRole) return;
    mutate({ memberId, role });
  };

  return (
    <div className="flex items-center justify-between gap-2 p-3 rounded-xl border border-divider bg-divider/5 mt-2">
      <div className="text-left">
        <p className="text-xs font-semibold text-text-primary">Peran Anggota</p>
        <p className="text-[11px] text-text-secondary">
          Ubah tingkat hak akses
        </p>
      </div>

      <div className="relative shrink-0">
        <select
          value={currentRole}
          disabled={isPending}
          onChange={handleChange}
          className="appearance-none bg-bg-paper border border-divider rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium text-text-primary focus:outline-none focus:border-primary-main disabled:opacity-50 cursor-pointer"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>

        {isPending ? (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-primary-main border-t-transparent rounded-full animate-spin pointer-events-none" />
        ) : (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-[9px]">
            ▼
          </span>
        )}
      </div>
    </div>
  );
}

function ContentDetail({ member, orgId }: Props) {
  const { data, isLoading } = useMemberByIdQuery(orgId, member.id || "");
  const detail = data?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <span className="w-8 h-8 border-4 border-primary-main border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-text-secondary animate-pulse">
          Memuat detail pengguna...
        </span>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-10 text-text-secondary">
        Pengguna tidak ditemukan.
      </div>
    );
  }

  const initials = (detail.fullName || "M").charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        {detail.profilePicture ? (
          <img
            src={detail.profilePicture}
            alt={detail.fullName}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary-main/20 mb-2 shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary-main/10 text-primary-main font-bold text-2xl flex items-center justify-center border-2 border-primary-main/20 mb-2 shadow-sm">
            {initials}
          </div>
        )}

        <h2 className="text-base font-bold text-text-primary">
          {detail.fullName}
        </h2>
        <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5 mb-2">
          <Mail size={12} />
          {detail.email}
        </p>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadge(detail.organizationRole)}`}
          >
            {detail.organizationRole}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(detail.status)}`}
          >
            {detail.status}
          </span>
        </div>
      </div>

      {/* Detail Fields */}
      <div className="grid grid-cols-1 gap-2 text-xs border-t border-divider pt-3">
        {detail.phone && (
          <div className="flex justify-between py-1 border-b border-divider/50">
            <span className="text-text-secondary">Telepon</span>
            <span className="font-medium text-text-primary">
              {detail.phone}
            </span>
          </div>
        )}
        {detail.gender && (
          <div className="flex justify-between py-1 border-b border-divider/50">
            <span className="text-text-secondary">Gender</span>
            <span className="font-medium text-text-primary capitalize">
              {detail.gender}
            </span>
          </div>
        )}
        {detail.lastLoginAt && (
          <div className="flex justify-between py-1 border-b border-divider/50">
            <span className="text-text-secondary">Login Terakhir</span>
            <span className="font-medium text-text-primary">
              {new Date(detail.lastLoginAt).toLocaleDateString("id-ID")}
            </span>
          </div>
        )}
        <div className="flex justify-between py-1">
          <span className="text-text-secondary flex items-center gap-1">
            <Calendar size={12} /> Bergabung
          </span>
          <span className="font-medium text-text-primary">
            {new Date(detail.createdAt).toLocaleDateString("id-ID")}
          </span>
        </div>
      </div>

      {detail.bio && (
        <p className="text-xs text-text-secondary bg-divider/10 p-2.5 rounded-lg italic text-center">
          "{detail.bio}"
        </p>
      )}

      <ChangeRole
        orgId={orgId}
        memberId={member.id}
        currentRole={member.organizationRole}
      />
    </div>
  );
}

export default function ModalMemberDetail(props: Props) {
  return (
    <Dialog
      className="text-left max-w-sm"
      trigger={(openDialog) => (
        <IconButton
          variant="text"
          color="primary"
          onClick={openDialog}
          size="sm"
          title="Detail Anggota"
        >
          <Eye size={15} />
        </IconButton>
      )}
      scroll="paper"
    >
      {(closeDialog) => (
        <>
          <IconButton
            size="sm"
            variant="text"
            color="error"
            className="absolute top-4 right-4"
            onClick={() => closeDialog()}
          >
            <X size={18} />
          </IconButton>

          <ContentDetail {...props} />
        </>
      )}
    </Dialog>
  );
}
