// src/routes/_guest/register/index.tsx
import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../../utils/api";
import { AuthSplitLayout } from "../components/AuthSplitLayout";

export const Route = createFileRoute("/_guest/register/")({
  component: RegisterIndividual,
});

function RegisterIndividual() {
  const router = useRouter();
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
      router.navigate({ to: "/login" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <AuthSplitLayout
      title="Mulai Perjalanan Pengembangan Diri Anda."
      subtitle="Bergabung dengan ribuan profesional lainnya. Ikuti tes psikologi yang tervalidasi dan temukan potensi terbaik Anda."
      imagePosition="right" // Sesuai permintaan: Form di kiri, Gambar di kanan
    >
      <div className="mb-8">
        <h3 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
          Daftar Akun
        </h3>
        <p className="text-text-secondary text-sm mb-6">
          Pilih tipe akun yang sesuai dengan kebutuhan Anda.
        </p>

        {/* TAB TOGGLE: Pengganti Halaman Selection */}
        <div className="flex p-1 bg-divider/10 rounded-xl mb-2">
          <button className="flex-1 py-2 text-sm font-bold bg-bg-paper text-primary-main rounded-lg shadow-sm border border-divider transition-all">
            Individu
          </button>
          <Link
            to="/register/organization"
            className="flex-1 py-2 text-sm font-medium text-text-secondary text-center hover:text-text-primary transition-all"
          >
            Organisasi
          </Link>
        </div>
      </div>

      {registerMutation.isError && (
        <div className="mb-6 p-3.5 bg-error-main/10 border-l-4 border-error-main rounded-r-md">
          <p className="text-error-main text-xs font-semibold">
            Gagal mendaftar. Pastikan email belum digunakan dan data valid.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
            Nama Lengkap
          </label>
          <input
            type="text"
            placeholder="John Doe"
            required
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
            Email
          </label>
          <input
            type="email"
            placeholder="nama@email.com"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 justify-between">
            <span>Kode Referral</span>
            <span className="text-text-disabled font-normal normal-case">
              Opsional
            </span>
          </label>
          <input
            type="text"
            placeholder="Contoh: PSYCH2026"
            value={formData.referralCode}
            onChange={(e) =>
              setFormData({ ...formData, referralCode: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium uppercase"
          />
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full mt-4 py-3 px-4 bg-primary-main text-primary-contrast rounded-xl font-bold text-sm hover:bg-primary-dark active:scale-[0.99] focus:outline-none disabled:opacity-50 transition-all shadow-md shadow-primary-main/20"
        >
          {registerMutation.isPending ? "Memproses..." : "Daftar Akun Baru"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-divider text-left text-sm text-text-secondary">
        Sudah memiliki akun?{" "}
        <Link
          to="/login"
          className="text-primary-main font-bold hover:underline"
        >
          Masuk di sini
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
