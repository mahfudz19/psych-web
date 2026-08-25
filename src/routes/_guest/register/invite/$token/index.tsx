import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import SuccessRegisration from "../../-components/SuccessRegisration";
import { useRegisterMutation } from "../../../-api/auth.query";
import { AuthSplitLayout } from "../../../-components/AuthSplitLayout";
import FormInviteRegister from "./-components/Form";
import type { invitePayload } from "../../../../_auth/_organization/members/-components/ModalInvite";
import toast from "../../../../../components/ui/Toast";

export const Route = createFileRoute("/_guest/register/invite/$token/")({
  component: RegisterInvite,
});

function RegisterInvite() {
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
    <AuthSplitLayout layoutKey="registerInvite" imagePosition="right">
      {!registerMutation.isSuccess ? (
        <FormInviteRegister
          inviteData={inviteData}
          token={token}
          registerMutation={registerMutation}
          setSubmittedEmail={setSubmittedEmail}
        />
      ) : (
        <SuccessRegisration email={submittedEmail} />
      )}
    </AuthSplitLayout>
  );
}
