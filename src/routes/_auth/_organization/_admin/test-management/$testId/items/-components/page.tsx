import { Route } from "..";
import { useGetTestDefinition } from "../../../-api/test-definitions.query";
import ItemManagement from "./ItemManagement";

function TestItems() {
  const { testId } = Route.useParams();
  const { data, isLoading } = useGetTestDefinition(testId);

  if (isLoading) return <div className="p-8 text-center">Memuat data...</div>;
  if (!data?.data)
    return <div className="p-8 text-center">Tes tidak ditemukan</div>;

  const { test } = data.data;

  return (
    <ItemManagement
      testId={testId}
      isLocked={test.status !== "DRAFT"}
      category={test.category}
    />
  );
}

export default TestItems;
