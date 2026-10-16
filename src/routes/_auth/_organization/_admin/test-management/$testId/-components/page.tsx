import { useState } from "react";
import SectionManagement from "./SectionManagement";
import ScaleManagement from "./ScaleManagement";
import ItemManagement from "./ItemManagement";
import NormManagement from "./NormTableService";
import { Route } from "..";
import { useGetTestDefinition } from "../../-api/test-definitions.query";
import Tabs from "../../../../../../../components/ui/Tabs";
import Tab from "../../../../../../../components/ui/Tabs/Tab";
import TabContent from "../../../../../../../components/ui/Tabs/TabContent";

export default function TestDetailLayout() {
  const { testId } = Route.useParams();
  const { data, isLoading } = useGetTestDefinition(testId);
  const [activeTab, setActiveTab] = useState("sections");

  if (isLoading) return <div className="p-8 text-center">Memuat data...</div>;
  if (!data?.data)
    return <div className="p-8 text-center">Tes tidak ditemukan</div>;

  const { test, stats } = data.data;

  return (
    <div className="p-6 space-y-6">
      {/* Header & Stats */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
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
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-4 pt-4 border-b border-gray-200 dark:border-gray-800">
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tab value="sections" label="Sections (Subtes)" />
            <Tab value="scales" label="Scales (Aspek)" />
            <Tab value="items" label="Items (Soal)" />
            <Tab value="norms" label="Norms (Norma)" />
          </Tabs>
        </div>

        <div className="p-6">
          <TabContent value="sections" activeValue={activeTab}>
            <SectionManagement
              testId={testId}
              isLocked={test.status !== "DRAFT"}
            />
          </TabContent>
          <TabContent value="scales" activeValue={activeTab}>
            <ScaleManagement
              testId={testId}
              isLocked={test.status !== "DRAFT"}
            />
          </TabContent>
          <TabContent value="items" activeValue={activeTab}>
            <ItemManagement
              testId={testId}
              isLocked={test.status !== "DRAFT"}
              category={test.category}
            />

            {/* <ItemManagement
              testId={testId}
              isLocked={test.status !== "DRAFT"}
              category={test.category}
              sectionId={focusSectionId}
              onSectionChange={setFocusSectionId}
            /> */}
          </TabContent>
          <TabContent value="norms" activeValue={activeTab}>
            <NormManagement
              testId={testId}
              isLocked={test.status === "ARCHIVED"}
            />
          </TabContent>
        </div>
      </div>
    </div>
  );
}
