import { Link } from "@tanstack/react-router";
import { useGetAttempts } from "../../portal/-api/tests.query";
import type { Attempt } from "../../portal/-api/tests.type";

const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return {
        label: "Selesai",
        className: "bg-success-main/10 text-success-main",
      };
    case "IN_PROGRESS":
      return {
        label: "Berlangsung",
        className: "bg-warning-main/10 text-warning-main",
      };
    case "EXPIRED":
      return {
        label: "Kadaluarsa",
        className: "bg-error-main/10 text-error-main",
      };
    case "ABANDONED":
      return {
        label: "Dibatalkan",
        className: "bg-divider/40 text-text-secondary",
      };
    default:
      return {
        label: status,
        className: "bg-divider/20 text-text-secondary",
      };
  }
};

const Header = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-divider">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
          Riwayat & Hasil Asesmen
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Arsip lengkap seluruh tes psikologi yang telah Anda selesaikan beserta
          ringkasan hasilnya.
        </p>
      </div>
      <Link
        to="/portal"
        className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-text-secondary bg-divider/20 hover:bg-divider/40 transition-colors w-fit"
      >
        &larr; Kembali ke Portal
      </Link>
    </div>
  );
};

const Skeleton = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return <></>;

  return Array.from({ length: 3 }).map((_, index) => (
    <div
      key={index}
      className="p-6 rounded-3xl bg-bg-paper border border-divider flex flex-col md:flex-row md:items-center md:justify-between gap-6 animate-pulse"
    >
      <div className="space-y-3 flex-1">
        <div className="flex gap-2">
          <div className="h-4 w-16 bg-divider/60 rounded-full" />
          <div className="h-4 w-20 bg-divider/60 rounded-full" />
        </div>
        <div className="h-6 w-1/3 bg-divider/60 rounded-lg" />
        <div className="h-4 w-1/4 bg-divider/40 rounded-lg" />
        <div className="h-3 w-40 bg-divider/30 rounded-md pt-1" />
      </div>
      <div className="h-10 w-full sm:w-36 bg-divider/60 rounded-xl" />
    </div>
  ));
};

const ErrorPage = (props: { isError: boolean; refetch: () => void }) => {
  const { isError, refetch } = props;
  if (!isError) return <></>;

  return (
    <div className="p-12 text-center rounded-3xl bg-error-main/5 border border-error-main/20 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-error-main/10 flex items-center justify-center text-error-main text-xl">
        ⚠️
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-text-primary">
          Gagal Memuat Riwayat Tes
        </h3>
        <p className="text-sm text-text-secondary max-w-md">
          Terjadi masalah saat menghubungkan ke server. Silakan periksa koneksi
          Anda dan coba lagi.
        </p>
      </div>
      <button
        onClick={() => refetch()}
        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary-main text-primary-contrast hover:opacity-90 transition-all shadow-sm"
      >
        Coba Lagi
      </button>
    </div>
  );
};

const List = (props: { isError: boolean; historyItems: Attempt[] }) => {
  const { historyItems, isError } = props;
  if (isError) return <></>;

  if (historyItems.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-bg-paper border border-divider flex flex-col items-center justify-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-divider/20 flex items-center justify-center text-text-secondary text-2xl">
          📋
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-text-primary">
            Tidak Ada Tes Tersedia
          </h3>
          <p className="text-sm text-text-secondary max-w-sm">
            Saat ini belum ada katalog tes yang dipublikasikan atau ditugaskan
            untuk Anda.
          </p>
        </div>
      </div>
    );
  }

  return historyItems.map((item) => {
    const statusBadge = getStatusBadge(item.status);
    const isCompleted = item.status === "COMPLETED";
    const isInProgress = item.status === "IN_PROGRESS";

    return (
      <div
        key={item.id}
        className="p-6 rounded-3xl bg-bg-paper border border-divider hover:border-info-main/40 transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {/* Kode Tes */}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-info-main/10 text-info-main">
              {item.testCode}
            </span>

            {/* Status Attempt */}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadge.className}`}
            >
              {statusBadge.label}
            </span>

            {/* Percobaan ke-N */}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-divider/20 text-text-secondary">
              Percobaan #{item.attemptNumber}
            </span>
          </div>

          <h3 className="text-lg font-bold text-text-primary">
            {item.testName}
          </h3>

          {/* Progres Soal / Dijawab */}
          <p className="text-sm font-semibold text-text-secondary">
            Progress:{" "}
            <span className="text-text-primary">
              {item.answeredItems} / {item.totalItems} Soal Dijawab
            </span>
          </p>

          {/* Tanggal Pengerjaan */}
          <p className="text-xs text-text-disabled">
            {isCompleted
              ? `Selesai pada: ${formatDate(item.completedAt)}`
              : `Dimulai pada: ${formatDate(item.startedAt)}`}
          </p>
        </div>

        {/* Tombol Aksi Berdasarkan Status */}
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <Link
              to="/exam/result/$attemptId"
              params={{ attemptId: item.id }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-bg-default border border-divider text-text-primary hover:bg-divider/20 transition-all shadow-sm"
            >
              📄 Lihat Hasil
            </Link>
          ) : isInProgress ? (
            <Link
              to="/exam/$testId"
              params={{ testId: item.testId }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-warning-main text-white hover:opacity-90 transition-all shadow-sm"
            >
              ▶️ Lanjutkan Tes
            </Link>
          ) : (
            <span className="text-xs font-medium text-text-disabled italic">
              Sesi Berakhir
            </span>
          )}
        </div>
      </div>
    );
  });
};

export function TestHistoryPage() {
  const { data, isLoading, isError, refetch } = useGetAttempts();
  const historyItems = data?.data || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER HALAMAN */}
      <Header />

      {/* KONTEN RIWAYAT TES */}
      <div className="grid grid-cols-1 gap-4">
        <Skeleton isLoading={isLoading} />
        <ErrorPage isError={!isLoading && isError} refetch={refetch} />
        <List isError={isLoading && isError} historyItems={historyItems} />
      </div>
    </div>
  );
}
