import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "../../../../../components/ui/Button";
import { useCancelActiveSubscription } from "../-api/billing.query";

export default function CancelActiveSubscription() {
  const [isConfirming, setIsConfirming] = useState(false);
  const { mutate, isPending } = useCancelActiveSubscription();

  if (isConfirming) {
    return (
      <div className="bg-error-main/10 border border-error-main/20 rounded-2xl p-5 mt-4 space-y-4 text-left animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-error-main shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-error-main">
              Konfirmasi Pembatalan
            </h4>
            <p className="text-xs text-error-main/80 mt-1 leading-relaxed">
              Apakah Anda yakin ingin membatalkan langganan ini? Sesuai
              kebijakan, <strong>sisa masa aktif akan hangus</strong> dan akun
              Anda akan kembali ke status Gratis.
            </p>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            variant="outlined"
            color="white"
            size="sm"
            fullWidth
            onClick={() => setIsConfirming(false)}
            disabled={isPending}
          >
            Kembali
          </Button>
          <Button
            variant="contained"
            color="error"
            size="sm"
            fullWidth
            loading={isPending}
            onClick={() => mutate()}
          >
            Ya, Batalkan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Button
        variant="outlined"
        color="error"
        fullWidth
        onClick={() => setIsConfirming(true)}
      >
        Batalkan Langganan (Upgrade / Downgrade)
      </Button>
    </div>
  );
}
