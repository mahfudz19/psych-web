import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";
import { routeTree } from "./routeTree.gen";
import "./i18n";
import { useAuth } from "./hooks/useAuth";

const GlobalPendingComponent = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-default">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin h-10 w-10 text-primary-main"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="text-text-secondary font-medium text-sm tracking-wide animate-pulse">
          Menyiapkan ruang kerja...
        </p>
      </div>
    </div>
  );
};

// 1. Inisialisasi QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// 2. Inisialisasi Router instance (Hanya untuk context statis)
const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: undefined!,
  },
  defaultPreload: "intent",
  defaultNotFoundComponent: GlobalPendingComponent,
  defaultPendingMs: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// 3. BUAT KOMPONEN PEMBUNGKUS (APP)
// Ini diperlukan agar kita bisa memanggil hook useAuth di dalam React Lifecycle
function App() {
  const auth = useAuth(); // Ambil state autentikasi Anda

  return (
    // 4. Injeksi context dinamis melalui RouterProvider
    <RouterProvider router={router} context={{ queryClient, auth }} />
  );
}

// 5. Render komponen App di dalam root
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App /> {/* Menggantikan <RouterProvider /> langsung */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
