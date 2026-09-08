import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";
import Input from "../../components/ui/Input";
import Tabs from "../../components/ui/Tabs";
import Tab from "../../components/ui/Tabs/Tab";
import TabContent from "../../components/ui/Tabs/TabContent";

export const Route = createFileRoute("/example-page/")({
  component: ButtonShowcase,
});

export default function ButtonShowcase() {
  const COLORS = [
    "primary",
    "secondary",
    "success",
    "error",
    "warning",
    "info",
    "white",
  ] as const;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-16 bg-neutral-50 dark:bg-neutral-900 min-h-screen rounded-xl text-neutral-800 dark:text-neutral-100">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Komponen UI Showcase
        </h1>
        <p className="text-neutral-500 mt-2 text-lg">
          Galeri lengkap untuk menguji semua variasi komponen Button dan
          IconButton.
        </p>
      </div>

      {/* ========================================================= */}
      {/* BAGIAN 1: REGULAR BUTTONS */}
      {/* ========================================================= */}
      <div className="space-y-12">
        <div className="border-l-4 border-primary-main pl-4">
          <h2 className="text-3xl font-bold">1. Standard Button</h2>
          <p className="text-neutral-500 text-sm mt-1">
            Tombol standar dengan teks dan ikon opsional.
          </p>
        </div>

        {/* Variants & Colors */}
        <section className="space-y-6">
          <h3 className="text-2xl font-semibold">1.1 Variants & Colors</h3>

          <div className="space-y-3">
            <h4 className="text-sm font-medium uppercase tracking-wider text-neutral-400">
              Contained (Default)
            </h4>
            <div className="flex flex-wrap gap-4 p-6 border border-divider rounded-xl">
              {COLORS.map((color) => (
                <Button
                  key={`contained-${color}`}
                  variant="contained"
                  color={color}
                >
                  {color}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium uppercase tracking-wider text-neutral-400">
              Outlined
            </h4>
            <div className="flex flex-wrap gap-4 p-6 border border-divider rounded-xl">
              {COLORS.map((color) => (
                <Button
                  key={`outlined-${color}`}
                  variant="outlined"
                  color={color}
                >
                  {color}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium uppercase tracking-wider text-neutral-400">
              Text
            </h4>
            <div className="flex flex-wrap gap-4 p-6 border border-divider rounded-xl">
              {COLORS.map((color) => (
                <Button key={`text-${color}`} variant="text" color={color}>
                  {color}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Sizes, States, Icons, Utility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h3 className="text-xl font-semibold">1.2 Sizes</h3>
            <div className="flex flex-wrap items-center gap-6 p-6 border border-divider rounded-xl h-full">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">1.3 States</h3>
            <div className="flex flex-wrap items-center gap-6 p-6 border border-divider rounded-xl h-full">
              <Button disabled>Disabled</Button>
              <Button variant="outlined" disabled>
                Disabled Outlined
              </Button>
              <Button loading>Loading</Button>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">1.4 Icons & Utilities</h3>
            <div className="flex flex-wrap items-center gap-6 p-6 border border-divider rounded-xl h-full">
              <Button startIcon={<span>👈</span>}>Start</Button>
              <Button endIcon={<span>👉</span>} color="secondary">
                End
              </Button>
              <Button noRipple color="warning">
                No Ripple
              </Button>
              <Button fullWidth color="info">
                Full Width
              </Button>
            </div>
          </section>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BAGIAN 2: ICON BUTTONS */}
      {/* ========================================================= */}
      <div className="space-y-12 pt-8 border-t border-divider">
        <div className="border-l-4 border-secondary-main pl-4">
          <h2 className="text-3xl font-bold">2. Icon Button</h2>
          <p className="text-neutral-500 text-sm mt-1">
            Tombol berbentuk lingkaran khusus untuk menampung satu ikon[cite:
            6].
          </p>
        </div>

        {/* Variants & Colors */}
        <section className="space-y-6">
          <h3 className="text-2xl font-semibold">2.1 Variants & Colors</h3>

          <div className="space-y-3">
            <h4 className="text-sm font-medium uppercase tracking-wider text-neutral-400">
              Contained
            </h4>
            <div className="flex flex-wrap gap-4 p-6 border border-divider rounded-xl">
              {COLORS.map((color) => (
                <IconButton
                  key={`icon-contained-${color}`}
                  variant="contained"
                  color={color}
                >
                  🌟
                </IconButton>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium uppercase tracking-wider text-neutral-400">
              Outlined
            </h4>
            <div className="flex flex-wrap gap-4 p-6 border border-divider rounded-xl">
              {COLORS.map((color) => (
                <IconButton
                  key={`icon-outlined-${color}`}
                  variant="outlined"
                  color={color}
                >
                  🌟
                </IconButton>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium uppercase tracking-wider text-neutral-400">
              Text
            </h4>
            <div className="flex flex-wrap gap-4 p-6 border border-divider rounded-xl bg-neutral-200 dark:bg-neutral-800">
              {COLORS.map((color) => (
                <IconButton
                  key={`icon-text-${color}`}
                  variant="text"
                  color={color}
                >
                  🌟
                </IconButton>
              ))}
            </div>
          </div>
        </section>

        {/* Sizes & States */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h3 className="text-xl font-semibold">2.2 Sizes</h3>
            <div className="flex flex-wrap items-end gap-6 p-6 border border-divider rounded-xl h-full">
              <IconButton size="sm" color="info">
                👍
              </IconButton>
              <IconButton size="md" color="success">
                👍
              </IconButton>
              <IconButton size="lg" color="error">
                👍
              </IconButton>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">2.3 States & Utilities</h3>
            <div className="flex flex-wrap items-center gap-6 p-6 border border-divider rounded-xl h-full">
              <IconButton disabled>🚫</IconButton>
              <IconButton variant="outlined" disabled>
                🚫
              </IconButton>
              <IconButton loading>⏳</IconButton>
              <IconButton noRipple color="warning">
                ⚡
              </IconButton>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function TabsPage() {
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
