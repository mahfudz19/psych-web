import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useGetAttempts, useGetCatalog } from "../-api/tests.query";

interface AttemptRow {
  id: string;
  status: string;
  testName?: string | null;
  testCode?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  answeredItems?: number | null;
  totalItems?: number | null;
  scoringStatus?: string | null;
}

function readList(res: unknown): AttemptRow[] {
  const list = (res as { data?: unknown } | null | undefined)?.data;
  return Array.isArray(list) ? (list as AttemptRow[]) : [];
}

function readPage(res: unknown): {
  totalElements: number | null;
  totalPages: number | null;
} {
  const page = (
    res as
      | { page?: { totalElements?: unknown; totalPages?: unknown } }
      | null
      | undefined
  )?.page;
  return {
    totalElements:
      typeof page?.totalElements === "number" ? page.totalElements : null,
    totalPages: typeof page?.totalPages === "number" ? page.totalPages : null,
  };
}

function useDisplayName(): string | undefined {
  return undefined;
}

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : dateFormat.format(d);
}

const STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: "Sedang berjalan",
  COMPLETED: "Selesai",
  ABANDONED: "Ditinggalkan",
  EXPIRED: "Kedaluwarsa",
};

const STATUS_STYLE: Record<string, string> = {
  IN_PROGRESS: "bg-warning-main/10 text-warning-main",
  COMPLETED: "bg-success-main/10 text-success-main",
  ABANDONED: "bg-divider text-text-secondary",
  EXPIRED: "bg-divider text-text-secondary",
};

function statusLabel(a: AttemptRow): string {
  if (a.status === "COMPLETED") {
    if (a.scoringStatus === "PENDING") return "Selesai · menunggu penilaian";
    if (a.scoringStatus === "DONE") return "Selesai · laporan tersedia";
  }
  return STATUS_LABEL[a.status] ?? a.status;
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-divider/60 ${className}`} />
  );
}

function BlockError({
  onRetry,
  message = "Gagal memuat data.",
}: {
  onRetry: () => void;
  message?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs text-text-secondary">
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="font-bold text-primary-main hover:underline"
      >
        Coba lagi
      </button>
    </div>
  );
}

function Arrow() {
  return (
    <span className="transform group-hover:translate-x-1 transition-transform">
      &rarr;
    </span>
  );
}

interface PendingCardProps {
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  pending: AttemptRow | null;
  otherPending: number;
  hasHistory: boolean;
}

function PendingCard({
  loading,
  error,
  onRetry,
  pending,
  otherPending,
  hasHistory,
}: PendingCardProps) {
  let body: ReactNode;

  if (loading) {
    body = (
      <div className="space-y-3 w-full">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    );
  } else if (error) {
    body = (
      <BlockError onRetry={onRetry} message="Gagal memuat tes yang tertunda." />
    );
  } else if (pending) {
    const answered = pending.answeredItems ?? 0;
    const total = pending.totalItems ?? 0;
    const percent =
      total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0;

    body = (
      <>
        <div className="relative z-10 flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-warning-main/10 text-warning-main uppercase tracking-wider">
              Perlu Diselesaikan
            </span>
          </div>
          <h2 className="text-xl font-bold text-text-primary truncate">
            {pending.testName ?? "Tes tanpa nama"}
          </h2>
          <p className="text-xs text-text-secondary mt-1.5">
            Dimulai {formatDate(pending.startedAt)}
          </p>

          {total > 0 && (
            <div className="mt-4 max-w-sm">
              <div className="flex justify-between text-[11px] text-text-secondary mb-1.5">
                <span>
                  {answered} dari {total} soal terjawab
                </span>
                <span className="font-bold text-text-primary">{percent}%</span>
              </div>
              <div
                className="h-2 rounded-full bg-divider overflow-hidden"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progres pengerjaan"
              >
                <div
                  className="h-full rounded-full bg-primary-main transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}

          <p className="mt-3 text-[11px] text-text-secondary leading-relaxed">
            Jawaban Anda tersimpan otomatis. Subtes yang dibatasi waktu tetap
            berjalan walau halaman ditutup.
          </p>
          {otherPending > 0 && (
            <Link
              to="/test-history"
              className="mt-2 inline-block text-[11px] font-bold text-primary-main hover:underline"
            >
              {otherPending} tes tertunda lainnya
            </Link>
          )}
        </div>

        {/* TODO: arahkan ke halaman pengerjaan attempt ini setelah rutenya ada */}
        <Link
          to="/test"
          className="relative z-10 w-full sm:w-auto text-center px-8 py-3.5 rounded-xl text-sm font-bold bg-primary-main text-primary-contrast shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
        >
          Lanjutkan &rarr;
        </Link>
      </>
    );
  } else {
    body = (
      <>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-success-main/10 text-success-main uppercase tracking-wider">
              {hasHistory ? "Semua Selesai" : "Mulai Dari Sini"}
            </span>
          </div>
          <h2 className="text-xl font-bold text-text-primary">
            {hasHistory
              ? "Tidak ada tes yang tertunda"
              : "Anda belum mengerjakan tes apa pun"}
          </h2>
          <p className="text-xs text-text-secondary mt-1.5 leading-relaxed max-w-md">
            {hasHistory
              ? "Pilih tes baru dari katalog kapan pun Anda siap."
              : "Jelajahi katalog dan pilih tes pertama Anda."}
          </p>
        </div>
        <Link
          to="/test"
          className="relative z-10 w-full sm:w-auto text-center px-8 py-3.5 rounded-xl text-sm font-bold bg-primary-main text-primary-contrast shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
        >
          {hasHistory ? "Pilih Tes Baru" : "Lihat Katalog"} &rarr;
        </Link>
      </>
    );
  }

  return (
    <div className="p-1 rounded-3xl bg-linear-to-br from-primary-main via-primary-main/80 to-info-main shadow-lg">
      <div className="p-6 sm:p-8 rounded-[22px] bg-bg-paper relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {body}
        {/* Ornamen Latar */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-primary-main/5 rounded-bl-full pointer-events-none" />
      </div>
    </div>
  );
}

export default function PortalDashboard() {
  const catalog = useGetCatalog();
  const attemptsQuery = useGetAttempts();
  const userName = useDisplayName();

  // --- katalog ---
  const catalogTotal =
    readPage(catalog.data).totalElements ?? readList(catalog.data).length;

  // --- attempt milik user, terbaru lebih dulu ---
  const attempts = [...readList(attemptsQuery.data)].sort((a, b) =>
    (b.startedAt ?? "").localeCompare(a.startedAt ?? ""),
  );
  const { totalPages } = readPage(attemptsQuery.data);
  // Jika riwayat lebih dari satu halaman, hitungan di bawah hanya mencakup halaman yang dimuat.
  const hasMore = (totalPages ?? 1) > 1;
  const suffix = hasMore ? "+" : "";

  const inProgress = attempts.filter((a) => a.status === "IN_PROGRESS");
  const completedCount = attempts.filter(
    (a) => a.status === "COMPLETED",
  ).length;
  const pending = inProgress[0] ?? null;
  const recent = attempts.slice(0, 3);

  const firstName = userName?.trim().split(" ")[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-divider">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary-main/10 text-primary-main mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-main animate-pulse" />
            Portal Kandidat Aktif
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            {`Selamat Datang${firstName ? `, ${firstName}` : ""}!`}
          </h1>
          <p className="text-sm text-text-secondary mt-2 max-w-2xl leading-relaxed">
            {pending
              ? `Anda memiliki ${inProgress.length} tes yang belum selesai. Lanjutkan dari titik terakhir saat Anda siap.`
              : "Persiapkan diri Anda dalam lingkungan yang tenang dan bebas distraksi sebelum memulai rangkaian evaluasi psikologi hari ini."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KOLOM KIRI */}
        <div className="lg:col-span-2 space-y-6">
          {/* A. KARTU UTAMA */}
          <PendingCard
            loading={attemptsQuery.isLoading}
            error={attemptsQuery.isError}
            onRetry={() => void attemptsQuery.refetch()}
            pending={pending}
            otherPending={Math.max(0, inProgress.length - 1)}
            hasHistory={attempts.length > 0}
          />

          {/* B. KATALOG & RIWAYAT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/test"
              className="group p-6 rounded-3xl bg-bg-paper border border-divider hover:border-primary-main/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-bg-default border border-divider flex items-center justify-center text-xl group-hover:bg-primary-main/10 group-hover:border-primary-main/20 transition-colors">
                    📚
                  </div>
                  {catalog.isLoading ? (
                    <Skeleton className="h-5 w-16" />
                  ) : (
                    !catalog.isError &&
                    catalogTotal > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-main/10 text-primary-main">
                        {catalogTotal} tes
                      </span>
                    )
                  )}
                </div>
                <h3 className="text-base font-bold text-text-primary group-hover:text-primary-main transition-colors">
                  Katalog Tes Tersedia
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                  Jelajahi seluruh inventaris asesmen mandiri dan pilih tes yang
                  sesuai dengan kebutuhan Anda.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-2 text-[11px] font-bold text-primary-main uppercase tracking-wider">
                <span>Lihat Katalog</span>
                <Arrow />
              </div>
            </Link>

            <Link
              to="/test-history"
              className="group p-6 rounded-3xl bg-bg-paper border border-divider hover:border-info-main/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-bg-default border border-divider flex items-center justify-center text-xl mb-4 group-hover:bg-info-main/10 group-hover:border-info-main/20 transition-colors">
                  📊
                </div>
                <h3 className="text-base font-bold text-text-primary group-hover:text-info-main transition-colors">
                  Riwayat &amp; Laporan
                </h3>

                {attemptsQuery.isLoading ? (
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                ) : attemptsQuery.isError ? (
                  <p className="text-xs text-text-secondary mt-1.5">
                    Riwayat belum bisa dimuat saat ini.
                  </p>
                ) : recent.length === 0 ? (
                  <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                    Belum ada tes yang dikerjakan. Riwayat dan laporan Anda akan
                    muncul di sini.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {recent.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-text-primary truncate">
                            {a.testName ?? "Tes tanpa nama"}
                          </p>
                          <p className="text-[11px] text-text-secondary">
                            {formatDate(a.completedAt ?? a.startedAt)}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            STATUS_STYLE[a.status] ??
                            "bg-divider text-text-secondary"
                          }`}
                        >
                          {statusLabel(a)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-5 flex items-center gap-2 text-[11px] font-bold text-info-main uppercase tracking-wider">
                <span>Buka Riwayat</span>
                <Arrow />
              </div>
            </Link>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="space-y-6">
          {/* Rangkuman Aktivitas */}
          <div className="p-6 rounded-3xl bg-bg-paper border border-divider shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-divider pb-3">
              Rangkuman Aktivitas
            </h3>

            {attemptsQuery.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : attemptsQuery.isError ? (
              <BlockError onRetry={() => void attemptsQuery.refetch()} />
            ) : attempts.length === 0 ? (
              <p className="text-xs text-text-secondary leading-relaxed">
                Belum ada aktivitas. Mulai tes pertama Anda dari katalog.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success-main/10 text-success-main flex items-center justify-center text-sm">
                      ✓
                    </div>
                    <span className="text-sm font-semibold text-text-secondary">
                      Tes Selesai
                    </span>
                  </div>
                  <span className="text-lg font-black text-text-primary">
                    {completedCount}
                    {suffix}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warning-main/10 text-warning-main flex items-center justify-center text-sm">
                      ⏳
                    </div>
                    <span className="text-sm font-semibold text-text-secondary">
                      Tes Tertunda
                    </span>
                  </div>
                  <span className="text-lg font-black text-text-primary">
                    {inProgress.length}
                    {suffix}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tips Persiapan */}
          <div className="p-6 rounded-3xl bg-bg-default border border-divider">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>💡</span> Tips Persiapan
            </h3>
            <ul className="space-y-3">
              {pending && (
                <li className="text-xs text-text-secondary leading-relaxed flex items-start gap-2">
                  <span className="text-primary-main mt-0.5">•</span>
                  Anda punya tes yang belum selesai. Lanjutkan saat waktu Anda
                  cukup, karena subtes berwaktu tidak bisa dijeda.
                </li>
              )}
              <li className="text-xs text-text-secondary leading-relaxed flex items-start gap-2">
                <span className="text-primary-main mt-0.5">•</span>
                Pastikan koneksi internet Anda stabil sebelum memulai ujian.
              </li>
              <li className="text-xs text-text-secondary leading-relaxed flex items-start gap-2">
                <span className="text-primary-main mt-0.5">•</span>
                Kerjakan tes secara jujur, tidak ada jawaban benar atau salah
                dalam tes kepribadian.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
