import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import DarkMode from "../../components/layout/Topbar/DarkMode";
import Button from "../../components/ui/Button";
import Chip from "../../components/ui/Chip";
import IconButton from "../../components/ui/IconButton";
import Input from "../../components/ui/Input";
import Tabs from "../../components/ui/Tabs";
import Tab from "../../components/ui/Tabs/Tab";
import TabContent from "../../components/ui/Tabs/TabContent";

export const Route = createFileRoute("/example-page/")({
  component,
});

function component() {
  type MenuKey = "button" | "tabs" | "chip";

  interface MenuItem {
    id: MenuKey;
    label: string;
    description: string;
    icon: React.ReactNode;
  }
  const MENU_ITEMS: MenuItem[] = [
    {
      id: "button",
      label: "Button",
      description: "Standard & Icon buttons",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
          />
        </svg>
      ),
    },
    {
      id: "tabs",
      label: "Tabs",
      description: "Navigation & segment tabs",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      ),
    },
    {
      id: "chip",
      label: "Chip",
      description: "Tags, badges & status",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
    },
  ];
  const [activeMenu, setActiveMenu] = useState<MenuKey>("button");

  return (
    <div className="min-h-screen bg-bg-default text-text-primary flex flex-col md:flex-row">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 bg-bg-paper border-b md:border-b-0 md:border-r border-divider shrink-0 md:sticky md:top-0 md:h-screen flex flex-col justify-between">
        <div className="p-6">
          {/* Brand / Title Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary-main flex items-center justify-center text-primary-contrast font-bold text-lg shadow-sm">
              DS
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight leading-tight">
                Design System
              </h2>
              <p className="text-xs text-text-secondary">
                UI Component Gallery
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <p className="text-xs flex justify-between font-semibold uppercase tracking-wider text-text-disabled px-3 mb-2">
              Components
              <DarkMode />
            </p>
            {MENU_ITEMS.map((item) => {
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition-all duration-150 group ${
                    isActive
                      ? "bg-primary-main/10 text-primary-main font-semibold"
                      : "text-text-secondary hover:bg-bg-default hover:text-text-primary"
                  }`}
                >
                  <span
                    className={`transition-colors ${
                      isActive
                        ? "text-primary-main"
                        : "text-text-disabled group-hover:text-text-secondary"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm leading-none">{item.label}</div>
                    <div className="text-[11px] text-text-disabled truncate mt-1 font-normal">
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-main" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-divider text-xs text-text-disabled text-center">
          Tailwind v4 • Custom Tokens
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {activeMenu === "button" && <ButtonShowcase />}
          {activeMenu === "tabs" && <TabsPage />}
          {activeMenu === "chip" && <ChipShowcase />}
        </div>
      </main>
    </div>
  );
}

function ButtonShowcase() {
  const COLORS = [
    "primary",
    "secondary",
    "success",
    "error",
    "warning",
    "info",
    "neutral",
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

function ChipShowcase() {
  const COLORS = [
    "primary",
    "secondary",
    "success",
    "error",
    "warning",
    "info",
    "white",
  ] as const;

  const VARIANTS = [
    { key: "contained", title: "Contained (Default)" },
    { key: "outlined", title: "Outlined" },
    { key: "light", title: "Light" },
  ] as const;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-16 bg-neutral-50 dark:bg-neutral-900 min-h-screen rounded-xl text-neutral-800 dark:text-neutral-100">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Komponen Chip Showcase
        </h1>
        <p className="text-neutral-500 mt-2 text-lg">
          Galeri lengkap untuk menguji semua variasi, ukuran, dan ikon pada
          komponen Chip.
        </p>
      </div>

      {/* BAGIAN 1: VARIANTS & COLORS */}
      <div className="space-y-12">
        <div className="border-l-4 border-primary-main pl-4">
          <h2 className="text-3xl font-bold">1. Variants & Colors</h2>
          <p className="text-neutral-500 text-sm mt-1">
            Kombinasi antara tipe varian (Contained, Outlined, Light) dengan
            skema warna yang tersedia.
          </p>
        </div>

        <section className="space-y-8">
          {VARIANTS.map(({ key, title }) => (
            <div key={key} className="space-y-3">
              <h3 className="text-sm font-medium uppercase tracking-wider text-neutral-400">
                {title}
              </h3>
              <div className="flex flex-wrap items-center gap-4 p-6 border border-divider rounded-xl bg-white/50 dark:bg-neutral-800/50">
                {COLORS.map((color) => (
                  <Chip key={`${key}-${color}`} variant={key} color={color}>
                    {color}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* BAGIAN 2: SIZES & ICONS */}
      <div className="space-y-12 pt-8 border-t border-divider">
        <div className="border-l-4 border-secondary-main pl-4">
          <h2 className="text-3xl font-bold">2. Sizes & Icons</h2>
          <p className="text-neutral-500 text-sm mt-1">
            Pengujian skala ukuran dan integrasi ikon opsional (Start Icon & End
            Icon).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sizes */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold">2.1 Sizes</h3>
            <div className="flex flex-wrap items-center gap-4 p-6 border border-divider rounded-xl h-full">
              <Chip size="sm" color="primary">
                Small
              </Chip>
              <Chip size="md" color="primary">
                Medium (Default)
              </Chip>
              <Chip size="lg" color="primary">
                Large
              </Chip>
            </div>
          </section>

          {/* Icons */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold">2.2 With Icons</h3>
            <div className="flex flex-wrap items-center gap-4 p-6 border border-divider rounded-xl h-full">
              <Chip variant="light" color="success" startIcon={<span>✨</span>}>
                Start Icon
              </Chip>
              <Chip variant="outlined" color="error" endIcon={<span>✕</span>}>
                Dismissible
              </Chip>
              <Chip
                variant="contained"
                color="info"
                startIcon={<span>🚀</span>}
                endIcon={<span>⚡</span>}
              >
                Both Icons
              </Chip>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
