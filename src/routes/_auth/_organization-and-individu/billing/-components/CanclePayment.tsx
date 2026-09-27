import { useQueryClient } from "@tanstack/react-query";
import { type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { useCancelTransaction } from "../-api/billing.query";
import Button from "../../../../../components/ui/Button";
import toast from "../../../../../components/ui/Toast";

const CanclePayment = ({
  referenceId,
  setReferenceId,
}: {
  referenceId: string | null;
  setReferenceId: Dispatch<SetStateAction<string | null>>;
}) => {
  const { mutate: doCancelTx, isPending: isCanceling } = useCancelTransaction();

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleCancelPayment = () => {
    if (!referenceId) return;
    doCancelTx(referenceId, {
      onSuccess: () => {
        setReferenceId(null);
        queryClient.invalidateQueries({ queryKey: ["transactions", "status"] });
        toast.success(
          t(
            "billing.cancelSuccess",
            "Transaksi sebelumnya berhasil dibatalkan.",
          ),
        );
      },
    });
  };

  return (
    <Button
      variant="outlined"
      color="white"
      fullWidth
      onClick={handleCancelPayment}
      loading={isCanceling}
      disabled={isCanceling}
    >
      Batalkan & Pilih Paket Lain
    </Button>
  );
};

export default CanclePayment;
