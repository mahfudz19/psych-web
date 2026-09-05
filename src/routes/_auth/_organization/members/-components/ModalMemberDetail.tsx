import { Calendar, Eye, LoaderCircle, Mail, X } from "lucide-react";
import { useMemberByIdQuery } from "../-api/organization.query";
import Dialog from "../../../../../components/ui/DIalog";
import IconButton from "../../../../../components/ui/IconButton";
import type { OrganizationMember } from "../../../../../types";

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

export default function ModalMemberDetail({
  orgId,
  member,
}: {
  orgId: string;
  member: OrganizationMember;
}) {
  const { data, isLoading } = useMemberByIdQuery(orgId, member.id || "");

  const detail = data?.data || member;
  const initials = (detail.fullName || "M").charAt(0).toUpperCase();

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
      dismissible={!isLoading}
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

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoaderCircle
                className="animate-spin text-primary-main"
                size={28}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary-main/10 text-primary-main font-bold text-2xl flex items-center justify-center border-2 border-primary-main/20 mb-3 shadow-sm">
                {initials}
              </div>

              <h2 className="text-lg font-bold text-text-primary">
                {detail.fullName}
              </h2>
              <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5 mb-3">
                <Mail size={12} />
                {detail.email}
              </p>

              <div className="flex items-center gap-2 mb-6">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadge(detail.organizationRole)}`}
                >
                  {detail.organizationRole || "Member"}
                </span>
                {detail.status && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(detail.status)}`}
                  >
                    {detail.status}
                  </span>
                )}
              </div>

              {detail.joinedAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <Calendar size={13} /> Bergabung
                  </span>
                  <span className="font-medium text-text-primary">
                    {new Date(detail.joinedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Dialog>
  );
}
