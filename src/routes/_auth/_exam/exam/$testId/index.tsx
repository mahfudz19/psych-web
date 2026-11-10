import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  unwrap,
  type AttemptState,
  type SectionRun,
} from "../../-api/exam.types";
import {
  useFinishAttempt,
  useGetAttempt,
  useStartOrResumeAttempt,
  useStartSection,
} from "../../-api/exam.api";
import SectionPlayer from "../../-components/SectionPlayer";
import ErrorCard from "../../-components/ErrorCard";
import LoadingCard from "../../-components/LoadingCard";
import CompletedCard from "../../-components/CompletedCard";
import Lobby from "../../-components/Lobby";

export const Route = createFileRoute("/_auth/_exam/exam/$testId/")({
  component: ExamSessionPage,
});

export function normalizeRun(data: SectionRun): SectionRun {
  return {
    section: {
      ...data.section,
      instructions: data.section.instructions ?? null,
      examples: data.section.examples ?? [],
      showExamplesFirst: data.section.showExamplesFirst ?? true,
      deadlineAt: data.section.deadlineAt ?? null,
      serverTime: data.section.serverTime ?? null,
    },
    items: data.items.map((it) => ({
      ...it,
      content: {
        text: it.content?.text ?? null,
        images: it.content?.images ?? [],
        audioUrl: it.content?.audioUrl ?? null,
      },
      options: it.options ?? [],
      constraints: it.constraints ?? {},
    })),
    answers: data.answers ?? [],
  };
}

function ExamSessionPage() {
  const { testId } = Route.useParams();

  const { data } = useStartOrResumeAttempt(testId);

  const attemptId = unwrap<AttemptState>(data?.data)?.id ?? "";

  const attemptQuery = useGetAttempt(attemptId, attemptId !== "");
  const attempt = unwrap<AttemptState>(attemptQuery.data);
  const { refetch: refetchAttempt } = attemptQuery;

  const [run, setRun] = useState<SectionRun | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const { mutateAsync: startSectionAsync, isPending: starting } =
    useStartSection();

  const beginSection = useCallback(
    async (sectionId: string) => {
      if (!attemptId) return;
      setStartError(null);
      try {
        const res = await startSectionAsync({ attemptId, sectionId });
        const data = unwrap<SectionRun>(res);
        if (!data?.section || !Array.isArray(data.items)) {
          throw new Error("Bentuk respons subtes tidak dikenali");
        }
        setRun(normalizeRun(data));
      } catch {
        setStartError(
          "Subtes belum bisa dimulai. Periksa koneksi Anda lalu coba lagi.",
        );
      }
    },
    [attemptId, startSectionAsync],
  );

  const resumedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!attempt || attempt.status !== "IN_PROGRESS" || run) return;
    const open = attempt.sections.find((s) => s.status === "IN_PROGRESS");
    if (!open || resumedRef.current.has(open.sectionId)) return;
    resumedRef.current.add(open.sectionId);
    void beginSection(open.sectionId);
  }, [attempt, run, beginSection]);

  const handleSectionFinished = useCallback(() => {
    setRun(null);
    void refetchAttempt();
  }, [refetchAttempt]);

  const [finishError, setFinishError] = useState<string | null>(null);
  const { mutateAsync: finishAsync, isPending: finishing } = useFinishAttempt();

  const finishAttempt = async () => {
    if (!attemptId) return;
    setFinishError(null);
    try {
      await finishAsync(attemptId);
    } catch {
      setFinishError(
        "Tes belum bisa diselesaikan. Periksa koneksi Anda lalu coba lagi.",
      );
    }
  };

  if (attemptId === "" || attemptQuery.isLoading) return <LoadingCard />;

  if (attemptQuery.isError || !attempt) {
    return (
      <ErrorCard
        title="Gagal memuat sesi ujian"
        message="Data sesi Anda belum bisa diambil dari server. Jawaban yang sudah tersimpan tidak hilang."
        onRetry={() => void refetchAttempt()}
      />
    );
  }

  if (attempt.status === "COMPLETED") {
    return <CompletedCard testName={attempt.testName} />;
  }

  console.log({ run, attempt });

  if (run) {
    return (
      <SectionPlayer
        key={run.section.id}
        attemptId={attempt.id}
        testName={attempt.testName}
        run={run}
        onFinished={handleSectionFinished}
      />
    );
  }

  const sections = [...attempt.sections].sort((a, b) => a.order - b.order);
  const resuming = sections.find((s) => s.status === "IN_PROGRESS") ?? null;
  const nextSection = resuming
    ? null
    : (sections.find((s) => s.status === "NOT_STARTED") ?? null);
  const allDone = sections.every(
    (s) => s.status === "COMPLETED" || s.status === "EXPIRED",
  );

  return (
    <Lobby
      attempt={attempt}
      nextSection={nextSection}
      allDone={allDone}
      resuming={resuming}
      starting={starting}
      startError={startError}
      onStart={(sectionId) => void beginSection(sectionId)}
      finishing={finishing}
      finishError={finishError}
      onFinish={() => void finishAttempt()}
    />
  );
}
