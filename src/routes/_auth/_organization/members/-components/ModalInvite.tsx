import {
  Building,
  Copy,
  LoaderCircle,
  Plus,
  RefreshCw,
  Users,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGenerateInviteCodeMutation } from "../../-api/organization.query";
import Button from "../../../../../components/ui/Button";
import Dialog from "../../../../../components/ui/DIalog";
import IconButton from "../../../../../components/ui/IconButton";
import toast from "../../../../../components/ui/Toast";
import { useAuthStore } from "../../../../../utils/authStore";

const InviteCode = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const generateMutation = useGenerateInviteCodeMutation();

  const hasInviteCode = !!user?.inviteCode;
  const isPending = generateMutation.isPending;

  const handleCopyInviteLink = (inviteCode?: string | null) => {
    if (!inviteCode) {
      toast.error("no invite code found");
      return;
    }

    const type = t("organization.members.inviteModal.typeInviteCode");

    navigator.clipboard.writeText(inviteCode);
    toast.success(t("organization.members.inviteModal.toastSuccess", { type }));
  };

  const createInviteCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    generateMutation.mutate();
  };

  if (hasInviteCode) {
    return (
      <div className="w-full flex items-center justify-between p-4 rounded-2xl border border-divider hover:border-primary-main/50 hover:bg-primary-main/5 transition-all group">
        <button
          onClick={() => handleCopyInviteLink(user?.inviteCode)}
          className="text-left flex-1 min-w-0 pr-2 cursor-pointer"
        >
          <p className="text-sm font-bold text-text-primary group-hover:text-primary-main transition-colors truncate">
            {t("organization.members.inviteModal.useInviteCode")}
          </p>
          <p className="text-[11px] font-mono text-text-secondary mt-0.5 truncate">
            {user?.inviteCode}
          </p>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <IconButton
            size="sm"
            variant="text"
            color="primary"
            title="Salin Kode"
            onClick={() => handleCopyInviteLink(user?.inviteCode)}
          >
            <Copy className="w-4 h-4" />
          </IconButton>
          <IconButton
            size="sm"
            variant="text"
            color="primary"
            title="Ubah Kode"
            loading={isPending}
            disabled={isPending}
            onClick={createInviteCode}
          >
            <RefreshCw className="w-4 h-4" />
          </IconButton>
        </div>
      </div>
    );
  }

  return (
    <button
      disabled={isPending}
      onClick={createInviteCode}
      className="w-full flex items-center justify-between p-4 rounded-2xl border border-dashed border-primary-main/50 hover:border-primary-main hover:bg-primary-main/5 transition-all text-left group disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
    >
      <div>
        <p className="text-sm font-bold text-primary-main">
          Buat Kode Undangan
        </p>
        <p className="text-[11px] text-text-secondary mt-0.5">
          Klik untuk membuat kode undangan baru
        </p>
      </div>
      {isPending ? (
        <LoaderCircle className="w-5 h-5 text-primary-main animate-spin" />
      ) : (
        <Plus className="w-5 h-5 text-primary-main" />
      )}
    </button>
  );
};

export type invitePayload = {
  invitedBy: string;
  invitedName: string | undefined;
  invitedOrganizationId: string;
  invitedOrganizationName: string | undefined;
};

const ModalInvite = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const handleCopyInviteLink = (organizationId?: string | null) => {
    const baseUrl = window.location.origin;

    if (!organizationId) {
      toast.error(t("organization.members.inviteModal.orgIdDescription"));
      return;
    }

    let inviteUrl: string | null = null;

    const invitePayload: invitePayload = {
      invitedBy: user?.id || "",
      invitedName: user?.fullName || undefined,
      invitedOrganizationId: organizationId,
      invitedOrganizationName: user?.organizationName || undefined,
    };

    const encodedToken = btoa(
      unescape(encodeURIComponent(JSON.stringify(invitePayload))),
    );

    inviteUrl = `${baseUrl}/invite/${encodedToken}`;

    if (!inviteUrl) return;

    const type = t("organization.members.inviteModal.typeOrganization");

    navigator.clipboard.writeText(inviteUrl);
    toast.success(t("organization.members.inviteModal.toastSuccess", { type }));
  };

  return (
    <Dialog
      className="p-5"
      trigger={(openDialog) => (
        <Button startIcon={<Users className="w-4 h-4" />} onClick={openDialog}>
          {t("organization.members.inviteButton")}
        </Button>
      )}
    >
      {(close) => (
        <>
          <div className="absolute top-5 right-5">
            <IconButton
              tabIndex={-1}
              onClick={() => close()}
              variant="text"
              color="error"
              size="sm"
              className="h-6 w-6"
            >
              <X size={18} />
            </IconButton>
          </div>

          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {t("organization.members.inviteModal.title")}
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              {t("organization.members.inviteModal.subtitle")}
            </p>
          </div>

          <div className="space-y-4 mt-4">
            <InviteCode />

            {user?.organizationId && (
              <button
                onClick={() => handleCopyInviteLink(user?.organizationId)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-divider hover:border-info-main/50 hover:bg-info-main/5 transition-all text-left group"
              >
                <div>
                  <p className="text-sm font-bold text-text-primary group-hover:text-info-main transition-colors">
                    {t("organization.members.inviteModal.useOrgId")}
                  </p>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    {t("organization.members.inviteModal.orgIdDescription")}
                  </p>
                </div>
                <Building className="w-5 h-5 text-info-main" />
              </button>
            )}
          </div>
        </>
      )}
    </Dialog>
  );
};

export default ModalInvite;
