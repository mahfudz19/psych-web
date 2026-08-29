import { useTranslation } from "react-i18next";
import Input from "../../../../components/ui/Input";
import type { Dispatch, SetStateAction } from "react";

function ReferralOrInvitedCode({
  fieldName,
  setShow,
  show,
}: {
  fieldName: "referralCode" | "inviteCode";
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();

  const ifRefferal = fieldName ? fieldName === "referralCode" : false;

  return (
    <>
      <div className="pt-1">
        {!show ? (
          <button
            type="button"
            onClick={() => {
              setShow(true);
            }}
            className="text-sm font-bold text-primary-main hover:text-primary-dark hover:underline transition-all flex items-center gap-1"
          >
            +{" "}
            {t(
              ifRefferal
                ? "guest.register.addReferral"
                : "guest.register.addInvite",
            )}
          </button>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="flex text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 justify-between">
              <span>
                {t(
                  ifRefferal
                    ? "guest.register.referralLabel"
                    : "guest.register.organizationNameLabel",
                )}
              </span>
              <button
                type="button"
                onClick={() => setShow(false)}
                className="text-error-main hover:underline normal-case"
              >
                {t("common.cancel")}
              </button>
            </label>
            <Input
              type="text"
              name={fieldName}
              placeholder={t("guest.register.referralPlaceholder")}
              className="w-full"
            />
          </div>
        )}
      </div>
    </>
  );
}

export default ReferralOrInvitedCode;
