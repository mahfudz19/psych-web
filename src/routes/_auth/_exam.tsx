import { createFileRoute } from "@tanstack/react-router";
import ExamLayout from "./_exam/-components/layout.tsx";

export const Route = createFileRoute("/_auth/_exam")({ component: ExamLayout });
