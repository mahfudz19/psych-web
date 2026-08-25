import { LoaderCircle, Trash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useKickMemberMutation } from "../-api/organization.query";
import Button from "../../../../../components/ui/Button";
import Dialog from "../../../../../components/ui/DIalog";
import IconButton from "../../../../../components/ui/IconButton";
import type { OrganizationMember } from "../../../../../types";
import toast from "../../../../../components/ui/Toast";
import { authStore } from "../../../../../utils/authStore";

export default function ModalKickMember({
  orgId,
  member,
}: {
  orgId?: string;
  member: OrganizationMember;
}) {
  const { t } = useTranslation();
  const { user } = authStore.get();

  const kickMutation = useKickMemberMutation(orgId || "");
  const isLoading = kickMutation.isPending;
  const isOwnerOrAdmin = member.organizationRole
    ? ["owner", "admin"].includes(member.organizationRole)
    : false;

  const disabled = isLoading || isOwnerOrAdmin || user?.id === member.id;

  const handleConfirm = (closeDialog: () => void) => {
    if (isOwnerOrAdmin) {
      toast.error(t("organization.members.kickOwnerError"));
      return;
    }
    if (!orgId) return;
    kickMutation.mutate(member.id);
    closeDialog();
  };

  return (
    <>
      <Dialog
        trigger={(openDialog) => (
          <IconButton
            color="error"
            variant="text"
            onClick={openDialog}
            disabled={disabled}
            size="sm"
            title={
              isOwnerOrAdmin
                ? t("organization.members.cannotKickOwner")
                : t("organization.members.kickAction")
            }
          >
            {kickMutation.isPending && kickMutation.variables === member.id ? (
              <LoaderCircle className="animate-spin" size={15} />
            ) : (
              <Trash size={15} />
            )}
          </IconButton>
        )}
        scroll="paper"
        dismissible={!isLoading}
      >
        {(closeDialog) => (
          <>
            {/* Header */}
            <div className="mb-6 text-left!">
              <div className="w-12 h-12 rounded-2xl bg-error-main/10 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-error-main"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-text-primary mb-2">
                {t("organization.members.kickAction")}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {t("organization.members.kickConfirm", {
                  name: member.fullName,
                })}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outlined"
                onClick={() => closeDialog()}
                disabled={isLoading}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
              <Button
                color="error"
                onClick={() => handleConfirm(closeDialog)}
                disabled={isLoading}
                loading={isLoading}
                className="flex-1"
              >
                {t("organization.delete.confirmButton")}
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}
