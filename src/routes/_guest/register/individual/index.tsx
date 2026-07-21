import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../../../utils/api";

export const Route = createFileRoute("/_guest/register/individual/")({
  component: RegisterIndividual,
});

function RegisterIndividual() {
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
      <h3>Daftar Akun Individual</h3>
      {registerMutation.isError && (
        <p style={{ color: "red" }}>Gagal mendaftar. Silakan cek data Anda.</p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          type="text"
          placeholder="Nama Lengkap"
          required
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
        />
        <input
          type="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Kode Referral (Opsional)"
          value={formData.referralCode}
          onChange={(e) =>
            setFormData({ ...formData, referralCode: e.target.value })
          }
        />
        <button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Memproses..." : "Daftar"}
        </button>
      </form>
    </div>
  );
}
