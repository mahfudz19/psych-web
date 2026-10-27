import { Edit, X } from "lucide-react";
import Dialog from "../../../../../../components/ui/Dialog";
import IconButton from "../../../../../../components/ui/IconButton";
import TestDefinitionForm from "./Form";
import { useGetTestDefinition } from "../-api/test-definitions.query";
import MenuItem from "../../../../../../components/ui/Menu/MenuItem";

const Content = ({ id }: { id: string }) => {
  const { data } = useGetTestDefinition(id);
  const testDefinition = data?.data;
  if (!testDefinition) return <></>;

  return (
    <TestDefinitionForm
      testDefinition={testDefinition.test}
      onSuccessCallback={() => close()}
    />
  );
};

function DialogEdit({ id }: { id: string }) {
  return (
    <Dialog
      isDynamic={true}
      dismissible={false}
      trigger={(openDialog) => (
        <MenuItem
          iconStart={<Edit size={16} />}
          onClick={(e) => {
            close();
            openDialog(e);
          }}
        >
          Edit
        </MenuItem>
        // <IconButton onClick={openDialog} size="sm" variant="text">
        //   <Edit size={16} />
        // </IconButton>
      )}
      maxWidth="4xl"
    >
      {(close) => (
        <>
          <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Edit Test
            </h3>
            <IconButton variant="text" size="sm" onClick={close} color="error">
              <X size={20} />
            </IconButton>
          </div>
          <Content id={id} />
        </>
      )}
    </Dialog>
  );
}

export default DialogEdit;
