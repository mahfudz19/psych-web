import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_guest/register/")({
  component: RegisterSelection,
});

function RegisterSelection() {
  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "4rem auto",
        padding: "2rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
        Pilih Tipe Akun
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Tombol ke Individual */}
        <Link
          to="/register/individual"
          style={{
            display: "block",
            padding: "1rem",
            border: "1px solid #007bff",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#333",
          }}
        >
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#007bff" }}>
            INDIVIDUAL
          </h3>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            Buat akun pribadi untuk mengikuti layanan psikotes.
          </p>
        </Link>

        {/* Tombol ke Organization */}
        <Link
          to="/register/organization"
          style={{
            display: "block",
            padding: "1rem",
            border: "1px solid #28a745",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#333",
          }}
        >
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#28a745" }}>
            ORGANIZATION
          </h3>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            Buat entitas perusahaan/organisasi untuk mengelola anggota.
          </p>
        </Link>
      </div>

      <div
        style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem" }}
      >
        Punya kode undangan? <br />
        Masuk via tautan khusus yang diberikan admin Anda.
      </div>
    </div>
  );
}
