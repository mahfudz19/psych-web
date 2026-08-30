import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForgotPasswordMutation } from "../-api/auth.query";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

export const Route = createFileRoute("/_guest/forgot-password/")({
  component: ForgotPasswordPage,
});
function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const mutation = useForgotPasswordMutation();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    mutation.mutate(email, { onSuccess: () => setIsSuccess(true) });
  };

  return (
    <>
      {!isSuccess ? (
        <>
          <h2 className="text-2xl font-extrabold text-text-primary mb-2">
            Lupa Kata Sandi?
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur
            ulang kata sandi.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 text-left"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Email Akun
              </label>
              <Input
                type="email"
                placeholder="nama@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="mt-2"
            >
              {mutation.isPending ? "Mengirim..." : "Kirim Tautan Reset"}
            </Button>
          </form>
        </>
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-main/10 text-success-main">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary mb-2">
            Cek Email Anda
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Jika email <b>{email}</b> terdaftar di sistem kami, tautan reset
            kata sandi telah dikirim.
          </p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-divider">
        <Link
          to="/login"
          preload={false}
          className="text-sm font-bold text-primary-main hover:underline"
        >
          Kembali ke Halaman Login
        </Link>
      </div>
    </>
  );
}
