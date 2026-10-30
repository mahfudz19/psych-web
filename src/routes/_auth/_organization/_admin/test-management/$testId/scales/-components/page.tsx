import { Route } from "..";
import ScaleManagement from "./ScaleManagement";
import { useGetTestDefinition } from "../../../-api/test-definitions.query";

function TestScales() {
  const { testId } = Route.useParams();
  const { data, isLoading } = useGetTestDefinition(testId);

  if (isLoading) return <div className="p-8 text-center">Memuat data...</div>;
  if (!data?.data)
    return <div className="p-8 text-center">Tes tidak ditemukan</div>;

  const { test } = data.data;

  return <ScaleManagement testId={testId} isLocked={test.status !== "DRAFT"} />;
}

export default TestScales;
