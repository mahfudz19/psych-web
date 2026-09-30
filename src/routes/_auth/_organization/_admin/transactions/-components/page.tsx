import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  XCircle,
} from "lucide-react";
import { useTransactionsQuery } from "../-api/transactions.query";
import type { AdminTransactionsInfo } from "../-api/transactions.type";
import {
  DataTable,
  type BaseListParams,
  type ColumnDef,
} from "../../../../../../components/reusebale-components/DataTable";

import { Route } from "../index";
import DetailTransaksi, { HandleCopy } from "./DetailTransaksi";

function TransactionsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const tableState: BaseListParams = {
    page: search.page ?? 1,
    limit: search.limit ?? 10,
    search: search.search,
    sortBy: search.sortBy,
    sortOrder: search.sortOrder,
    filter: search.filter,
  };

  const handleStateChange = (
    updater: BaseListParams | ((prev: BaseListParams) => BaseListParams),
  ) => {
    const nextState =
      typeof updater === "function" ? updater(tableState) : updater;
    navigate({
      search: (prev) => ({
        ...prev,
        ...nextState,
      }),
      replace: true,
    });
  };

  const { data, isLoading, isFetching } = useTransactionsQuery(tableState);

  const transactionsList = data?.data || [];
  const totalPaidAmount = transactionsList
    .filter((t) => t.status === "PAID")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const paidCount = transactionsList.filter((t) => t.status === "PAID").length;
  const pendingCount = transactionsList.filter(
    (t) => t.status === "PENDING",
  ).length;
  const failedOrExpiredCount = transactionsList.filter(
    (t) => t.status === "FAILED" || t.status === "EXPIRED",
  ).length;

  const columns: ColumnDef<AdminTransactionsInfo>[] = [
    {
      header: "Tanggal",
      accessorKey: "createdAt",
      sortable: true,
      filterType: "date-range",
      cell: (row) => (
        <div className="space-y-0.5">
          <p className="font-medium text-xs">
            {new Date(row.createdAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
          {row.paidAt && (
            <p className="text-[11px] text-success-main font-medium">
              Lunas:{" "}
              {new Date(row.paidAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
              })}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Pelanggan",
      accessorKey: "subscriberEmail",
      filterType: "text",
      cell: (row) => (
        <div>
          <p className="font-bold text-text-primary text-xs">
            {row.subscriberName || "Tanpa Nama"}
          </p>
          <p className="text-xs text-text-secondary font-mono">
            {row.subscriberEmail || "-"}
          </p>
          <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-divider/20 text-text-secondary uppercase">
            {row.subscriberType}
          </span>
        </div>
      ),
    },
    {
      header: "Referensi & Invoice",
      accessorKey: "referenceId",
      sortable: true,
      filterType: "text",
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <code className="font-mono text-xs font-bold text-text-primary">
              {row.referenceId}
            </code>
            <HandleCopy value={row.referenceId} label="Referensi ID" />
          </div>
          {row.xenditInvoiceId && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-text-secondary bg-bg-default px-1.5 py-0.5 rounded border border-divider">
                Xendit: {row.xenditInvoiceId}
              </span>
              <HandleCopy
                value={row.xenditInvoiceId}
                label="Xendit Invoice ID"
              />
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Paket",
      accessorKey: "planName",
      cell: (row) => (
        <span className="font-semibold text-text-primary text-xs">
          {row.planName || row.planCode || "-"}
        </span>
      ),
    },
    {
      header: "Metode Bayar",
      accessorKey: "paymentMethod",
      sortable: true,
      cell: (row) => (
        <span className="font-medium text-text-primary text-xs">
          {row.paymentMethod || "-"}
        </span>
      ),
    },
    {
      header: "Nominal",
      accessorKey: "amount",
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-text-primary">
          Rp {row.amount.toLocaleString("id-ID")}
        </span>
      ),
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
              ? "bg-success-main/10 text-success-main border border-success-main/20"
              : row.status === "PENDING"
                ? "bg-warning-main/10 text-warning-main border border-warning-main/20"
                : "bg-error-main/10 text-error-main border border-error-main/20"
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
      header: "Aksi",
      accessorKey: "referenceId",
      cell: (row) => <DetailTransaksi row={row} />,
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manajemen Transaksi</h1>
        <p className="text-sm text-text-secondary">
          Pantau seluruh transaksi, audit pembayaran Xendit, dan analisa
          pendapatan platform.
        </p>
      </div>

      {/* Ringkasan Laporan Keuangan & Perilaku */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-bg-paper border border-divider rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary font-medium">
              Total Pendapatan (Lunas)
            </p>
            <p className="text-xl font-extrabold text-success-main mt-1">
              Rp {totalPaidAmount.toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Dari {paidCount} transaksi lunas di halaman ini
            </p>
          </div>
          <div className="p-3 bg-success-main/10 text-success-main rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-bg-paper border border-divider rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary font-medium">
              Rasio Pembayaran
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-success-main">
                {paidCount} Lunas
              </span>
              <span className="text-xs font-bold text-warning-main">
                {pendingCount} Pending
              </span>
              <span className="text-xs font-bold text-error-main">
                {failedOrExpiredCount} Gagal
              </span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1">
              Total {data?.meta?.total ?? transactionsList.length} transaksi
              tercatat
            </p>
          </div>
          <div className="p-3 bg-primary-main/10 text-primary-main rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-bg-paper border border-divider rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary font-medium">
              Audit Xendit
            </p>
            <p className="text-xs font-bold text-text-primary mt-1">
              Pencarian Email & Ref ID
            </p>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Salin Xendit Invoice ID untuk rekonsiliasi dashboard
            </p>
          </div>
          <div className="p-3 bg-warning-main/10 text-warning-main rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      <DataTable<AdminTransactionsInfo, BaseListParams>
        columns={columns}
        data={transactionsList}
        meta={data?.meta}
        isLoading={isLoading || isFetching}
        state={tableState}
        onStateChange={handleStateChange}
      />
    </>
  );
}

export default TransactionsPage;
