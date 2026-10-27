import { AlertTriangle } from "lucide-react";
import Button from "../../ui/Button";
import Dialog from "../../ui/Dialog";

interface Props {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  trigger: (openDialog: () => void) => React.ReactNode;
  variant?: "danger" | "warning" | "primary";
}

export default function DialogConfirmAction({
  title,
  description,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  onConfirm,
  trigger,
  variant = "danger",
}: Props) {
  return (
    <Dialog isDynamic={true} trigger={trigger} maxWidth="sm">
      {(close) => (
        <div className="p-6 text-center">
          <div
            className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
              variant === "danger"
                ? "bg-red-100 text-red-600"
                : variant === "warning"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-blue-100 text-blue-600"
            }`}
          >
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {description}
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outlined" onClick={close}>
              {cancelText}
            </Button>
            <Button
              color={variant === "danger" ? "error" : "primary"}
              onClick={() => {
                onConfirm();
                close();
              }}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
