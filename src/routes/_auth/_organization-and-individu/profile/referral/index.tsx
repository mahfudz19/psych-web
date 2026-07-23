import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/profile/referral/",
)({
  component: ReferralPage,
});

export function ReferralPage() {
  const [referralData, setReferralData] = useState({
    activeCode: "PSY-2026-X99Q",
    stats: {
      totalReferred: 5,
      activeRewards: "Diskon 20% Asesmen",
    },
    history: [
      {
        code: "PSY-OLD-110A",
        archivedAt: "10 Jan 2026",
        reason: "Regenerated",
        replacedBy: "PSY-2026-X99Q",
      },
    ],
  });

  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralData.activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (
      window.confirm(
        "Perbarui kode referral? Kode lama akan diarsipkan otomatis.",
      )
    ) {
      setIsRegenerating(true);
      setTimeout(() => {
        const oldCode = referralData.activeCode;
        const newCode = "PSY-2026-NEW" + Math.floor(100 + Math.random() * 900);

        setReferralData((prev) => ({
          ...prev,
          activeCode: newCode,
          history: [
            {
              code: oldCode,
              archivedAt: new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              reason: "Regenerated",
              replacedBy: newCode,
            },
            ...prev.history,
          ],
        }));
        setIsRegenerating(false);
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* GRID UTAMA: KODE AKTIF & STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Kolom 1-2: Kode Aktif */}
        <div className="md:col-span-2 p-5 rounded-3xl bg-bg-paper border border-divider shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] font-bold text-primary-main uppercase tracking-wider">
              Kode Aktif Saat Ini
            </span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-black font-mono tracking-wide text-text-primary bg-bg-default px-3 py-1.5 rounded-xl border border-divider">
                {referralData.activeCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-main text-primary-contrast hover:opacity-95 transition-all shadow-sm"
              >
                {copied ? "Disalin! ✓" : "Salin"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-divider">
            <span className="text-[11px] text-text-disabled">
              Kompatibilitas arsip otomatis aktif.
            </span>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="text-xs font-bold text-warning-main hover:underline disabled:opacity-50"
            >
              {isRegenerating ? "Memproses..." : "🔄 Regenerasi Kode"}
            </button>
          </div>
        </div>

        {/* Kolom 3: Statistik Singkat */}
        <div className="p-5 rounded-3xl bg-bg-paper border border-divider shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Total Direferensikan
            </p>
            <p className="text-xl font-extrabold text-text-primary mt-0.5">
              {referralData.stats.totalReferred}{" "}
              <span className="text-xs font-normal text-text-secondary">
                Orang
              </span>
            </p>
          </div>
          <div className="pt-2 border-t border-divider">
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Keuntungan
            </p>
            <p className="text-xs font-bold text-success-main mt-0.5 truncate">
              {referralData.stats.activeRewards}
            </p>
          </div>
        </div>
      </div>

      {/* TABEL RIWAYAT ARSIP */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Riwayat Arsip Kode
        </h2>

        <div className="bg-bg-paper border border-divider rounded-3xl overflow-hidden shadow-sm">
          {referralData.history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-divider bg-divider/10 font-bold text-text-secondary uppercase">
                    <th className="p-3 px-4">Kode Lama</th>
                    <th className="p-3 px-4">Tanggal Arsip</th>
                    <th className="p-3 px-4">Status</th>
                    <th className="p-3 px-4">Pengganti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {referralData.history.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-divider/5 transition-colors"
                    >
                      <td className="p-3 px-4 font-mono font-bold text-text-secondary line-through">
                        {item.code}
                      </td>
                      <td className="p-3 px-4 text-text-secondary">
                        {item.archivedAt}
                      </td>
                      <td className="p-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning-main/10 text-warning-main">
                          {item.reason}
                        </span>
                      </td>
                      <td className="p-3 px-4 font-mono font-bold text-primary-main">
                        {item.replacedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-text-secondary">
              Belum ada riwayat arsip kode referral.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
