import { EllipsisVertical, Pen, Trash, AlertTriangle } from "lucide-react";
import type { SubscriptionPlan } from "../-api/subscriptionPlan.type";
import IconButton from "../../../../../../components/ui/IconButton";
import Menu from "../../../../../../components/ui/Menu";
import MenuItem from "../../../../../../components/ui/Menu/MenuItem";
import Dialog from "../../../../../../components/ui/Dialog";
import Button from "../../../../../../components/ui/Button";
import SubscriptionPlanForm from "./Form";
import { useDeleteSubscriptionPlanMutation } from "../-api/subscriptionPlan.query";

interface Props {
  subscriptionPlan: SubscriptionPlan;
}

function DialogEdit(props: Props & { closeMenu: () => void }) {
  return (
    <Dialog
      isDynamic={true}
      trigger={(openDialog) => (
        <MenuItem
          onClick={(e) => {
            openDialog(e);
          }}
          iconStart={<Pen size={16} />}
        >
          Edit
        </MenuItem>
      )}
    >
      {(close) => (
        <div className="p-6 space-y-4 max-w-lg w-full">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Edit Subscription Plan
            </h3>
          </div>
          <SubscriptionPlanForm
            subscriptionPlan={props.subscriptionPlan}
            onSuccessCallback={() => {
              close();
              //   props.closeMenu();
            }}
          />
        </div>
      )}
    </Dialog>
  );
}

function DialogDelete(props: Props & { closeMenu: () => void }) {
  const deleteMutation = useDeleteSubscriptionPlanMutation();

  return (
    <Dialog
      isDynamic={true}
      dismissible={!deleteMutation.isPending}
      trigger={(openDialog) => (
        <MenuItem
          rippleColor="error"
          className="text-error-main hover:bg-error-main/10 hover:text-error-main focus:bg-error-main/10 focus:text-error-main disabled:opacity-50"
          onClick={(e) => {
            openDialog(e);
          }}
          iconStart={<Trash size={16} />}
        >
          Delete
        </MenuItem>
      )}
    >
      {(close) => (
        <div className="p-6 max-w-md w-full text-center space-y-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Hapus Paket Langganan
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Apakah Anda yakin ingin menghapus paket{" "}
              <strong className="text-gray-900 dark:text-gray-100">
                {props.subscriptionPlan.name}
              </strong>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              type="button"
              variant="outlined"
              onClick={close}
              disabled={deleteMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              color="error"
              onClick={() => {
                deleteMutation.mutate(props.subscriptionPlan.id, {
                  onSuccess: () => {
                    close();
                    //   props.closeMenu();
                  },
                });
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

function SubscriptionPlanActionRow(props: Props) {
  return (
    <Menu
      position="bottom-end"
      widthClass="w-48"
      trigger={
        <IconButton size="sm" variant="text" className="text-sm">
          <EllipsisVertical size={16} />
        </IconButton>
      }
    >
      {(closeMenu) => (
        <div className="flex flex-col">
          <DialogEdit {...props} closeMenu={closeMenu} />
          <DialogDelete {...props} closeMenu={closeMenu} />
        </div>
      )}
    </Menu>
  );
}

export default SubscriptionPlanActionRow;
