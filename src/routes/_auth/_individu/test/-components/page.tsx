import { Link } from "@tanstack/react-router";
import { useGetCatalog } from "../../portal/-api/tests.query";
import type { TestCatalog } from "../../portal/-api/tests.type";

const Header = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-divider">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
          Katalog & Penugasan Tes
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Pilih asesmen yang ingin Anda kerjakan atau selesaikan daftar tes
          wajib dari institusi Anda.
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
        <div className="h-4 w-20 bg-divider/60 rounded-full" />
        <div className="h-6 w-1/3 bg-divider/60 rounded-lg" />
        <div className="h-4 w-3/4 bg-divider/40 rounded-lg" />
        <div className="flex gap-4 pt-1">
          <div className="h-4 w-24 bg-divider/40 rounded-md" />
          <div className="h-4 w-28 bg-divider/40 rounded-md" />
        </div>
      </div>
      <div className="h-11 w-full sm:w-36 bg-divider/60 rounded-xl" />
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
          Gagal Memuat Katalog Tes
        </h3>
        <p className="text-sm text-text-secondary max-w-md">
          Terjadi kesalahan saat mengambil data dari server. Silakan periksa
          koneksi internet Anda dan coba lagi.
        </p>
      </div>
      <button
        onClick={refetch}
        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary-main text-primary-contrast hover:opacity-90 transition-all shadow-sm"
      >
        Coba Lagi
      </button>
    </div>
  );
};

const List = (props: { isError: boolean; availableTests: TestCatalog[] }) => {
  const { availableTests, isError } = props;
  if (isError) return <></>;

  if (availableTests.length === 0) {
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

  return availableTests.map((test) => (
    <div
      key={test.id}
      className="p-6 rounded-3xl bg-bg-paper border border-divider hover:border-primary-main/50 transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-main/10 text-primary-main">
            {test.category}
          </span>
        </div>

        <h3 className="text-lg font-bold text-text-primary">{test.name}</h3>

        {test.description && (
          <p className="text-sm text-text-secondary line-clamp-2 max-w-2xl">
            {test.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-text-secondary font-medium pt-1">
          <span>
            ⏱️{" "}
            {test.estimatedMinutes > 0
              ? `${test.estimatedMinutes} Menit`
              : "Tanpa Batas Waktu"}
          </span>

          <span>📝 {test.totalItems} Soal Evaluasi</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/exam/$testId"
          params={{ testId: test.id }}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold bg-primary-main text-primary-contrast hover:opacity-90 shadow-sm transition-all whitespace-nowrap"
        >
          Mulai Tes Sekarang
        </Link>
      </div>
    </div>
  ));
};

export default function TestCatalogPage() {
  const { data, isLoading, isError, refetch } = useGetCatalog();
  const availableTests = data?.data || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Header />

      <div className="grid grid-cols-1 gap-4">
        <Skeleton isLoading={isLoading} />
        <ErrorPage isError={!isLoading && isError} refetch={refetch} />
        <List isError={isLoading && isError} availableTests={availableTests} />
      </div>
    </div>
  );
}
