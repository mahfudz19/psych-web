import { createFileRoute } from "@tanstack/react-router";
import FieldInputImage from "../../../../components/reusebale-components/FieldInputImage";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import InputDate from "../../../../components/ui/InputDate";
import Label from "../../../../components/ui/Label";
import Textarea from "../../../../components/ui/Textarea";
import toast from "../../../../components/ui/Toast";
import { useAuthStore } from "../../../../utils/authStore";
import { useAvatarUploadMutation } from "./-api/avatar.query";
import { useUpdateProfileMutation } from "./-api/profile.query";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/profile/",
)({
  component: ProfileInfoPage,
});

const ChangeAvatar = () => {
  const { user } = useAuthStore();
  const avatarMutation = useAvatarUploadMutation();

  const handleAvatarChange = (file: File | null) => {
    if (!file) {
      avatarMutation.mutate(
        { file: null, user },
        {
          onSuccess: () => toast.success("Foto profil berhasil dihapus"),
          onError: () => toast.error("Gagal menghapus foto profil"),
        },
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) return toast.error("Maksimal 2MB");
    if (!file.type.startsWith("image/"))
      return toast.error("File harus berupa gambar");

    const objectUrl = URL.createObjectURL(file);

    avatarMutation.mutate(
      { file, user },
      {
        onSettled: () => URL.revokeObjectURL(objectUrl),
        onError: () => toast.error("Gagal memperbarui foto profil"),
      },
    );
  };

  const displayImage = user?.profilePicture;

  return (
    <FieldInputImage
      defaultImage={displayImage}
      onSave={(_, data) => handleAvatarChange(data)}
      width={255}
      height={255}
      limitSize={2 * 1024 * 1024}
      shape="rounded"
      error={Boolean(avatarMutation.error)}
    />
  );
};

const FormInputs = () => {
  const { user } = useAuthStore();

  const updateProfileMutation = useUpdateProfileMutation();

  const handleSave = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const fullName = (data.get("fullName") as string)?.trim();
    const phone = (data.get("phone") as string)?.trim();
    const gender = data.get("gender") as "male" | "female";
    const rawDob = data.get("dateOfBirth") as string;
    const bio = (data.get("bio") as string)?.trim();

    if (!fullName) return toast.error("Nama lengkap wajib diisi");
    const dateOfBirth = rawDob ? rawDob.split("T")[0] : undefined;

    updateProfileMutation.mutate({
      fullName,
      phone,
      gender,
      dateOfBirth,
      bio,
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* FORM INPUTS */}
      <div className="p-6 rounded-3xl bg-bg-paper border border-divider shadow-sm space-y-6">
        <div className="border-b border-divider pb-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Informasi Utama Kandidat
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Data ini digunakan untuk verifikasi ketersesuaian profil pada
            laporan psikogram Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Nama Lengkap *</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={user?.fullName || ""}
              placeholder="Masukkan nama lengkap"
              className="w-full"
              required
            />
          </div>

          {/* Email (Readonly) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="email">Alamat Email</Label>
              <span className="text-[10px] text-text-disabled lowercase">
                (tidak dapat diubah)
              </span>
            </div>
            <Input
              id="email"
              type="email"
              disabled
              defaultValue={user?.email || ""}
              className="w-full bg-divider/10 cursor-not-allowed"
            />
          </div>

          {/* Nomor Telepon */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Nomor WhatsApp / Telepon</Label>
            <Input
              id="phone"
              type="tel"
              name="phone"
              defaultValue={user?.phone || ""}
              placeholder="Contoh: 08123456789"
              className="w-full"
            />
          </div>

          {/* Jenis Kelamin */}
          <div className="space-y-1.5">
            <Label htmlFor="gender">Jenis Kelamin</Label>
            <select
              id="gender"
              name="gender"
              defaultValue={user?.gender || "male"}
              className="w-full px-4 py-2.5 rounded-2xl bg-bg-default border border-divider text-sm text-text-primary font-medium focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main outline-none transition-all cursor-pointer"
            >
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
          </div>

          {/* Tanggal Lahir */}
          <div className="space-y-1.5">
            <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
            <InputDate
              id="dateOfBirth"
              name="dateOfBirth"
              value={user?.dateOfBirth || ""}
              className="w-full"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={user?.bio || ""}
              rows={3}
              placeholder="Tuliskan bio singkat..."
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="submit" disabled={updateProfileMutation.isPending}>
          {updateProfileMutation.isPending
            ? "Menyimpan..."
            : "Simpan Perubahan Profil"}
        </Button>
      </div>
    </form>
  );
};

function ProfileInfoPage() {
  const { user } = useAuthStore();

  const isB2B = Boolean(user?.organizationId);

  return (
    <div className="flex flex-col md:flex-row gap-6 md:items-start">
      {/* KOLOM KIRI: Kartu Identitas & Avatar (Sidebar Profil) */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <div className="p-6 rounded-3xl bg-bg-paper border border-divider shadow-sm flex flex-col items-center text-center">
          <ChangeAvatar />

          <div className="mt-4 space-y-1">
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
              {user?.fullName || "Pengguna Aktif"}
            </h2>
            <p className="text-sm font-medium text-text-secondary">
              {user?.email || "user@psycorp.test"}
            </p>
          </div>

          <div className="mt-6 w-full pt-6 border-t border-divider flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary font-medium">Tipe Akun</span>
              <span className="font-mono text-primary-main font-semibold">
                {isB2B ? `B2B (${user?.organizationId})` : "Kandidat Individu"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary font-medium">Status</span>
              <span className="font-bold text-success-main flex items-center gap-1">
                🛡️ Siap Tes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KOLOM KANAN: Form Inputs (Mengambil sisa ruang) */}
      <div className="w-full md:w-2/3">
        <FormInputs />
      </div>
    </div>
  );
}
