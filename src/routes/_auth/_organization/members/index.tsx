import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import toast from "../../../../components/ui/Toast";

export const Route = createFileRoute("/_auth/_organization/members/")({
  component: OrganizationMembersPage,
});

// --- TIPE DATA DUMMY ---
type Member = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
  joinedAt: string;
};

const MOCK_MEMBERS: Member[] = [
  {
    id: "usr_01",
    name: "Bondan Prakoso",
    email: "bondan@psycorp.test",
    role: "Owner",
    joinedAt: "12 Jan 2026",
  },
  {
    id: "usr_02",
    name: "Teguh Saputra",
    email: "teguh@psycorp.test",
    role: "Member",
    joinedAt: "15 Jan 2026",
  },
];

function OrganizationMembersPage() {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // --- HANDLER: KELUARKAN MEMBER ---
  const handleKickMember = (member: Member) => {
    if (member.role === "Owner") {
      toast.error("Anda tidak dapat mengeluarkan pemilik organisasi.");
      return;
    }

    if (
      window.confirm(
        `Apakah Anda yakin ingin mengeluarkan ${member.name} dari organisasi ini? Akses mereka akan segera dicabut.`,
      )
    ) {
      // Simulasi API Call
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      toast.success(`${member.name} telah berhasil dihapus dari organisasi.`);
    }
  };

  // --- HANDLER: SALIN LINK UNDANGAN (Mewakili konsep query Anda) ---
  const handleCopyInviteLink = (type: "inviteCode" | "organizationId") => {
    const baseUrl = window.location.origin + "/invite";

    // Konsep pembuatan link berdasarkan 2 cara yang Anda sebutkan
    const inviteUrl =
      type === "inviteCode"
        ? `${baseUrl}?inviteCode=PSY-ORG-X99Q`
        : `${baseUrl}?invitedOrganizationId=ORG-12345`;

    navigator.clipboard.writeText(inviteUrl);
    toast.success(`Tautan undangan via ${type} siap dibagikan.`);
    setIsInviteModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-divider">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Manajemen Anggota
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Kelola akses tim, undang rekan kerja, atau cabut hak akses dari
            organisasi Anda.
          </p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-primary-main text-primary-contrast shadow-sm hover:opacity-90 hover:-translate-y-0.5 transition-all w-fit"
        >
          <span>+</span> Undang Anggota
        </button>
      </div>

      {/* 2. TABEL DAFTAR ANGGOTA */}
      <div className="bg-bg-paper border border-divider rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-divider bg-divider/5 font-bold text-text-secondary uppercase tracking-wider text-xs">
                <th className="p-4 px-6">Informasi Anggota</th>
                <th className="p-4 px-6">Peran (Role)</th>
                <th className="p-4 px-6">Tanggal Bergabung</th>
                <th className="p-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-divider/5 transition-colors"
                >
                  {/* Kolom Profil */}
                  <td className="p-4 px-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-main/10 text-primary-main flex items-center justify-center font-bold uppercase shadow-sm">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-text-primary">
                        {member.name}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {member.email}
                      </p>
                    </div>
                  </td>

                  {/* Kolom Role */}
                  <td className="p-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        member.role === "Owner"
                          ? "bg-warning-main/10 text-warning-main"
                          : "bg-info-main/10 text-info-main"
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>

                  {/* Kolom Tanggal */}
                  <td className="p-4 px-6 text-text-secondary text-xs font-medium">
                    {member.joinedAt}
                  </td>

                  {/* Kolom Aksi */}
                  <td className="p-4 px-6 text-right">
                    <button
                      onClick={() => handleKickMember(member)}
                      disabled={member.role === "Owner"}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-error-main bg-error-main/10 hover:bg-error-main hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={
                        member.role === "Owner"
                          ? "Owner tidak dapat dikeluarkan"
                          : "Keluarkan anggota"
                      }
                    >
                      Keluarkan
                    </button>
                  </td>
                </tr>
              ))}

              {members.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-text-secondary"
                  >
                    Belum ada anggota di organisasi ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MODAL UNDANGAN SEDERHANA */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-bg-paper border border-divider rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
            {/* Tombol Tutup */}
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-5 right-5 text-text-secondary hover:text-text-primary"
            >
              ✕
            </button>

            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Undang ke Organisasi
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Pilih metode undangan yang ingin Anda gunakan. Tautan akan
                disalin ke *clipboard* Anda.
              </p>
            </div>

            <div className="space-y-3">
              {/* Metode 1: Invite Code */}
              <button
                onClick={() => handleCopyInviteLink("inviteCode")}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-divider hover:border-primary-main/50 hover:bg-primary-main/5 transition-all text-left group"
              >
                <div>
                  <p className="text-sm font-bold text-text-primary group-hover:text-primary-main transition-colors">
                    Gunakan Kode Undangan Khusus
                  </p>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Link berisi `?inviteCode=...`
                  </p>
                </div>
                <span className="text-lg">🔗</span>
              </button>

              {/* Metode 2: Organization ID */}
              <button
                onClick={() => handleCopyInviteLink("organizationId")}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-divider hover:border-info-main/50 hover:bg-info-main/5 transition-all text-left group"
              >
                <div>
                  <p className="text-sm font-bold text-text-primary group-hover:text-info-main transition-colors">
                    Gunakan ID Organisasi
                  </p>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Link berisi `?invitedOrganizationId=...`
                  </p>
                </div>
                <span className="text-lg">🏢</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
