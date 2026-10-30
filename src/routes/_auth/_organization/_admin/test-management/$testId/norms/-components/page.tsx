import { Route } from "..";
import NormManagement from "./NormTableService";
import { useGetTestDefinition } from "../../../-api/test-definitions.query";

function TestNorms() {
  const { testId } = Route.useParams();
  const { data, isLoading } = useGetTestDefinition(testId);

  if (isLoading) return <div className="p-8 text-center">Memuat data...</div>;
  if (!data?.data)
    return <div className="p-8 text-center">Tes tidak ditemukan</div>;

  const { test } = data.data;

  return (
    <NormManagement testId={testId} isLocked={test.status === "ARCHIVED"} />
  );
}

export default TestNorms;
