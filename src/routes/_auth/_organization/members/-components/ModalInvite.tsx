import { Users, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "../../../../../components/ui/Button";
import Dialog from "../../../../../components/ui/DIalog";
import IconButton from "../../../../../components/ui/IconButton";
import toast from "../../../../../components/ui/Toast";
import { authStore } from "../../../../../utils/authStore";

export type invitePayload = {
  invitedBy: string;
  invitedName: string | undefined;
  invitedOrganizationId: string;
  invitedOrganizationName: string | undefined;
};

const ModalInvite = () => {
  const { user } = authStore.get();
  const { t } = useTranslation();

  const handleCopyInviteLink = (
    inviteCode?: string | null,
    organizationId?: string | null,
  ) => {
    const baseUrl = window.location.origin;

    let inviteUrl: string | null = null;

    if (inviteCode) {
      inviteUrl = inviteCode;
    } else if (organizationId) {
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
    }

    if (!inviteUrl) return;

    const type = inviteCode ? "Kode Undangan Khusus" : "Organisasi";

    navigator.clipboard.writeText(inviteUrl);
    toast.success(`Tautan undangan via ${type} siap dibagikan.`);
  };

  return (
    <Dialog
      trigger={(openDialog) => (
        <Button
          startIcon={<Users className="w-4 h-4" />}
          onClick={() => openDialog()}
        >
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
              Undang ke Organisasi
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Pilih metode undangan yang ingin Anda gunakan. Tautan akan disalin
              ke *clipboard* Anda.
            </p>
          </div>

          <div className="space-y-4 mt-4">
            {user?.inviteCode && (
              <button
                autoFocus
                onClick={() => handleCopyInviteLink(user?.inviteCode)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-divider hover:border-primary-main/50 hover:bg-primary-main/5 transition-all text-left group"
              >
                <div>
                  <p className="text-sm font-bold text-text-primary group-hover:text-primary-main transition-colors">
                    Gunakan Kode Undangan Khusus
                  </p>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    {user?.inviteCode}
                  </p>
                </div>
                <span className="text-lg">🔗</span>
              </button>
            )}

            {user?.organizationId && (
              <button
                onClick={() =>
                  handleCopyInviteLink(undefined, user?.organizationId)
                }
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-divider hover:border-info-main/50 hover:bg-info-main/5 transition-all text-left group"
              >
                <div>
                  <p className="text-sm font-bold text-text-primary group-hover:text-info-main transition-colors">
                    Gunakan ID Organisasi
                  </p>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Link berisi `?token=...` (Base64 encoded)
                  </p>
                </div>
                <span className="text-lg">🏢</span>
              </button>
            )}
          </div>
        </>
      )}
    </Dialog>
  );
};

export default ModalInvite;
