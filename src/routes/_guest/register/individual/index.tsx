import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../../utils/api";

export const Route = createFileRoute("/_guest/register/individual/")({
  component: RegisterIndividual,
});

/**
 * Komponen halaman registrasi untuk akun individual (standalone).
 */
function RegisterIndividual() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    referralCode: "",
  });

  const registerMutation = useMutation({
    mutationFn: () =>
      api("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          accountType: "INDIVIDUAL",
        }),
      }),
    onSuccess: () => {
      alert("Registrasi berhasil! Silakan login.");
      navigate({ to: "/login" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "4rem auto",
        padding: "2rem",
        border: "1px solid #ddd",
      }}
    >
      <h3>{t("guest.register.title")}</h3>
      {registerMutation.isError && (
        <p style={{ color: "red" }}>{t("guest.register.error")}</p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          type="text"
          placeholder={t("guest.register.fullNamePlaceholder")}
          required
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
        />
        <input
          type="email"
          placeholder={t("guest.register.emailPlaceholder")}
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder={t("guest.register.passwordPlaceholder")}
          required
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <input
          type="text"
          placeholder={t("guest.register.referralPlaceholder")}
          value={formData.referralCode}
          onChange={(e) =>
            setFormData({ ...formData, referralCode: e.target.value })
          }
        />
        <button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending
            ? t("guest.register.processing")
            : t("guest.register.submitIndividual")}
        </button>
      </form>
    </div>
  );
}
