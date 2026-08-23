import { useTranslation } from "react-i18next";
import { useUpdateOrganizationMutation } from "../../-api/organization.query";
import Button from "../../../../../components/ui/Button";
import type { Organization } from "../../../../../types";
import Input from "../../../../../components/ui/Input";
import Textarea from "../../../../../components/ui/Textarea";

function UpdateOrganizationForm(props: { organization: Organization }) {
  const { organization } = props;
  const { t } = useTranslation();

  const updateMutation = useUpdateOrganizationMutation();

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const orgId = organization.id;
    if (!organization.id) return;

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

  return (
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
          <Input
            id="org-name"
            type="text"
            name="name"
            required
            defaultValue={organization.name}
            placeholder={t("organization.fields.namePlaceholder")}
            className="w-full"
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
          <Textarea
            id="org-description"
            name="description"
            rows={3}
            defaultValue={organization.description || ""}
            placeholder={t("organization.fields.descriptionPlaceholder")}
            className="w-full"
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
            <Input
              id="org-website"
              type="url"
              name="website"
              defaultValue={organization.website || ""}
              placeholder={t("organization.fields.websitePlaceholder")}
              className="w-full"
            />
          </div>

          <div>
            <label
              htmlFor="org-phone"
              className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              {t("organization.fields.phone")}
            </label>
            <Input
              id="org-phone"
              type="tel"
              name="phone"
              defaultValue={organization.phone || ""}
              placeholder={t("organization.fields.phonePlaceholder")}
              className="w-full"
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
            <Input
              id="org-email"
              type="email"
              name="email"
              defaultValue={organization.email || ""}
              placeholder={t("organization.fields.emailPlaceholder")}
              className="w-full"
            />
          </div>

          <div>
            <label
              htmlFor="org-address"
              className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              {t("organization.fields.address")}
            </label>
            <Input
              id="org-address"
              type="text"
              name="address"
              defaultValue={organization.address || ""}
              placeholder={t("organization.fields.addressPlaceholder")}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="text-right gap-3 mt-8 pt-6 border-t border-divider">
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
  );
}

export default UpdateOrganizationForm;
