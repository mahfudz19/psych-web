import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useResetPasswordMutation } from "../-api/auth.query";
import Button from "../../../components/ui/Button";
import PassworfField from "../-components/PassworfField";

export const Route = createFileRoute("/_guest/reset-password/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: search.token as string | undefined,
    };
  },
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const [newPassword, setNewPassword] = useState("");
  const mutation = useResetPasswordMutation();

  // Jika tidak ada token di URL, tampilkan error
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-default p-4">
        <div className="w-full max-w-md bg-bg-paper p-8 rounded-3xl shadow-sm border border-divider text-center">
          <h2 className="text-2xl font-extrabold text-error-main mb-2">
            Tautan Tidak Valid
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Tautan reset password ini tidak valid atau tidak memiliki token.
          </p>
          <Link to="/forgot-password">
            <Button className="w-full">Minta Tautan Baru</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPassword) return;
    mutation.mutate({ token, newPassword });
  };

  return (
    <>
      <h2 className="text-2xl font-extrabold text-text-primary mb-2">
        Buat Kata Sandi Baru
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        Silakan masukkan kata sandi baru untuk akun Anda.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
            Kata Sandi Baru
          </label>
          <PassworfField
            name="newPassword"
            placeholder="Masukkan kata sandi baru"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          disabled={mutation.isPending || newPassword.length < 8}
          className="mt-2"
        >
          {mutation.isPending ? "Menyimpan..." : "Simpan Kata Sandi"}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-divider">
        <Link
          to="/login"
          className="text-sm font-bold text-text-secondary hover:text-text-primary hover:underline"
        >
          Batal dan kembali ke Login
        </Link>
      </div>
    </>
  );
}
