import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGetAttempt, useStartOrResumeAttempt } from "../../-api/exam.api";
import {
  unwrap,
  type AttemptState,
  type SectionRun,
} from "../../-api/exam.types";
import CompletedCard from "../../-components/CompletedCard";
import ErrorCard from "../../-components/ErrorCard";
import LoadingCard from "../../-components/LoadingCard";
import Lobby from "../../-components/Lobby";
import SectionPlayer from "../../-components/SectionPlayer";

export const Route = createFileRoute("/_auth/_exam/exam/$testId/")({
  component: ExamSessionPage,
});

function ExamSessionPage() {
  const { testId } = Route.useParams();

  const { data } = useStartOrResumeAttempt(testId);

  const attemptId = unwrap<AttemptState>(data?.data)?.id ?? "";

  console.log("useStartOrResumeAttempt", data);
  const attemptQuery = useGetAttempt(attemptId, attemptId !== "");
  const attempt = unwrap<AttemptState>(attemptQuery.data);
  const { refetch: refetchAttempt } = attemptQuery;

  const [run, setRun] = useState<SectionRun | null>(null);

  if (attemptQuery.isLoading) return <LoadingCard />;

  if (attemptQuery.isError || !attempt) {
    return (
      <ErrorCard
        title="Gagal memuat sesi ujian"
        message="Data sesi Anda belum bisa diambil dari server. Jawaban yang sudah tersimpan tidak hilang."
      />
    );
  }

  if (attempt.status === "COMPLETED") {
    return <CompletedCard testName={attempt.testName} />;
  }

  if (run) {
    return (
      <SectionPlayer
        key={run.section.id}
        attemptId={attempt.id}
        testName={attempt.testName}
        run={run}
        onFinished={() => {
          setRun(null);
          void refetchAttempt();
        }}
      />
    );
  }

  return (
    <Lobby attemptId={attemptId} attempt={attempt} run={run} setRun={setRun} />
  );
}
