import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "../../../../../../components/ui/Button";
import Dialog from "../../../../../../components/ui/Dialog";
import IconButton from "../../../../../../components/ui/IconButton";
import { useRevokeSessionMutation } from "../-api/sessions.query";
import type { Session } from "../../../../../../types/user";

function Revoke({ data }: { data: Session }) {
  const { t } = useTranslation();
  const revokeMutation = useRevokeSessionMutation();

  const handleRevoke = (closeDialog: () => void) =>
    revokeMutation.mutate(data.id, { onSuccess: () => closeDialog() });

  return (
    <Dialog
      className="p-6 text-left max-w-sm"
      trigger={(openDialog) => (
        <IconButton
          size="sm"
          variant="text"
          color="error"
          title={t("profile.sessions.revokeAction")}
          onClick={openDialog}
        >
          <LogOut className="w-4 h-4" />
        </IconButton>
      )}
    >
      {(closeDialog) => (
        <>
          <h3 className="text-lg font-bold text-text-primary">
            {t("profile.sessions.revokeTitle")}
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            {t("profile.sessions.revokeSubtitle")}
          </p>

          <div className="my-3 p-3 rounded-xl bg-divider/10 border border-divider text-xs space-y-1">
            <p className="font-semibold text-text-primary">
              {data.deviceInfo?.os || t("profile.sessions.unknownDevice")} •{" "}
              {data.deviceInfo?.browser || "Browser"}
            </p>
            {data.deviceInfo?.ip && (
              <p className="text-text-secondary font-mono text-[11px]">
                IP: {data.deviceInfo.ip}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 mt-4">
            <Button
              variant="outlined"
              color="error"
              size="sm"
              onClick={closeDialog}
              disabled={revokeMutation.isPending}
            >
              {t("profile.sessions.cancel")}
            </Button>
            <Button
              variant="contained"
              color="error"
              size="sm"
              loading={revokeMutation.isPending}
              onClick={() => handleRevoke(closeDialog)}
            >
              {t("profile.sessions.revokeButton")}
              Akhiri Sesi
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
}

export default Revoke;
