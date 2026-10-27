import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useLoginMutation } from "../-api/auth.query";
import PassworfField from "../-components/PassworfField";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import ButtonLoginGoogle from "./-components/ButtonLoginGoogle";
import Label from "../../../components/ui/Label";

export const Route = createFileRoute("/_guest/login/")({ component: Login });

function Login() {
  const { t } = useTranslation();

  const loginMutation = useLoginMutation();

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    loginMutation.mutate({ email, password });
  };

  return (
    <>
      <div className="mb-10">
        <div className="inline-block px-3 py-1 bg-primary-main text-primary-contrast font-black text-xs tracking-widest rounded-md mb-6">
          {t("guest.login.badge")}
        </div>
        <h3 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
          {t("guest.login.title")}
        </h3>
        <p className="text-text-secondary text-sm">
          {t("guest.login.subtitle")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div>
          <Label>{t("guest.login.emailLabel")}</Label>
          <Input
            type="email"
            name="email"
            placeholder={t("guest.login.emailPlaceholder")}
            required
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>{t("guest.login.passwordLabel")}</Label>
            <Link
              to="/forgot-password"
              preload={false}
              tabIndex={-1}
              className="text-primary-main font-bold hover:underline text-sm"
              viewTransition
            >
              {t("guest.login.forgotPassword")}
            </Link>
          </div>
          <PassworfField name="password" placeholder="••••••••" required />
        </div>

        <Button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending
            ? t("guest.login.processing")
            : t("guest.login.submitBtn")}
        </Button>

        <ButtonLoginGoogle />
      </form>

      <div className="mt-8 pt-6 border-t border-divider text-left text-sm text-text-secondary">
        {t("guest.login.noAccount")}{" "}
        <Link
          to="/register"
          preload={false}
          className="text-primary-main font-bold hover:underline"
        >
          {t("guest.login.registerLink")}
        </Link>
      </div>
    </>
  );
}
