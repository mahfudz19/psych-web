// ** React Imports
import { useState } from "react";
import toast from "../../ui/Toast";
import Dialog from "../../ui/Dialog";
import { AlertCircle, Check, X } from "lucide-react";
import Button from "../../ui/Button";

interface Props {
  body: string;
  // Mengadopsi standar baru: mengganti open/close dengan trigger
  trigger: (
    openDialog: (e?: React.MouseEvent | Element | Event) => void,
  ) => React.ReactNode;
  runFunction?: () => Promise<void>;
  runFunctionError?: () => Promise<void> | void;
  secondRunFunction?: () => Promise<void> | void;
  refetch?: () => Promise<void> | void;
}

const DialogDelete = ({
  body,
  trigger,
  runFunction,
  runFunctionError,
  secondRunFunction,
  refetch,
}: Props) => {
  // Menggabungkan alur dua dialog menjadi dua langkah ('confirm' dan 'result') dalam satu dialog
  const [step, setStep] = useState<"confirm" | "result">("confirm");
  const [userInput, setUserInput] = useState<"yes" | "cancel">("yes");
  const [loading, setLoading] = useState(false);

  const handleConfirmation = async (value: "yes" | "cancel") => {
    try {
      setLoading(true);
      if (value === "yes" && runFunction) {
        await runFunction();
      }
      setUserInput(value);
      setStep("result"); // Langsung pindah ke tampilan hasil tanpa menutup dialog
    } catch (error: any) {
      const text =
        error?.response?.data?.message ||
        error?.message ||
        error?.request?.statusText ||
        "Something went wrong";
      toast.error(text);
      await runFunctionError?.();
      setUserInput("cancel");
      setStep("result");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (closeDialog: () => void) => {
    closeDialog();
    if (userInput === "yes") {
      if (refetch) await refetch();
      if (secondRunFunction) await secondRunFunction();
    }
  };

  // Membungkus trigger bawaan agar kita bisa me-reset state setiap kali dialog dibuka
  const wrappedTrigger = (
    openDialog: (e?: React.MouseEvent | Element | Event) => void,
  ) => {
    return trigger((e) => {
      setStep("confirm");
      setLoading(false);
      openDialog(e);
    });
  };

  return (
    <Dialog
      trigger={wrappedTrigger}
      dismissible={!loading} // Cegah user menutup saat loading
      isDynamic={true} // Secara eksplisit memanggil dynamic import[cite: 2]
    >
      {(closeDialog) => (
        // Memindahkan event listener Enter key dari document global ke container dialog agar lebih aman
        <div
          className="focus:outline-none"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (step === "confirm" && e.key === "Enter") {
              const activeElement = document.activeElement as HTMLElement;
              const isCancelButton =
                activeElement?.textContent?.trim().toUpperCase() === "CANCEL";
              if (!isCancelButton) handleConfirmation("yes");
            } else if (step === "result" && e.key === "Enter") {
              handleFinish(closeDialog);
            }
          }}
        >
          {step === "confirm" ? (
            <>
              <div className="my-8 text-center">
                <div className="flex items-center justify-center">
                  <div className="max-w-[85%] text-center">
                    <AlertCircle
                      fontSize={88}
                      className="inline my-8 text-warning"
                    />
                    <div>{body}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 my-8 justify-center">
                <Button
                  variant="outlined"
                  color="warning"
                  disabled={loading}
                  onClick={() => handleConfirmation("cancel")}
                >
                  CANCEL
                </Button>
                <Button
                  variant="contained"
                  loading={loading}
                  disabled={loading}
                  onClick={() => handleConfirmation("yes")}
                >
                  YES
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-8">
                <div className="flex flex-col items-center">
                  {userInput === "yes" && (
                    <Check className="text-success" fontSize={88} />
                  )}
                  {userInput === "cancel" && (
                    <X className="text-error" fontSize={88} />
                  )}
                  <h4 className="mb-2">
                    {userInput === "yes" ? "DELETED" : "CANCELLED"}
                  </h4>
                  <p>
                    {userInput === "yes"
                      ? "Proses penghapusan berhasil"
                      : "Proses penghapusan dibatalkan"}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 my-8 justify-center">
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleFinish(closeDialog)}
                >
                  OK
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Dialog>
  );
};

export default DialogDelete;
