import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../../../utils/api";

export const Route = createFileRoute("/_guest/register/organization/")({
  component: RegisterOrganization,
});

function RegisterOrganization() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    organizationName: "",
  });

  const registerMutation = useMutation({
    mutationFn: () =>
      api("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          accountType: "ORGANIZATION",
        }),
      }),
    onSuccess: () => {
      alert("Registrasi Organisasi berhasil! Silakan login.");
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
        border: "1px solid #28a745",
        borderRadius: "8px",
      }}
    >
      <h3 style={{ color: "#28a745" }}>Buat Organisasi Baru</h3>
      <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1.5rem" }}>
        Anda akan menjadi pemilik (owner) dari entitas organisasi ini.
      </p>

      {registerMutation.isError && (
        <p style={{ color: "red" }}>Gagal mendaftar. Silakan cek data Anda.</p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          type="text"
          placeholder="Nama Lengkap Admin"
          required
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
        />
        <input
          type="email"
          placeholder="Email Kerja"
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
          placeholder="Nama Organisasi / Perusahaan (Opsional)"
          value={formData.organizationName}
          onChange={(e) =>
            setFormData({ ...formData, organizationName: e.target.value })
          }
        />
        <button
          type="submit"
          disabled={registerMutation.isPending}
          style={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "10px",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {registerMutation.isPending ? "Memproses..." : "Daftar Organisasi"}
        </button>
      </form>
    </div>
  );
}
