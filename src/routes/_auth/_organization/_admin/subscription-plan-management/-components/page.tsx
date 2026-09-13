import { useNavigate } from "@tanstack/react-router";
import { Route } from "..";
import { useGetSubscriptionPlans } from "../-api/subscriptionPlan.query";
import {
  DataTable,
  type BaseListParams,
  type ColumnDef,
} from "../../../../../../components/reusebale-components/DataTable";
import type { SubscriptionPlan } from "../-api/subscriptionPlan.type";
import SubscriptionPlanActionRow from "./ActionRow";
import Dialog from "../../../../../../components/ui/Dialog";
import Button from "../../../../../../components/ui/Button";
import { Plus } from "lucide-react";
import SubscriptionPlanForm from "./Form";

function DialogCreate() {
  return (
    <Dialog
      isDynamic={true}
      trigger={(openDialog) => (
        <Button
          onClick={(e) => {
            openDialog(e);
          }}
          startIcon={<Plus size={16} />}
        >
          Subscription Plan
        </Button>
      )}
    >
      {(close) => (
        <div className="p-6 space-y-4 max-w-lg w-full">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Add Subscription Plan
            </h3>
          </div>
          <SubscriptionPlanForm
            onSuccessCallback={() => {
              close();
            }}
          />
        </div>
      )}
    </Dialog>
  );
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);

function SubscriptionPlanManagement() {
  const tableState = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const {
    data: response,
    isLoading,
    isFetching,
  } = useGetSubscriptionPlans(tableState);

  const handleStateChange = (newState: BaseListParams) => {
    navigate({
      search: (prev) => {
        const nextSearch = { ...prev, ...newState };
        return nextSearch;
      },
      replace: true,
    });
  };

  const columns: ColumnDef<SubscriptionPlan>[] = [
    {
      header: "Paket Langganan",
      accessorKey: "name",
      sortable: true,
      filterType: "text",
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {row.name}
          </p>
          <code className="text-xs text-gray-500 font-mono">{row.code}</code>
        </div>
      ),
    },
    {
      header: "Target Market",
      accessorKey: "targetAudience",
      sortable: true,
      filterType: "faceted",
      filterOptions: [
        { label: "Individual", value: "USER" },
        { label: "Organisasi", value: "ORGANIZATION" },
      ],
      cell: (row) => (
        <span
          className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${
            row.targetAudience === "ORGANIZATION"
              ? "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
              : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
          }`}
        >
          {row.targetAudience === "ORGANIZATION" ? "Organisasi" : "Individual"}
        </span>
      ),
    },
    {
      header: "Harga",
      accessorKey: "price",
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(row.price)}
        </span>
      ),
    },
    {
      header: "Durasi",
      accessorKey: "durationDays",
      sortable: true,
      cell: (row) => `${row.durationDays} Hari`,
    },
    {
      header: "Maks. Kursi",
      accessorKey: "maxSeats",
      sortable: true,
      cell: (row) => (
        <span className="text-sm">
          {row.maxSeats ? `${row.maxSeats} Kursi` : "Unlimited"}
        </span>
      ),
    },
    {
      header: "Dibuat",
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
      header: "",
      accessorKey: "actions",
      className: "w-4 text-right px-4",
      cell: (row) => (
        <SubscriptionPlanActionRow
          subscriptionPlan={row}
          key={`user-detail-${row.id}`}
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 flex justify-between">
        <div className="">
          <h1 className="text-2xl font-bold">Katalog Paket Langganan</h1>
          <p className="text-sm text-gray-500">
            Kelola opsi paket langganan, harga, dan batasan kursi untuk pengguna
            & organisasi.
          </p>
        </div>
        <div>
          <DialogCreate />
        </div>
      </div>

      <DataTable<SubscriptionPlan, BaseListParams>
        columns={columns}
        data={response?.data || []}
        meta={response?.meta}
        isLoading={isLoading || isFetching}
        state={tableState}
        onStateChange={handleStateChange}
      />
    </>
  );
}

export default SubscriptionPlanManagement;
