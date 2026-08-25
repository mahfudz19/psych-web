import { Link } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "../../../../components/ui/Button";

function SuccessRegisration({ email }: { email?: string }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 animate-in zoom-in-95 fade-in duration-500">
      <div className="w-20 h-20 bg-primary-main/10 text-primary-main rounded-full flex items-center justify-center mb-6 border-4 border-primary-main/20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="text-3xl font-extrabold text-text-primary tracking-tight mb-4">
        {t("guest.register.checkEmailTitle")}
      </h3>
      <p className="text-text-secondary text-base mb-8 leading-relaxed max-w-sm">
        {t("guest.register.checkEmailDesc")}{" "}
        <span className="font-bold text-text-primary block mt-1">{email}</span>
      </p>
      <div className="w-full p-4 bg-warning-main/10 rounded-2xl border border-warning-main/20 mb-8 text-left">
        <div className="flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-warning-dark mt-0.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-warning-dark font-medium leading-relaxed">
            {t("guest.register.spamNotice")}
          </p>
        </div>
      </div>
      <Link to="/login" className="w-full block">
        <Button type="button" className="w-full">
          {t("guest.register.backToLogin")}
        </Button>
      </Link>
    </div>
  );
}

export default SuccessRegisration;
