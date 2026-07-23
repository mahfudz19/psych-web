import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/profile/",
)({
  beforeLoad: ({ context }) => {
    console.log("Context profil:", context);
  },
  component: ProfileInfoPage,
});

function ProfileInfoPage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Status tipe pengguna
  const isB2B = Boolean(user?.organizationId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Informasi profil berhasil diperbarui.");
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. KARTU HEADER IDENTITAS & AURA KLINIS */}
      <div className="p-6 rounded-3xl bg-bg-paper border border-divider shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary-main/10 text-primary-main border border-primary-main/20 flex items-center justify-center text-2xl font-black uppercase shadow-sm">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success-main border-2 border-bg-paper flex items-center justify-center text-[9px] text-white font-bold"
              title="Akun Terverifikasi"
            >
              ✓
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
                {user?.fullName || "Pengguna Aktif"}
              </h2>
            </div>
            <p className="text-xs font-medium text-text-secondary flex items-center gap-2">
              <span>{user?.email || "user@psycorp.test"}</span>
              <span>•</span>
              <span className="font-mono text-primary-main font-semibold">
                {isB2B
                  ? `Org ID: ${user?.organizationId}`
                  : "Kandidat Terverifikasi"}
              </span>
            </p>
          </div>
        </div>

        {/* Badge Status Akun */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-bg-default border border-divider text-left">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              Status Identitas
            </p>
            <p className="text-xs font-bold text-success-main flex items-center gap-1 mt-0.5">
              <span>🛡️</span> Siap Mengikuti Tes
            </p>
          </div>
        </div>
      </div>

      {/* 2. GRID FORMULIR DATA PERSONAL & DEMOGRAFI */}
      <div className="p-6 rounded-3xl bg-bg-paper border border-divider shadow-sm space-y-6">
        <div className="border-b border-divider pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Informasi Utama Kandidat
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Data ini digunakan untuk verifikasi ketersesuaian profil pada
              laporan psikogram Anda.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Nama Lengkap (Sesuai Identitas)
            </label>
            <input
              type="text"
              defaultValue={user?.fullName || ""}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-default border border-divider text-sm text-text-primary font-medium focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main outline-none transition-all"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          {/* Email (Readonly) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center justify-between">
              <span>Alamat Email</span>
              <span className="text-[10px] text-text-disabled lowercase">
                (tidak dapat diubah)
              </span>
            </label>
            <input
              type="email"
              disabled
              defaultValue={user?.email || ""}
              className="w-full px-4 py-2.5 rounded-xl bg-divider/10 border border-divider text-sm text-text-disabled font-medium cursor-not-allowed"
            />
          </div>

          {/* Nomor Telepon / WhatsApp */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Nomor WhatsApp / Telepon
            </label>
            <input
              type="tel"
              defaultValue="+62 812-3456-7890"
              className="w-full px-4 py-2.5 rounded-xl bg-bg-default border border-divider text-sm text-text-primary font-medium focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main outline-none transition-all"
              placeholder="Contoh: 08123456789"
            />
          </div>

          {/* Tingkat Pendidikan / Posisi Terakhir */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Pendidikan Terakhir
            </label>
            <select
              defaultValue="S1"
              className="w-full px-4 py-2.5 rounded-xl bg-bg-default border border-divider text-sm text-text-primary font-medium focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main outline-none transition-all cursor-pointer"
            >
              <option value="SMA">SMA / Sederajat</option>
              <option value="D3">Diploma (D3)</option>
              <option value="S1">Sarjana (S1 / D4)</option>
              <option value="S2">Magister (S2)</option>
              <option value="S3">Doktor (S3)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. PREFERENSI & NOTIFIKASI ASESMEN */}
      <div className="p-6 rounded-3xl bg-bg-paper border border-divider shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-divider pb-3">
          Preferensi Hasil Asesmen
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-2xl border border-divider bg-bg-default cursor-pointer hover:border-primary-main/40 transition-all">
            <div>
              <p className="text-xs font-bold text-text-primary">
                Notifikasi Hasil Tes via WhatsApp
              </p>
              <p className="text-[11px] text-text-secondary">
                Terima pemberitahuan langsung saat laporan hasil psikotes Anda
                selesai diproses.
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 accent-primary-main rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl border border-divider bg-bg-default cursor-pointer hover:border-primary-main/40 transition-all">
            <div>
              <p className="text-xs font-bold text-text-primary">
                Bahasa Laporan Psikogram Default
              </p>
              <p className="text-[11px] text-text-secondary">
                Pilih bahasa pengantar untuk rangkuman dan sertifikat hasil tes
                Anda.
              </p>
            </div>
            <span className="text-xs font-bold text-primary-main bg-primary-main/10 px-3 py-1 rounded-lg">
              Bahasa Indonesia
            </span>
          </label>
        </div>
      </div>

      {/* 4. TOMBOL AKSI UTAMA */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary-main text-primary-contrast shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isSaving ? "Menyimpan..." : "Simpan Perubahan Profil"}
        </button>
      </div>
    </form>
  );
}
