import { useCancelTransaction } from "../-api/billing.query";
import Button from "../../../../../components/ui/Button";

const CanclePayment = ({ referenceId }: { referenceId: string | null }) => {
  const { mutate: doCancelTx, isPending: isCanceling } = useCancelTransaction();

  const handleCancelPayment = () => {
    if (!referenceId) return;
    doCancelTx(referenceId);
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
