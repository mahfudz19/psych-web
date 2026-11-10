import { Outlet, useNavigate } from "@tanstack/react-router";
import { useGetAttempt, useStartOrResumeAttempt } from "../-api/exam.api";
import { unwrap, type AttemptState } from "../-api/exam.types";
import DialogConfirmAction from "../../../../components/reusebale-components/dialog/DialogConfirmAction";
import Button from "../../../../components/ui/Button";
import { Route } from "../../_exam/exam/$testId";

const Header = () => {
  const navigate = useNavigate();
  const { testId } = Route.useParams();

  const { data, isError } = useStartOrResumeAttempt(testId);

  const attemptId = unwrap<AttemptState>(data?.data)?.id ?? "";

  const attemptQuery = useGetAttempt(attemptId, attemptId !== "");
  const attempt = unwrap<AttemptState>(attemptQuery.data);

  const validate =
    isError ||
    attemptId === "" ||
    attemptQuery.isLoading ||
    attemptQuery.isError ||
    !attempt;

  if (validate) {
    return (
      <header className="h-16 bg-bg-paper border-b border-divider px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="h-6 w-32 rounded-full bg-divider/60" />
        <div className="h-6 w-2/3 rounded-lg bg-divider/60" />
        <div className="h-6 w-32 rounded-full bg-divider/60" />
      </header>
    );
  }

  const sections = [...attempt.sections].sort((a, b) => a.order - b.order);

  const doneCount = sections.filter(
    (s) => s.status === "COMPLETED" || s.status === "EXPIRED",
  ).length;

  return (
    <header className="h-16 bg-bg-paper border-b border-divider px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="text-sm font-extrabold tracking-tight text-primary-main">
          @psych-web{" "}
          <span className="text-xs font-normal text-text-secondary ml-2">
            | Sesi Pengerjaan Aktif
          </span>
          <h1 className="mt-1 truncate text-xl font-extrabold text-text-primary">
            {attempt.testName}
          </h1>
        </span>
      </div>

      <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-warning-main/10 text-warning-main text-xs font-bold border border-warning-main/20">
        <p>
          Percobaan ke-{attempt.attemptNumber} · {doneCount} dari{" "}
          {sections.length} subtes selesai
        </p>
      </div>

      <div>
        <DialogConfirmAction
          title="Keluar dari Ujian?"
          description="Apakah Anda yakin ingin keluar? Progres ujian yang belum dikirim mungkin akan hilang."
          confirmText="Ya, Keluar"
          cancelText="Tetap di Ujian"
          variant="danger"
          onConfirm={() => navigate({ to: "/portal" })}
          trigger={(open: () => void) => (
            <Button
              type="button"
              variant="ghost"
              color="error"
              size="sm"
              onClick={open}
            >
              Keluar Ujian
            </Button>
          )}
        />
      </div>
    </header>
  );
};

export default function ExamRootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-default text-text-primary selection:bg-primary-main/20">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 space-y-2">
        <Outlet />
      </main>
    </div>
  );
}
