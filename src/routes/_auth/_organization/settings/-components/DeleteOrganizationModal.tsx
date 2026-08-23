import { useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "../../../../../components/ui/DIalog";
import Button from "../../../../../components/ui/Button";
import { useDeleteOrganizationMutation } from "../../-api/organization.query";
import toast from "../../../../../components/ui/Toast";
import { useNavigate } from "@tanstack/react-router";
import { me } from "../../../../_guest/-api/auth.api";
import { authStore } from "../../../../../utils/authStore";

interface Props {
  orgId: string | null | undefined;
}

export default function DeleteOrganizationModal({ orgId }: Props) {
  const [confirmation, setConfirmation] = useState("");

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { mutateAsync: deleteOrganization, isPending: isLoading } =
    useDeleteOrganizationMutation();

  const expectedConfirmation = "DELETE_MY_ORGANIZATION";
  const isValid = confirmation === expectedConfirmation;

  const onConfirm = async () => {
    if (!orgId) return;

    try {
      await deleteOrganization({
        orgId,
        confirmation: "DELETE_MY_ORGANIZATION",
      });
      const { data: updatedUser } = await me();
      authStore.set({ user: updatedUser });

      toast.success(t("organization.settings.deleteSuccess"));
      navigate({ to: "/login", replace: true });
    } catch (error: any) {
      toast.error(error?.message || t("organization.settings.deleteError"));
    }
  };

  const handleConfirm = (closeDialog: () => void) => {
    if (!isValid) return;
    onConfirm();
    setConfirmation("");
    closeDialog();
  };

  return (
    <Dialog
      trigger={(openDialog) => (
        <Button
          color="error"
          variant="outlined"
          onClick={openDialog}
          disabled={isLoading}
          size="lg"
        >
          {t("organization.settings.deleteButton")}
        </Button>
      )}
      scroll="paper"
      dismissible={!isLoading}
    >
      {(closeDialog) => (
        <>
          {/* Header */}
          <div className="mb-6">
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
              {t("organization.delete.title")}
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              {t("organization.delete.warning")}
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-4 mb-6">
            <div className="bg-error-main/5 border border-error-main/20 rounded-2xl p-4">
              <p className="text-text-secondary text-sm mb-2">
                {t("organization.delete.confirmationLabel")}
              </p>
              <code className="block bg-bg-default px-3 py-2 rounded-xl text-error-main font-mono text-sm font-semibold">
                {expectedConfirmation}
              </code>
            </div>

            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={t("organization.delete.confirmationPlaceholder")}
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-error-main focus:ring-2 focus:ring-error-main/20 transition-all text-sm font-medium disabled:opacity-50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outlined"
              onClick={() => {
                setConfirmation("");
                closeDialog();
              }}
              disabled={isLoading}
              className="flex-1"
            >
              {t("common.cancel")}
            </Button>
            <Button
              color="error"
              onClick={() => handleConfirm(closeDialog)}
              disabled={!isValid || isLoading}
              loading={isLoading}
              className="flex-1"
            >
              {t("organization.delete.confirmButton")}
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
}
