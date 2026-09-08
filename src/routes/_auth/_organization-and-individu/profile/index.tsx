import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import FieldInputImage from "../../../../components/reusebale-components/FieldInputImage";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import InputDate from "../../../../components/ui/InputDate";
import Label from "../../../../components/ui/Label";
import Textarea from "../../../../components/ui/Textarea";
import toast from "../../../../components/ui/Toast";
import { useAuthStore } from "../../../../utils/authStore";
import { useAvatarUploadMutation } from "./-api/avatar.query";
import { useUpdateProfileMutation } from "./-api/profile.query";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/profile/",
)({
  component: ProfileInfoPage,
});

const ChangeAvatar = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const avatarMutation = useAvatarUploadMutation();

  const handleAvatarChange = (file: File | null) => {
    if (!file) {
      avatarMutation.mutate(
        { file: null, user },
        {
          onSuccess: () =>
            toast.success(t("profile.form.avatar.deleteSuccess")),
          onError: () => toast.error(t("profile.form.avatar.deleteError")),
        },
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024)
      return toast.error(t("profile.form.avatar.maxSize"));
    if (!file.type.startsWith("image/"))
      return toast.error(t("profile.form.avatar.invalidFormat"));

    const objectUrl = URL.createObjectURL(file);

    avatarMutation.mutate(
      { file, user },
      {
        onSettled: () => URL.revokeObjectURL(objectUrl),
        onError: () => toast.error(t("profile.form.avatar.updateError")),
      },
    );
  };

  const displayImage = user?.profilePicture;

  return (
    <FieldInputImage
      defaultImage={displayImage}
      onSave={(_, data) => handleAvatarChange(data)}
      width={255}
      height={255}
      limitSize={2 * 1024 * 1024}
      shape="rounded"
      error={Boolean(avatarMutation.error)}
    />
  );
};

const FormInputs = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const updateProfileMutation = useUpdateProfileMutation();

  const handleSave = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const fullName = (data.get("fullName") as string)?.trim();
    const phone = (data.get("phone") as string)?.trim();
    const gender = data.get("gender") as "male" | "female";
    const rawDob = data.get("dateOfBirth") as string;
    const bio = (data.get("bio") as string)?.trim();

    if (!fullName)
      return toast.error(t("profile.form.validation.fullNameRequired"));
    const dateOfBirth = rawDob ? rawDob.split("T")[0] : undefined;

    updateProfileMutation.mutate({
      fullName,
      phone,
      gender,
      dateOfBirth,
      bio,
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="p-6 rounded-3xl bg-bg-paper border border-divider shadow-sm space-y-6">
        <div className="border-b border-divider pb-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            {t("profile.form.mainInfo.title")}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {t("profile.form.mainInfo.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">
              {t("profile.form.fields.fullName")}
            </Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={user?.fullName || ""}
              placeholder={t("profile.form.fields.fullNamePlaceholder")}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="email">{t("profile.form.fields.email")}</Label>
              <span className="text-[10px] text-text-disabled lowercase">
                {t("profile.form.fields.emailHelp")}
              </span>
            </div>
            <Input
              id="email"
              type="email"
              disabled
              defaultValue={user?.email || ""}
              className="w-full bg-divider/10 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">{t("profile.form.fields.phone")}</Label>
            <Input
              id="phone"
              type="tel"
              name="phone"
              defaultValue={user?.phone || ""}
              placeholder={t("profile.form.fields.phonePlaceholder")}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gender">{t("profile.form.fields.gender")}</Label>
            <select
              id="gender"
              name="gender"
              defaultValue={user?.gender || "male"}
              className="w-full px-4 py-2.5 rounded-2xl bg-bg-default border border-divider text-sm text-text-primary font-medium focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main outline-none transition-all cursor-pointer"
            >
              <option value="male">{t("profile.form.fields.male")}</option>
              <option value="female">{t("profile.form.fields.female")}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dateOfBirth">{t("profile.form.fields.dob")}</Label>
            <InputDate
              id="dateOfBirth"
              name="dateOfBirth"
              value={user?.dateOfBirth || ""}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="bio">{t("profile.form.fields.bio")}</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={user?.bio || ""}
              rows={3}
              placeholder={t("profile.form.fields.bioPlaceholder")}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="submit" disabled={updateProfileMutation.isPending}>
          {updateProfileMutation.isPending
            ? t("profile.form.buttons.saving")
            : t("profile.form.buttons.submit")}
        </Button>
      </div>
    </form>
  );
};

function ProfileInfoPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const isB2B = Boolean(user?.organizationId);

  return (
    <div className="flex flex-col md:flex-row gap-6 md:items-start">
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <div className="p-6 rounded-3xl bg-bg-paper border border-divider shadow-sm flex flex-col items-center text-center">
          <ChangeAvatar />

          <div className="mt-4 space-y-1">
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
              {user?.fullName || t("profile.form.activeUser")}
            </h2>
            <p className="text-sm font-medium text-text-secondary">
              {user?.email || "user@psycorp.test"}
            </p>
          </div>

          <div className="mt-6 w-full pt-6 border-t border-divider flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary font-medium">
                {t("profile.form.accountType")}
              </span>
              <span className="font-mono text-primary-main font-semibold">
                {isB2B
                  ? t("profile.form.b2b", { id: user?.organizationId })
                  : t("profile.form.individual")}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary font-medium">
                {t("profile.form.status")}
              </span>
              <span className="font-bold text-success-main flex items-center gap-1">
                {t("profile.form.statusReady")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-2/3">
        <FormInputs />
      </div>
    </div>
  );
}

export default ProfileInfoPage;
