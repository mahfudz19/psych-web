import { useTranslation } from "react-i18next";
import Dialog from "../../../../../../components/ui/DIalog";
import Button from "../../../../../../components/ui/Button";
import { useRegenerateMutation } from "../-api/referral.query";

const HandleRegenerate = () => {
  const { t } = useTranslation();

  const regenerateMutation = useRegenerateMutation();

  const handleRegenerate = () => {
    regenerateMutation.mutate({ reason: "user_request" });
  };

  return (
    <Dialog
      trigger={(openDialog) => (
        <Button
          onClick={openDialog}
          disabled={regenerateMutation.isPending}
          color="warning"
          size="sm"
          variant="text"
        >
          {regenerateMutation.isPending
            ? t("referral.regeneratingButton")
            : t("referral.regenerateButton")}
        </Button>
      )}
    >
      {(closeDialog) => (
        <>
          {/* Header */}
          <div className="mb-4">
            <div className="inline-block px-3 py-1 bg-warning-main/10 text-warning-main font-black text-xs tracking-widest rounded-md mb-3">
              {t("referral.regenerateDialog.warningBadge")}
            </div>
            <h3 className="text-xl font-extrabold text-text-primary tracking-tight">
              {t("referral.regenerateDialog.title")}
            </h3>
            <p className="text-text-secondary text-sm mt-2">
              {t("referral.regenerateDialog.description")}
            </p>
          </div>

          {/* Rate Limit Info */}
          <div className="bg-bg-secondary border border-divider rounded-xl p-4 mb-6">
            <p className="text-xs text-text-secondary">
              <strong className="text-warning-main">
                {t("referral.regenerateDialog.rateLimitLabel")}
              </strong>{" "}
              {t("referral.regenerateDialog.rateLimitValue")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outlined"
              color="primary"
              onClick={closeDialog}
              disabled={regenerateMutation.isPending}
              fullWidth
            >
              {t("referral.regenerateDialog.cancelButton")}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleRegenerate();
                closeDialog();
              }}
              disabled={regenerateMutation.isPending}
              fullWidth
            >
              {regenerateMutation.isPending
                ? t("referral.regeneratingButton")
                : t("referral.regenerateDialog.confirmButton")}
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
};

export default HandleRegenerate;
