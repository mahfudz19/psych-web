import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Input from "../../components/ui/Input";
import Tabs from "../../components/ui/Tabs";
import Tab from "../../components/ui/Tabs/Tab";
import TabContent from "../../components/ui/Tabs/TabContent";

export const Route = createFileRoute("/example-page/")({
  component: ExamplePage,
});

function ExamplePage() {
  const myTabs = [
    {
      value: "general",
      label: "Umum",
    },
    {
      value: "security",
      label: "Keamanan",
    },
    {
      value: "billing",
      label: "Tagihan",
    },
    {
      value: "notifications",
      label: "Pemberitahuan",
    },
    {
      value: "integrations",
      label: "Integrasi",
    },
  ];

  const [activeTab, setActiveTab] = useState("integrations");

  const handleChange = (newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <Tabs value={activeTab} onChange={handleChange}>
        {myTabs.map((tab) => (
          <Tab label={tab.label} value={tab.value} key={tab.value} />
        ))}
      </Tabs>

      {myTabs.map((tab) => (
        <TabContent value={tab.value} activeValue={activeTab}>
          <div className="p-4 bg-bg-paper border border-divider rounded-xl">
            <label className="block text-sm mb-2">Item One Input</label>
            <Input placeholder="Ketik sesuatu..." className="w-full" />
          </div>
        </TabContent>
      ))}
    </div>
  );
}
