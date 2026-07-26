import { X } from "lucide-react";
import IconButton from "../../../../../components/ui/IconButton";
import toast from "../../../../../components/ui/Toast";
import { useAuth } from "../../../../../hooks/useAuth";

const ModalInvite = ({ close }: { close: () => void }) => {
  const { user } = useAuth();

  const handleCopyInviteLink = (
    inviteCode?: string | null,
    organizationId?: string | null,
  ) => {
    const baseUrl = window.location.origin + "/invite";

    const inviteUrl = inviteCode
      ? `${baseUrl}?inviteCode=${inviteCode}`
      : organizationId
        ? `${baseUrl}?organizationId=${organizationId}`
        : null;

    if (!inviteUrl) return;

    const type = inviteCode ? "Kode Undangan Khusus" : "Organisasi";

    navigator.clipboard.writeText(inviteUrl);
    toast.success(`Tautan undangan via ${type} siap dibagikan.`);
  };

  return (
    <>
      {/* Tombol Tutup */}
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
          Pilih metode undangan yang ingin Anda gunakan. Tautan akan disalin ke
          *clipboard* Anda.
        </p>
      </div>

      <div className="space-y-4 mt-4">
        {user?.inviteCode && (
          <button
            autoFocus
            onClick={() =>
              handleCopyInviteLink(user?.inviteCode, user?.organizationId)
            }
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-divider hover:border-primary-main/50 hover:bg-primary-main/5 transition-all text-left group"
          >
            <div>
              <p className="text-sm font-bold text-text-primary group-hover:text-primary-main transition-colors">
                Gunakan Kode Undangan Khusus
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Link berisi `?inviteCode=...`
              </p>
            </div>
            <span className="text-lg">🔗</span>
          </button>
        )}

        {user?.organizationId && (
          <button
            onClick={() =>
              handleCopyInviteLink(user?.inviteCode, user?.organizationId)
            }
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-divider hover:border-info-main/50 hover:bg-info-main/5 transition-all text-left group"
          >
            <div>
              <p className="text-sm font-bold text-text-primary group-hover:text-info-main transition-colors">
                Gunakan ID Organisasi
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Link berisi `?invitedOrganizationId=...`
              </p>
            </div>
            <span className="text-lg">🏢</span>
          </button>
        )}
      </div>
    </>
  );
};

export default ModalInvite;
