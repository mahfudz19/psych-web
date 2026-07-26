import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../../../components/ui/Button";

/**
 * Props untuk DeleteOrganizationModal
 */
interface DeleteOrganizationModalProps {
  /** Status apakah modal terbuka */
  isOpen: boolean;

  /** Callback saat modal ditutup */
  onClose: () => void;

  /** Callback saat user mengkonfirmasi delete */
  onConfirm: () => void;

  /** Status loading saat proses delete */
  isLoading: boolean;
}

/**
 * Modal konfirmasi untuk menghapus organisasi
 * User harus mengetik confirmation text yang tepat sebelum bisa delete
 */
export default function DeleteOrganizationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: DeleteOrganizationModalProps) {
  const { t } = useTranslation();
  const [confirmation, setConfirmation] = useState("");

  const expectedConfirmation = "DELETE_MY_ORGANIZATION";
  const isValid = confirmation === expectedConfirmation;

  /**
   * Reset state dan tutup modal
   */
  const handleClose = () => {
    setConfirmation("");
    onClose();
  };

  /**
   * Handle konfirmasi delete
   */
  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm();
    setConfirmation("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-bg-paper rounded-3xl shadow-2xl border border-error-main/20 p-6 md:p-8">
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

        <div className="space-y-4">
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
            className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-error-main focus:ring-2 focus:ring-error-main/20 transition-all text-sm font-medium"
          />

          <div className="flex gap-3 pt-2">
            <Button
              variant="outlined"
              color="white"
              fullWidth
              onClick={handleClose}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              color="error"
              fullWidth
              onClick={handleConfirm}
              disabled={!isValid || isLoading}
              loading={isLoading}
            >
              {t("organization.delete.confirmButton")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
