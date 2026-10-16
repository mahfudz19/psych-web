import type { ReactNode } from "react";
import { X } from "lucide-react";
import IconButton from "../../../../../../../components/ui/IconButton";
import Label from "../../../../../../../components/ui/Label";
import Tooltip from "../../../../../../../components/ui/Tooltip";

/** Class untuk textarea dan select agar tampilannya sama dengan Input. */
export const FIELD_CLASS =
  "w-full rounded-2xl border border-divider text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-primary-main focus:ring-primary-main/20";

/**
 * Label + tooltip. Jika `collection` dan `field` diisi, tooltip menampilkan
 * lokasi penyimpanan field, misalnya "test_scales.rawMin".
 */
export function FieldLabel({
  htmlFor,
  label,
  tooltip,
  collection,
  field,
  required,
}: {
  htmlFor?: string;
  label: string;
  tooltip: string;
  collection?: string;
  field?: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <Label htmlFor={htmlFor} className="mb-0!">
        {label} {required && <span className="text-error-main">*</span>}
      </Label>
      <Tooltip
        position="top-center"
        interaction="hover"
        trigger={
          <button type="button" tabIndex={-1} className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-text-secondary hover:text-primary-main transition-colors cursor-help"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        }
      >
        <div className="max-w-62.5 text-center">
          {tooltip}
          {collection && field && (
            <div className="mt-1 font-mono text-[11px] opacity-70">
              {collection}.{field}
            </div>
          )}
        </div>
      </Tooltip>
    </div>
  );
}

export function HelpText({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-text-secondary">{children}</p>;
}

/**
 * Overlay sederhana supaya tidak bergantung pada API modal lain.
 * Ganti dengan komponen Modal/Dialog milik proyek jika sudah ada.
 */
export function FormOverlay({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h4 className="text-lg font-semibold">{title}</h4>
          <IconButton size="sm" variant="text" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}
