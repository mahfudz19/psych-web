import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import PageHeader from "../../../../../components/reusebale-components/PageHeader";
import Card from "../../../../../components/ui/Card";
import { useGetTestDefinition } from "./-api/test-definitions.query";
import Paper from "../../../../../components/ui/Paper";
import Tabs from "../../../../../components/ui/Tabs";
import Tab from "../../../../../components/ui/Tabs/Tab";

export const Route = createFileRoute(
  "/_auth/_organization/_admin/test-management/$testId",
)({
  component: RouteComponent,
});

const TABS = [
  { value: "sections", label: "Sections (Subtes)", path: "" },
  { value: "scales", label: "Scales (Aspek)", path: "/scales" },
  { value: "items", label: "Items (Soal)", path: "/items" },
  { value: "norms", label: "Norms (Norma)", path: "/norms" },
] as const;

function RouteComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { testId } = Route.useParams();
  const { data, isLoading } = useGetTestDefinition(testId);

  if (isLoading) return <div className="p-8 text-center">Memuat data...</div>;
  if (!data?.data)
    return <div className="p-8 text-center">Tes tidak ditemukan</div>;

  const { test, stats } = data.data;
  const currentTab = location.pathname;

  const handleTabChange = (to: string) => navigate({ to });
  const path = `/test-management/${testId}`;

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Test Definition", href: "/test-management" },
          "Detail",
        ]}
      />
      {/* Header & Stats */}
      <Card className="mb-6 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {test.name}{" "}
              <span className="text-gray-400 text-lg font-normal">
                ({test.code})
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">{test.description}</p>
          </div>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full border ${
              test.status === "ACTIVE"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-yellow-50 text-yellow-700 border-yellow-200"
            }`}
          >
            {test.status}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.sections}
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Sections
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.scales}
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Scales
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.items}
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Items
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.norms}
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Norms
            </p>
          </div>
        </div>
      </Card>

      <Paper className="p-6">
        <Tabs value={currentTab} onChange={handleTabChange} className="mb-4">
          {TABS.map((v) => (
            <Tab
              key={v.value}
              value={`${path}${v.path}`}
              label={v.label}
              component={Link}
            />
          ))}
        </Tabs>

        <Outlet />
      </Paper>
    </div>
  );
}
