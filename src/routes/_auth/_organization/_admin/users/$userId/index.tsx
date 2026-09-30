import { createFileRoute } from "@tanstack/react-router";
import UserDetailPage from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_organization/_admin/users/$userId/",
)({ component: UserDetailPage });
