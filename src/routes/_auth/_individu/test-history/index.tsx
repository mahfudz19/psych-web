import { createFileRoute } from "@tanstack/react-router";
import { TestHistoryPage } from "./-components/page";

export const Route = createFileRoute("/_auth/_individu/test-history/")({
  component: TestHistoryPage,
});
