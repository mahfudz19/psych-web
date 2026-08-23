import { useTranslation } from "react-i18next";
import { useOrganizationQuery } from "../../-api/organization.query";
import { isOrganizationOwner } from "../../../../../utils/auth";
import { authStore } from "../../../../../utils/authStore";
import DeleteOrganizationModal from "./DeleteOrganizationModal";
import UpdateOrganizationForm from "./UpdateOrganizationForm";

function OrganizationSettingsPage() {
  const { t } = useTranslation();
  const { user } = authStore.get();
  const orgId = user?.organizationId;

  const { data, isLoading, isError } = useOrganizationQuery(orgId);

  const organization = data?.data;

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
      <UpdateOrganizationForm organization={organization} />

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

              <DeleteOrganizationModal orgId={organization.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrganizationSettingsPage;
