import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../hooks/useAuth";
import {
  useDeleteOrganization,
  useOrganization,
  useUpdateOrganization,
} from "../../../../hooks/useOrganization";
import { isOrganizationOwner } from "../../../../utils/auth";
import Button from "../../../../components/ui/Button";
import toast from "../../../../components/ui/Toast";
import DeleteOrganizationModal from "./-components/DeleteOrganizationModal";

/**
 * Halaman pengaturan organisasi
 * Digunakan untuk mengedit informasi organisasi dan menghapus organisasi (owner only)
 */
export const Route = createFileRoute("/_auth/_organization/settings/")({
  component: OrganizationSettingsPage,
});

function OrganizationSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const orgId = user?.organizationId;

  const { data, isLoading, isError } = useOrganization(orgId);
  const updateMutation = useUpdateOrganization();
  const { mutateAsync: deleteOrganization, isPending: isDeleting } =
    useDeleteOrganization();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const organization = data?.data;

  /**
   * Handler submit form update organization
   * @param e - Form submit event
   */
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!orgId) return;

    const formData = new FormData(e.currentTarget);

    updateMutation.mutate({
      orgId,
      data: {
        name: (formData.get("name") as string) || undefined,
        description: (formData.get("description") as string) || undefined,
        website: (formData.get("website") as string) || undefined,
        phone: (formData.get("phone") as string) || undefined,
        email: (formData.get("email") as string) || undefined,
        address: (formData.get("address") as string) || undefined,
      },
    });
  };

  /**
   * Handler delete organization
   * Setelah berhasil, redirect ke halaman login
   */
  const handleDelete = async () => {
    if (!orgId) return;

    try {
      await deleteOrganization({
        orgId,
        confirmation: "DELETE_MY_ORGANIZATION",
      });

      toast.success(t("organization.settings.deleteSuccess"));
      navigate({ to: "/login", replace: true });
    } catch (error: any) {
      toast.error(error?.message || t("organization.settings.deleteError"));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-bg-default text-text-secondary">
        {t("common.processing")}
      </div>
    );
  }

  if (isError || !organization) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-bg-default text-error-main">
        {t("organization.errors.notFound")}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight mb-2">
          {t("organization.settings.title")}
        </h2>
        <p className="text-text-secondary text-sm md:text-base">
          {t("organization.settings.subtitle")}
        </p>
      </div>

      {/* Update Form */}
      <form
        onSubmit={handleUpdate}
        className="bg-bg-paper rounded-3xl shadow-sm border border-divider p-6 md:p-8 mb-6"
      >
        <div className="space-y-5">
          {/* Organization Name */}
          <div>
            <label
              htmlFor="org-name"
              className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              {t("organization.fields.name")}{" "}
              <span className="text-error-main">*</span>
            </label>
            <input
              id="org-name"
              type="text"
              name="name"
              required
              defaultValue={organization.name}
              placeholder={t("organization.fields.namePlaceholder")}
              className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="org-description"
              className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              {t("organization.fields.description")}
            </label>
            <textarea
              id="org-description"
              name="description"
              rows={3}
              defaultValue={organization.description || ""}
              placeholder={t("organization.fields.descriptionPlaceholder")}
              className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium resize-none"
            />
          </div>

          {/* Website & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="org-website"
                className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
              >
                {t("organization.fields.website")}
              </label>
              <input
                id="org-website"
                type="url"
                name="website"
                defaultValue={organization.website || ""}
                placeholder={t("organization.fields.websitePlaceholder")}
                className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label
                htmlFor="org-phone"
                className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
              >
                {t("organization.fields.phone")}
              </label>
              <input
                id="org-phone"
                type="tel"
                name="phone"
                defaultValue={organization.phone || ""}
                placeholder={t("organization.fields.phonePlaceholder")}
                className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* Email & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="org-email"
                className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
              >
                {t("organization.fields.email")}
              </label>
              <input
                id="org-email"
                type="email"
                name="email"
                defaultValue={organization.email || ""}
                placeholder={t("organization.fields.emailPlaceholder")}
                className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label
                htmlFor="org-address"
                className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
              >
                {t("organization.fields.address")}
              </label>
              <input
                id="org-address"
                type="text"
                name="address"
                defaultValue={organization.address || ""}
                placeholder={t("organization.fields.addressPlaceholder")}
                className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t border-divider">
          <Button
            type="submit"
            loading={updateMutation.isPending}
            disabled={updateMutation.isPending}
            size="lg"
          >
            {t("organization.settings.updateButton")}
          </Button>
        </div>
      </form>

      {/* Danger Zone - Owner Only */}
      {isOrganizationOwner(user) && (
        <div className="bg-error-main/5 border border-error-main/20 rounded-3xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-error-main/10 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-error-main"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-error-main mb-2">
                {t("organization.settings.dangerZone")}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                {t("organization.settings.deleteWarning")}
              </p>
              <Button
                color="error"
                variant="outlined"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isDeleting}
                size="lg"
              >
                {t("organization.settings.deleteButton")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DeleteOrganizationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
