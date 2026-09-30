import React, { useState } from "react";
import type { AdminTransactionsInfo } from "../-api/transactions.type";
import Dialog from "../../../../../../components/ui/Dialog";
import IconButton from "../../../../../../components/ui/IconButton";
import { Check, Copy, ExternalLink, Eye, User, X } from "lucide-react";
import toast from "../../../../../../components/ui/Toast";

export const HandleCopy = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    toast.success(`${label} berhasil disalin!`);

    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`p-1 rounded-lg transition-all duration-200 inline-flex items-center justify-center ${
        isCopied
          ? "text-success-main bg-success-main/10 scale-105"
          : "text-text-disabled hover:text-primary-main hover:bg-divider/10 active:scale-95"
      }`}
      title={isCopied ? "Berhasil disalin!" : `Salin ${label}`}
    >
      {isCopied ? (
        <Check className="w-3.5 h-3.5 animate-in zoom-in-50 duration-200" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
};

function DetailTransaksi({ row }: { row: AdminTransactionsInfo }) {
  return (
    <Dialog
      trigger={(open) => (
        <IconButton variant="text" size="sm" color="info" onClick={open}>
          <Eye className="w-4 h-4" />
        </IconButton>
      )}
    >
      {(close) => (
        <div className="p-6 flex flex-col gap-6 max-w-lg w-full">
          <div className="flex justify-between items-center border-b border-divider pb-4">
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Detail Transaksi
              </h3>
              <p className="text-xs text-text-secondary font-mono">
                Ref: {row.referenceId}
              </p>
            </div>
            <IconButton variant="text" color="error" onClick={close} size="sm">
              <X className="w-4 h-4" />
            </IconButton>
          </div>

          {/* Troubleshooting Info Pelanggan */}
          <div className="bg-bg-default p-4 rounded-2xl border border-divider space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-text-primary border-b border-divider pb-2 mb-1">
              <User className="w-4 h-4 text-primary-main" />
              Informasi Pelanggan
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Nama</span>
              <span className="font-semibold">{row.subscriberName || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Email</span>
              <span className="font-mono font-medium">
                {row.subscriberEmail || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Tipe Subskriber</span>
              <span className="font-bold uppercase">{row.subscriberType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Subscriber ID</span>
              <span className="font-mono text-[11px] text-text-secondary">
                {row.subscriberId || "-"}
              </span>
            </div>
          </div>

          {/* Detail Transaksi & Xendit */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Status Pembayaran</span>
              <span className="font-bold uppercase px-2 py-0.5 rounded text-xs bg-divider/20">
                {row.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Xendit Invoice ID</span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                <span>{row.xenditInvoiceId || "-"}</span>
                {row.xenditInvoiceId && (
                  <HandleCopy
                    value={row.xenditInvoiceId}
                    label="Xendit Invoice ID"
                  />
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Paket</span>
              <span className="font-bold">
                {row.planName || row.planCode || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Nominal</span>
              <span className="font-extrabold text-primary-main">
                Rp {row.amount.toLocaleString("id-ID")} {row.currency || "IDR"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Metode Bayar</span>
              <span className="font-medium">{row.paymentMethod || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Tanggal Dibuat</span>
              <span className="font-medium">
                {new Date(row.createdAt).toLocaleString("id-ID")}
              </span>
            </div>
            {row.paidAt && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Tanggal Bayar</span>
                <span className="font-medium text-success-main">
                  {new Date(row.paidAt).toLocaleString("id-ID")}
                </span>
              </div>
            )}
            {row.expiredAt && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Tanggal Kadaluarsa</span>
                <span className="font-medium">
                  {new Date(row.expiredAt).toLocaleString("id-ID")}
                </span>
              </div>
            )}
            {row.checkoutUrl && row.status === "PENDING" && (
              <div className="pt-2">
                <a
                  href={row.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-primary-main text-white font-semibold text-xs hover:bg-primary-dark transition-colors"
                >
                  Buka Link Checkout Xendit{" "}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Detail Langganan jika ada */}
          {row.subscription && (
            <>
              <hr className="border-divider" />
              <div className="space-y-3 text-sm">
                <h4 className="font-bold text-text-primary">
                  Detail Langganan Terkait
                </h4>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subscription ID</span>
                  <span className="font-mono text-xs">
                    {row.subscription.subscriptionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Status Langganan</span>
                  <span className="font-bold uppercase">
                    {row.subscription.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Mulai</span>
                  <span>
                    {new Date(row.subscription.startDate).toLocaleDateString(
                      "id-ID",
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Berakhir</span>
                  <span>
                    {new Date(row.subscription.endDate).toLocaleDateString(
                      "id-ID",
                    )}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Dialog>
  );
}

export default DetailTransaksi;
