import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { api } from "../../../../../utils/api";

export const Route = createFileRoute("/_guest/register/invite/$token/")({
  component: RegisterInvite,
});

function RegisterInvite() {
  // Mengambil parameter $token dari URL (contoh: /register/invite/INV-123)
  const { token } = Route.useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [inviteData, setInviteData] = useState<any>(null);

  // Logika untuk menentukan jenis token saat komponen dimuat
  useEffect(() => {
    try {
      // Opsi B: Mencoba decode Base64 (Token Direct Add)
      const decodedString = atob(token);
      const parsedJson = JSON.parse(decodedString);
      setInviteData({ type: "DIRECT_ADD", payload: parsedJson });
    } catch (e) {
      // Opsi A: Gagal decode, berarti ini Invite Code biasa (String murni)
      setInviteData({ type: "INVITE_CODE", payload: { inviteCode: token } });
    }
  }, [token]);

  const registerMutation = useMutation({
    mutationFn: () => {
      // Merakit payload sesuai dengan jenis token yang terdeteksi
      const bodyPayload = {
        ...formData,
        accountType: "ORGANIZATION",
        ...(inviteData?.type === "DIRECT_ADD"
          ? inviteData.payload
          : { inviteCode: token }),
      };

      return api("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(bodyPayload),
      });
    },
    onSuccess: () => {
      alert("Berhasil bergabung dengan organisasi! Silakan login.");
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
        border: "1px solid #17a2b8",
        borderRadius: "8px",
      }}
    >
      <h3 style={{ color: "#17a2b8" }}>Anda Diundang!</h3>
      <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1.5rem" }}>
        {inviteData?.type === "DIRECT_ADD"
          ? `Anda akan bergabung sebagai: ${inviteData.payload.invitationRole}`
          : "Lengkapi data diri Anda untuk bergabung ke dalam organisasi menggunakan kode undangan ini."}
      </p>

      {registerMutation.isError && (
        <p style={{ color: "red" }}>
          Gagal bergabung. Undangan mungkin sudah kedaluwarsa atau tidak valid.
        </p>
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
          placeholder="Email Anda"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Buat Password"
          required
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

        {/* Token bersifat Read-Only untuk memberi tahu user bahwa kode terbaca */}
        <input
          type="text"
          value={`Kode: ${token.substring(0, 15)}${token.length > 15 ? "..." : ""}`}
          disabled
          style={{ backgroundColor: "#e9ecef" }}
        />

        <button
          type="submit"
          disabled={registerMutation.isPending || !inviteData}
          style={{
            backgroundColor: "#17a2b8",
            color: "white",
            padding: "10px",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {registerMutation.isPending ? "Memproses..." : "Terima Undangan"}
        </button>
      </form>
    </div>
  );
}
