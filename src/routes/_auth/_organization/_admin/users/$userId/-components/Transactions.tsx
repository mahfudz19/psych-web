import { useState } from "react";
import { CheckCircle2, Clock, Eye, X, XCircle } from "lucide-react";
import {
  DataTable,
  type BaseListParams,
  type ColumnDef,
} from "../../../../../../../components/reusebale-components/DataTable";
import { useTransactionsByUserQuery } from "../../-api/user.query";
import type { TransactionHistoryItem } from "../../../../../_organization-and-individu/billing/-api/billing.type";
import Dialog from "../../../../../../../components/ui/Dialog";
import IconButton from "../../../../../../../components/ui/IconButton";

function Transactions({ userId }: { userId: string }) {
  const [tableState, setTableState] = useState<BaseListParams>({
    page: 1,
    limit: 10,
  });

  const {
    data: response,
    isLoading,
    isFetching,
  } = useTransactionsByUserQuery(userId, tableState);

  const columns: ColumnDef<TransactionHistoryItem>[] = [
    {
      header: "Tanggal Dibuat",
      accessorKey: "createdAt",
      sortable: true,
      filterType: "date-range",
      cell: (row) =>
        new Date(row.createdAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      header: "Referensi",
      accessorKey: "referenceId",
      sortable: true,
      filterType: "text",
      cell: (row) => (
        <code className="font-mono text-xs text-text-primary">
          {row.referenceId}
        </code>
      ),
    },
    {
      header: "Metode Bayar",
      accessorKey: "paymentMethod",
      sortable: true,
      cell: (row) => (
        <span className="font-medium text-text-primary">
          {row.paymentMethod || "-"}
        </span>
      ),
    },
    {
      header: "Nominal",
      accessorKey: "amount",
      sortable: true,
      cell: (row) => `Rp ${row.amount.toLocaleString("id-ID")}`,
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      filterType: "faceted",
      filterOptions: [
        { label: "PAID", value: "PAID" },
        { label: "PENDING", value: "PENDING" },
        { label: "EXPIRED", value: "EXPIRED" },
        { label: "FAILED", value: "FAILED" },
      ],
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
            row.status === "PAID"
              ? "bg-success-main/10 text-success-main"
              : row.status === "PENDING"
                ? "bg-warning-main/10 text-warning-main"
                : "bg-error-main/10 text-error-main"
          }`}
        >
          {row.status === "PAID" && <CheckCircle2 className="w-3 h-3" />}
          {row.status === "PENDING" && <Clock className="w-3 h-3" />}
          {(row.status === "FAILED" || row.status === "EXPIRED") && (
            <XCircle className="w-3 h-3" />
          )}
          {row.status}
        </span>
      ),
    },
    {
      header: "Tanggal Bayar",
      accessorKey: "paidAt",
      sortable: true,
      cell: (row) =>
        row.paidAt
          ? new Date(row.paidAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",
    },
    {
      header: "Aksi",
      accessorKey: "referenceId",
      cell: (row) => (
        <Dialog
          trigger={(open) => (
            <IconButton variant="text" size="sm" color="info" onClick={open}>
              <Eye className="w-4 h-4" />
            </IconButton>
          )}
        >
          {(close) => (
            <div className="p-6 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-text-primary">
                  Detail Transaksi
                </h3>
                <IconButton
                  variant="text"
                  color="error"
                  onClick={close}
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </IconButton>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Referensi</span>
                  <span className="font-mono font-medium">
                    {row.referenceId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Status</span>
                  <span className="font-bold">{row.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Nominal</span>
                  <span className="font-medium">
                    Rp {row.amount.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Metode Bayar</span>
                  <span className="font-medium">
                    {row.paymentMethod || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Tanggal Dibuat</span>
                  <span className="font-medium">
                    {new Date(row.createdAt).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {row.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Tanggal Bayar</span>
                    <span className="font-medium">
                      {new Date(row.paidAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
                {row.expiredAt && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">
                      Tanggal Kadaluarsa
                    </span>
                    <span className="font-medium">
                      {new Date(row.expiredAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {row.subscription && (
                <>
                  <hr className="border-divider" />
                  <div>
                    <h4 className="font-bold text-text-primary mb-3">
                      Detail Langganan
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          Status Langganan
                        </span>
                        <span className="font-bold">
                          {row.subscription.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Mulai</span>
                        <span className="font-medium">
                          {new Date(row.subscription.startDate).toLocaleString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Berakhir</span>
                        <span className="font-medium">
                          {new Date(row.subscription.endDate).toLocaleString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                      {row.subscription.canceledAt && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">
                            Dibatalkan Pada
                          </span>
                          <span className="font-medium">
                            {new Date(
                              row.subscription.canceledAt,
                            ).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </Dialog>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div>
        <h3 className="text-base font-bold text-text-primary">
          Riwayat Pembayaran & Transaksi
        </h3>
        <p className="text-xs text-text-secondary">
          Daftar semua transaksi langganan dan pembelian yang pernah dilakukan.
        </p>
      </div>

      <DataTable<TransactionHistoryItem, BaseListParams>
        columns={columns}
        data={response?.data || []}
        meta={response?.meta}
        isLoading={isLoading || isFetching}
        state={tableState}
        onStateChange={setTableState}
      />
    </div>
  );
}

export default Transactions;
