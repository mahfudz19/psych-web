// src/routes/_guest/index.tsx
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_guest/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div style={{ textAlign: "center", marginTop: "10vh", padding: "0 2rem" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem", color: "#333" }}>
        Selamat Datang di @psych-web
      </h1>
      <p
        style={{
          fontSize: "1.2rem",
          color: "#666",
          marginBottom: "2rem",
          maxWidth: "600px",
          margin: "0 auto 2rem auto",
        }}
      >
        Platform layanan psikotes terintegrasi untuk kebutuhan pengembangan diri
        Anda dan manajemen evaluasi organisasi.
      </p>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <Link to="/login">
          <button
            style={{
              padding: "10px 20px",
              fontSize: "1rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Masuk ke Dashboard
          </button>
        </Link>
        <Link to="/register">
          <button
            style={{
              padding: "10px 20px",
              fontSize: "1rem",
              backgroundColor: "white",
              color: "#007bff",
              border: "1px solid #007bff",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Daftar Sekarang
          </button>
        </Link>
      </div>
    </div>
  );
}
