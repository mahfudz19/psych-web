import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";

// Import generated route tree (file ini akan di-generate otomatis oleh Vite saat di-save)
import { routeTree } from "./routeTree.gen";

// Inisialisasi QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Inisialisasi Router instance
const router = createRouter({
  routeTree,
  // Context opsional jika kamu ingin inject queryClient ke loader router
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  // Error handling akan default mengikuti __root.tsx jika kita mendefinisikannya di sana
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
