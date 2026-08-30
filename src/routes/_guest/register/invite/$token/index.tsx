import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import SuccessRegisration from "../../-components/SuccessRegisration";
import { useRegisterMutation } from "../../../-api/auth.query";
import toast from "../../../../../components/ui/Toast";
import type { invitePayload } from "../../../../_auth/_organization/members/-components/ModalInvite";
import FormInviteRegister from "./-components/Form";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_guest/register/invite/$token/")({
  component: RegisterInvite,
});

function RegisterInvite() {
  const { t } = useTranslation();

  const { token } = Route.useParams();

  const [inviteData, setInviteData] = useState<invitePayload | null>(null);

  useEffect(() => {
    try {
      const decodedString = decodeURIComponent(escape(atob(token)));
      const parsedJson = JSON.parse(decodedString);
      setInviteData({ ...parsedJson });
    } catch (e) {
      toast.error("Invalid invite token");
    }
  }, [token]);

  const registerMutation = useRegisterMutation();

  const [submittedEmail, setSubmittedEmail] = useState("");

  return (
    <>
      {!registerMutation.isSuccess ? (
        <>
          <div className="mb-8">
            <div className="inline-block px-3 py-1 bg-info-main text-info-contrast font-black text-xs tracking-widest rounded-md mb-6">
              {t("guest.invite.badge")}
            </div>
            <h3 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
              {t("guest.invite.title")}
            </h3>
            <p className="text-text-secondary text-sm">
              {t("guest.invite.subtitle")}
            </p>
          </div>

          <FormInviteRegister
            inviteData={inviteData}
            token={token}
            registerMutation={registerMutation}
            setSubmittedEmail={setSubmittedEmail}
          />

          <div className="mt-6 pt-6 border-t border-divider text-left text-sm text-text-secondary">
            {t("guest.invite.hasAccount")}{" "}
            <Link
              to="/login"
              preload={false}
              className="text-primary-main font-bold hover:underline"
            >
              {t("guest.invite.loginLink")}
            </Link>
          </div>
        </>
      ) : (
        <SuccessRegisration email={submittedEmail} />
      )}
    </>
  );
}
