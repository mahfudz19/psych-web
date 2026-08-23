import { createFileRoute } from "@tanstack/react-router";
import { ReferralPage } from "./-components/page";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/profile/referral/",
)({
  component: ReferralPage,
});
