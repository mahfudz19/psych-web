import { createFileRoute } from "@tanstack/react-router";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import Label from "../../../../../components/ui/Label";
import toast from "../../../../../components/ui/Toast";
import { useChangePasswordMutation } from "../../../../_guest/-api/auth.query";
import PasswordFields, {
  requirements,
} from "../../../../_guest/register/-components/PassWordFields";
import { useState } from "react";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/profile/change-password/",
)({
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const changePasswordMutation = useChangePasswordMutation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordsMatch = password === confirmPassword;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Ambil elemen form
    const form = e.currentTarget;

    // 2. Ekstrak data tanpa useState
    const formData = new FormData(form);
    const oldPassword = formData.get("oldPassword") as string;
    const newPassword = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // 3. Validasi manual (Klien)
    if (newPassword !== confirmPassword) {
      return toast.error("Konfirmasi kata sandi baru tidak cocok!");
    }

    if (newPassword.length < 8) {
      return toast.error("Kata sandi baru minimal 8 karakter!");
    }

    // 4. Eksekusi Mutasi
    changePasswordMutation.mutate(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          // Bersihkan form secara otomatis dari DOM setelah sukses
          form.reset();
        },
      },
    );
  };

  return (
    <div className="max-w-md bg-bg-paper p-6 rounded-3xl border border-divider shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
          Ubah Kata Sandi
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Pastikan menggunakan kata sandi yang kuat dan belum pernah Anda
          gunakan di situs lain.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="oldPassword">Kata Sandi Saat Ini *</Label>
          <Input
            id="oldPassword"
            name="oldPassword"
            type="password"
            required
            className="w-full"
            placeholder="Masukkan kata sandi lama"
          />
        </div>

        <PasswordFields
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          requirements={requirements(password)}
          passwordsMatch={passwordsMatch}
        />

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            loading={changePasswordMutation.isPending}
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending
              ? "Menyimpan..."
              : "Perbarui Kata Sandi"}
          </Button>
        </div>
      </form>
    </div>
  );
}
