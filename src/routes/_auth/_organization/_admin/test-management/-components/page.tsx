import { useNavigate } from "@tanstack/react-router";
import {
  Archive,
  CheckCircle,
  MoreVertical,
  Plus,
  Settings,
  Trash,
  X,
} from "lucide-react";
import { Route } from "..";
import {
  useArchiveTestDefinitionMutation,
  useDeleteTestDefinitionMutation,
  useGetTestDefinitions,
  usePublishTestDefinitionMutation,
} from "../-api/test-definitions.query";
import type { TestDefinition } from "../-api/test-definitions.type";
import {
  DataTable,
  type BaseListParams,
  type ColumnDef,
} from "../../../../../../components/reusebale-components/DataTable";
import PageHeader from "../../../../../../components/reusebale-components/PageHeader";
import Button from "../../../../../../components/ui/Button";
import Dialog from "../../../../../../components/ui/Dialog";
import IconButton from "../../../../../../components/ui/IconButton";
import Menu from "../../../../../../components/ui/Menu";
import MenuDivider from "../../../../../../components/ui/Menu/MenuDivider";
import MenuItem from "../../../../../../components/ui/Menu/MenuItem";
import DialogEdit from "./DialogEdit";
import TestDefinitionForm from "./Form";

function DialogCreate() {
  return (
    <Dialog
      isDynamic={true}
      dismissible={false}
      trigger={(openDialog) => (
        <Button onClick={openDialog} startIcon={<Plus size={16} />}>
          Create New Test
        </Button>
      )}
      maxWidth="4xl"
    >
      {(close) => (
        <>
          <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Create New Test
            </h3>
            <IconButton variant="text" size="sm" onClick={close} color="error">
              <X size={20} />
            </IconButton>
          </div>
          <TestDefinitionForm onSuccessCallback={() => close()} />
        </>
      )}
    </Dialog>
  );
}

function ActionMenu({ row }: { row: TestDefinition }) {
  const navigate = useNavigate({ from: Route.fullPath });
  const publishMutation = usePublishTestDefinitionMutation();
  const archiveMutation = useArchiveTestDefinitionMutation();
  const deleteMutation = useDeleteTestDefinitionMutation();

  const handlePublish = () => {
    if (
      confirm(
        "Apakah Anda yakin ingin mem-publish tes ini? Setelah ACTIVE, tes akan terkunci dan tidak bisa diedit lagi.",
      )
    ) {
      publishMutation.mutate(row.id);
    }
  };

  const handleArchive = () => {
    if (confirm("Apakah Anda yakin ingin mengarsipkan tes ini?")) {
      archiveMutation.mutate(row.id);
    }
  };

  const handleDelete = () => {
    if (confirm("Apakah Anda yakin ingin menghapus tes ini?")) {
      deleteMutation.mutate(row.id);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Menu
        trigger={
          <IconButton size="sm" variant="text">
            <MoreVertical size={16} />
          </IconButton>
        }
        position="bottom-end"
      >
        {(close) => (
          <div className="p-1 min-w-40">
            <MenuItem
              iconStart={<Settings size={16} />}
              onClick={() => {
                close();
                navigate({ to: row.id });
              }}
            >
              Builder / Detail
            </MenuItem>

            {row.status === "DRAFT" && <DialogEdit id={row.id} />}

            {row.status === "DRAFT" && (
              <MenuItem
                iconStart={<CheckCircle size={16} />}
                onClick={() => {
                  close();
                  handlePublish();
                }}
                className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                Publish
              </MenuItem>
            )}

            {row.status === "ACTIVE" && (
              <MenuItem
                iconStart={<Archive size={16} />}
                onClick={() => {
                  close();
                  handleArchive();
                }}
                className="text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
              >
                Archive
              </MenuItem>
            )}

            {row.status === "DRAFT" && (
              <>
                <MenuDivider />
                <MenuItem
                  iconStart={<Trash size={16} />}
                  onClick={() => {
                    close();
                    handleDelete();
                  }}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Delete
                </MenuItem>
              </>
            )}
          </div>
        )}
      </Menu>
    </div>
  );
}

export default function TestManagement() {
  const tableState = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data, isLoading, isFetching } = useGetTestDefinitions(tableState);

  const handleStateChange = (newState: BaseListParams) => {
    navigate({ search: (prev) => ({ ...prev, ...newState }), replace: true });
  };

  const columns: ColumnDef<TestDefinition>[] = [
    {
      header: "Test Name",
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
      header: "Category",
      accessorKey: "category",
      sortable: true,
      filterType: "faceted",
      filterOptions: [
        { label: "Ability", value: "ABILITY" },
        {
          label: "Personality (Forced Choice)",
          value: "PERSONALITY_FORCED_CHOICE",
        },
        { label: "Personality (Scale)", value: "PERSONALITY_SCALE" },
        { label: "Interest", value: "INTEREST" },
        { label: "Speed & Endurance", value: "SPEED_ENDURANCE" },
        { label: "Projective", value: "PROJECTIVE" },
        { label: "Management", value: "MANAGEMENT" },
      ],
      cell: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {row.category.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      filterType: "faceted",
      filterOptions: [
        { label: "Active", value: "ACTIVE" },
        { label: "Draft", value: "DRAFT" },
        { label: "Archived", value: "ARCHIVED" },
      ],
      cell: (row) => (
        <span
          className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${
            row.status === "ACTIVE"
              ? "bg-green-50 text-green-700 border-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
              : row.status === "DRAFT"
                ? "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800"
                : "bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Details",
      accessorKey: "totalItems",
      cell: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p>{row.totalItems} items</p>
          <p className="text-xs text-gray-400">{row.estimatedMinutes} mins</p>
        </div>
      ),
    },
    {
      header: "Target",
      accessorKey: "targetAge",
      cell: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p>
            {row.targetAge?.min || 0} - {row.targetAge?.max || "∞"} yrs
          </p>
          <p className="text-xs text-gray-400">
            Min: {row.minEducation || "-"}
          </p>
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row) => <ActionMenu row={row} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Test Management"
        subtitle="Manage psychometric test definitions and configurations."
        other={<DialogCreate />}
        breadcrumbs={["Test Definition"]}
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        meta={data?.meta}
        state={tableState}
        onStateChange={handleStateChange}
        isLoading={isLoading || isFetching}
      />
    </>
  );
}
