import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { QueryClient } from "@tanstack/react-query";

export interface MyRouterContext {
  queryClient: QueryClient;
}

const GlobalErrorComponent = ({ error }: { error: Error }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-default p-4 text-center">
      <div className="bg-bg-paper p-8 rounded-lg shadow-md border border-error-main max-w-md w-full">
        <h1 className="text-2xl font-bold text-error-main mb-2">
          Terjadi Kesalahan!
        </h1>
        <p className="text-text-secondary mb-4">
          {error.message || "Sistem mengalami gangguan yang tidak terduga."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary-main text-primary-contrast px-4 py-2 rounded hover:bg-primary-dark transition"
        >
          Muat Ulang Halaman
        </button>
      </div>
    </div>
  );
};

const GlobalNotFoundComponent = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-default p-4 text-center">
      <h1 className="text-6xl font-bold text-warning-main mb-4">404</h1>
      <h2 className="text-xl font-semibold text-text-primary mb-2">
        Halaman Tidak Ditemukan
      </h2>
      <p className="text-text-secondary mb-6">
        Maaf, rute yang Anda tuju tidak tersedia di aplikasi ini.
      </p>
      <Link
        to="/"
        className="bg-primary-main text-primary-contrast px-4 py-2 rounded hover:bg-primary-dark transition inline-block"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
};

const GlobalPendingComponent = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-default">
      <div className="text-primary-main flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-primary-main border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-text-secondary font-medium">Memuat halaman...</p>
      </div>
    </div>
  );
};

// --- Registrasi Root Route ---
export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  ),
  errorComponent: GlobalErrorComponent,
  notFoundComponent: GlobalNotFoundComponent,
  pendingComponent: GlobalPendingComponent,
});
