import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../utils/api";
import { AuthSplitLayout } from "../components/AuthSplitLayout";

export const Route = createFileRoute("/_guest/login/")({
  component: Login,
});

/**
 * Komponen halaman login untuk autentikasi pengguna.
 */
function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: () =>
      api("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    onSuccess: () => {
      router.invalidate().then(() => {
        router.navigate({ to: "/dashboard" });
      });
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <AuthSplitLayout layoutKey="login" imagePosition="left">
      <div className="mb-10">
        <div className="inline-block px-3 py-1 bg-primary-main text-primary-contrast font-black text-xs tracking-widest rounded mb-6">
          {t("guest.login.badge")}
        </div>
        <h3 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
          {t("guest.login.title")}
        </h3>
        <p className="text-text-secondary text-sm">
          {t("guest.login.subtitle")}
        </p>
      </div>

      {loginMutation.isError && (
        <div className="mb-6 p-3.5 bg-error-main/10 border-l-4 border-error-main rounded-r-md">
          <p className="text-error-main text-xs font-semibold">
            {t("guest.login.error")}
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
            {t("guest.login.emailLabel")}
          </label>
          <input
            type="email"
            placeholder={t("guest.login.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all font-medium text-sm"
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all font-medium text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full mt-3 py-3 px-4 bg-primary-main text-primary-contrast rounded-xl font-bold text-sm hover:bg-primary-dark active:scale-[0.99] focus:outline-none disabled:opacity-50 transition-all shadow-md shadow-primary-main/20"
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
