import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { api } from "../../../utils/api";
import type { User } from "../../../types/user";
import { needsOrganizationCreation } from "../../../utils/auth";
import toast from "../../../components/ui/Toast";
import Button from "../../../components/ui/Button";
import { authStore } from "../../../utils/authStore";
import { useCreateOrganizationMutation } from "../_organization/-api/organization.query";
import { me } from "../../_guest/-api/auth.api";

export const Route = createFileRoute("/_auth/create-organization/")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const data = await queryClient.query({
      queryKey: ["userProfile"],
      queryFn: () => api.get<User>("/api/v1/auth/me"),
      staleTime: 1000 * 60 * 5,
    });

    if (!needsOrganizationCreation(data.data)) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: CreateOrganizationPage,
});

function CreateOrganizationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = authStore.get();
  const { mutateAsync: createOrganization, isPending: isCreating } =
    useCreateOrganizationMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await createOrganization({
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || undefined,
        website: (formData.get("website") as string) || undefined,
        phone: (formData.get("phone") as string) || undefined,
        email: (formData.get("email") as string) || undefined,
        address: (formData.get("address") as string) || undefined,
      });
      const { data: updatedUser } = await me();
      authStore.set({ user: updatedUser });

      toast.success(t("organization.create.success"));
      navigate({ to: "/dashboard", replace: true });
    } catch (error: any) {
      toast.error(error?.message || t("organization.create.error"));
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-bg-default p-4 md:p-8">
      <div className="w-full max-w-2xl bg-bg-paper rounded-3xl shadow-lg border border-divider p-6 md:p-10">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight mb-3">
            {t("organization.create.title")}
          </h2>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed">
            {t("organization.create.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder={t("organization.fields.namePlaceholder")}
              className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
            />
          </div>

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
              placeholder={t("organization.fields.descriptionPlaceholder")}
              className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium resize-none"
            />
          </div>

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
                placeholder={t("organization.fields.phonePlaceholder")}
                className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
              />
            </div>
          </div>

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
                placeholder={t("organization.fields.addressPlaceholder")}
                className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="bg-info-main/5 border border-info-main/20 rounded-2xl p-4">
            <p className="text-text-secondary text-sm leading-relaxed">
              {t("organization.create.info", {
                name: user?.fullName || "User",
              })}
            </p>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              fullWidth
              loading={isCreating}
              disabled={isCreating}
              size="lg"
            >
              {isCreating
                ? t("organization.create.processing")
                : t("organization.create.submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
