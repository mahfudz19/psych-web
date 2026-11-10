import { Link } from "@tanstack/react-router";

function CompletedCard({ testName }: { testName: string }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center space-y-5 rounded-3xl border border-divider bg-bg-paper p-10 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-main/10 text-2xl text-success-main">
        ✓
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-extrabold text-text-primary">
          Tes selesai
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-text-secondary">
          Jawaban Anda untuk{" "}
          <span className="font-semibold text-text-primary">{testName}</span>{" "}
          sudah tersimpan. Hasil akan tersedia setelah proses penilaian.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/test-history"
          className="rounded-xl bg-primary-main px-6 py-2.5 text-xs font-bold text-primary-contrast shadow-sm hover:opacity-90"
        >
          Lihat Riwayat
        </Link>
        <Link
          to="/portal"
          className="rounded-xl bg-divider/20 px-6 py-2.5 text-xs font-bold text-text-secondary hover:bg-divider/40"
        >
          Kembali ke Portal
        </Link>
      </div>
    </div>
  );
}

export default CompletedCard;
