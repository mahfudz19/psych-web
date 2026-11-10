import { Route } from "..";
import Card from "../../../../../../components/ui/Card";
import Chip from "../../../../../../components/ui/Chip";
import { useGetAttempt } from "../../../portal/-api/tests.query";
import type { AttemptResponse } from "../../../portal/-api/tests.type";

export default function HistoryDetailPage() {
  const { attemptId } = Route.useParams();
  const { data, isLoading, isError } = useGetAttempt(attemptId);
  const attempt = data?.data;

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-bg-paper rounded w-1/3"></div>
        <div className="h-32 bg-bg-paper rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-bg-paper rounded-xl"></div>
          <div className="h-24 bg-bg-paper rounded-xl"></div>
          <div className="h-24 bg-bg-paper rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (isError || !attempt) {
    return (
      <div className="p-8 max-w-6xl mx-auto text-center space-y-4">
        <div className="p-6 bg-error-main/10 border border-error-main/20 rounded-xl text-error-main max-w-md mx-auto">
          Gagal memuat detail riwayat tes. Silakan coba lagi nanti.
        </div>
      </div>
    );
  }

  // Ringkasan kalkulasi
  const totalItems = attempt.sections.reduce(
    (acc, sec) => acc + sec.itemCount,
    0,
  );
  const totalAnswered = attempt.sections.reduce(
    (acc, sec) => acc + sec.answeredCount,
    0,
  );
  const overallProgress =
    totalItems > 0 ? Math.round((totalAnswered / totalItems) * 100) : 0;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 bg-bg-default text-text-primary min-h-screen">
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-divider pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-main/10 text-primary-main border border-primary-main/20">
              Attempt #{attempt.attemptNumber}
            </span>
            <span className="text-xs text-text-secondary font-mono">
              Code: {attempt.testCode} (v{attempt.testVersion})
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
            {attempt.testName}
          </h1>
        </div>

        {/* Status Badge */}
        <div>
          <StatusBadge status={attempt.status} />
        </div>
      </div>

      {/* OVERVIEW STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 space-y-1">
          <p className="text-xs font-medium uppercase text-text-secondary">
            Total Subtes
          </p>
          <p className="text-2xl font-bold">
            {attempt.sections.length} Section
          </p>
        </Card>
        <Card className="p-5 space-y-1">
          <p className="text-xs font-medium uppercase text-text-secondary">
            Soal Terjawab
          </p>
          <p className="text-2xl font-bold">
            {totalAnswered}{" "}
            <span className="text-sm font-normal text-text-secondary">
              / {totalItems} Soal
            </span>
          </p>
        </Card>
        <Card className="p-5 space-y-1">
          <p className="text-xs font-medium uppercase text-text-secondary">
            Kemajuan Keseluruhan
          </p>
          <div className="flex items-center gap-3">
            <p className="text-2xl font-bold">{overallProgress}%</p>
            <div className="flex-1 bg-bg-default h-2.5 rounded-full overflow-hidden border border-divider">
              <div
                className="bg-primary-main h-full rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* METADATA WAKTU */}
      <Card className="p-4 flex flex-wrap gap-6 text-xs text-text-secondary">
        <div>
          <span className="font-semibold text-text-primary">Waktu Mulai:</span>{" "}
          {attempt.startedAt ? formatDate(attempt.startedAt) : "-"}
        </div>
        <div>
          <span className="font-semibold text-text-primary">
            Waktu Selesai:
          </span>{" "}
          {attempt.completedAt ? formatDate(attempt.completedAt) : "-"}
        </div>
      </Card>

      {/* SECTIONS LIST */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">
          Rincian Subtes (Sections)
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {attempt.sections
            .sort((a, b) => a.order - b.order)
            .map((section) => {
              const secProgress =
                section.itemCount > 0
                  ? Math.round(
                      (section.answeredCount / section.itemCount) * 100,
                    )
                  : 0;

              return (
                <Card
                  key={section.sectionId}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary-main/30 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-secondary px-2 py-0.5 rounded bg-bg-default border border-divider">
                        #{section.order}
                      </span>
                      <h3 className="font-semibold text-base">
                        {section.name}
                      </h3>
                      <span className="text-xs text-text-disabled">
                        ({section.code})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary pt-1">
                      <span>
                        Waktu Per Subtes:{" "}
                        <strong className="text-text-primary">
                          {section.timeLimitSeconds
                            ? `${Math.floor(section.timeLimitSeconds / 60)} menit`
                            : "Tidak Ada Batas"}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Navigasi:{" "}
                        <strong className="text-text-primary capitalize">
                          {section.navigationPolicy.toLowerCase()}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Progress & Status */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-60">
                    <div className="w-full sm:w-36 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">Terjawab</span>
                        <span className="font-medium">
                          {section.answeredCount}/{section.itemCount}
                        </span>
                      </div>
                      <div className="w-full bg-bg-default h-2 rounded-full overflow-hidden border border-divider">
                        <div
                          className="bg-primary-main h-full transition-all duration-300"
                          style={{ width: `${secProgress}%` }}
                        />
                      </div>
                    </div>

                    <SectionStatusBadge status={section.status} />
                  </div>
                </Card>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// Component helper untuk status badge attempt
function StatusBadge({ status }: { status: string }) {
  const isCompleted = status === "COMPLETED";
  const isInProgress = status === "IN_PROGRESS";

  return (
    <Chip
      variant="contained"
      color={isCompleted ? "success" : isInProgress ? "warning" : "info"}
    >
      {status}
    </Chip>
  );
}

// Component helper untuk status badge section
function SectionStatusBadge({
  status,
}: {
  status: AttemptResponse["sections"][number]["status"];
}) {
  const styles = {
    COMPLETED: "success",
    IN_PROGRESS: "warning",
    EXPIRED: "error",
    NOT_STARTED: "default",
  } as const;

  return <Chip color={styles[status]}>{status.replace("_", " ")}</Chip>;
}

// Utility format tanggal
function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return dateStr;
  }
}
