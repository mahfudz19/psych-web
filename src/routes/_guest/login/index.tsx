import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AuthSplitLayout } from "../-components/AuthSplitLayout";
import { useLoginMutation } from "./-api/login.query";

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
    <AuthSplitLayout layoutKey="login" imagePosition="left">
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
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
            {t("guest.login.emailLabel")}
          </label>
          <input
            type="email"
            name="email"
            placeholder={t("guest.login.emailPlaceholder")}
            required
            className="w-full px-4 py-3 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all font-medium text-sm"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
              {t("guest.login.passwordLabel")}
            </label>
          </div>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            required
            className="w-full px-4 py-3 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all font-medium text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full mt-3 py-3 px-4 bg-primary-main text-primary-contrast rounded-2xl font-bold text-sm hover:bg-primary-dark active:scale-[0.99] focus:outline-none disabled:opacity-50 transition-all shadow-md shadow-primary-main/20"
        >
          {loginMutation.isPending
            ? t("guest.login.processing")
            : t("guest.login.submitBtn")}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-divider text-left text-sm text-text-secondary">
        {t("guest.login.noAccount")}{" "}
        <Link
          to="/register"
          className="text-primary-main font-bold hover:underline"
        >
          {t("guest.login.registerLink")}
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
