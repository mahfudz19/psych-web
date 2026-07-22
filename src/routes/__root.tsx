import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { QueryClient } from "@tanstack/react-query";
import { TopProgressBar } from "../components/layout/TopProgressBar";

export interface MyRouterContext {
  queryClient: QueryClient;
}

// 1. Ubah tipe error menjadi 'any' (atau custom interface) agar kita bisa mengekstrak properti status dari API
const GlobalErrorComponent = ({ error }: { error: any }) => {
  // Mengekstrak HTTP Status Code dari berbagai kemungkinan struktur Error API (Axios / Fetch)
  const statusCode =
    error?.status || error?.response?.status || error?.statusCode || "500";

  // Mengekstrak pesan error spesifik dari Backend, atau gunakan bawaan Javascript, atau gunakan default
  const errorMessage =
    error?.response?.data?.message ||
    error?.message ||
    "Sistem mengalami gangguan yang tidak terduga saat memproses permintaan Anda.";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-default p-6 text-center font-sans">
      <div className="max-w-md w-full">
        {/* Badge Status Code */}
        <div className="inline-block px-4 py-1.5 bg-error-main/10 text-error-main font-black text-sm tracking-widest rounded-full mb-6 border border-error-main/20">
          ERROR {statusCode}
        </div>

        <h1 className="text-3xl lg:text-4xl font-extrabold text-text-primary tracking-tight mb-4">
          Terjadi Kesalahan
        </h1>

        <p className="text-text-secondary mb-8 leading-relaxed text-sm lg:text-base">
          {errorMessage}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-main text-primary-contrast rounded-2xl font-bold text-sm hover:bg-primary-dark active:scale-[0.99] transition-all shadow-md shadow-primary-main/20"
          >
            Muat Ulang Halaman
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-transparent text-text-primary border border-divider rounded-2xl font-bold text-sm hover:bg-divider/20 active:scale-[0.99] transition-all"
          >
            Kembali ke Sebelumnya
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Perbarui juga UI 404 agar senada dengan GlobalErrorComponent
const GlobalNotFoundComponent = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-default p-6 text-center font-sans">
      <div className="max-w-md w-full">
        <div className="inline-block px-4 py-1.5 bg-warning-main/10 text-warning-main font-black text-sm tracking-widest rounded-full mb-6 border border-warning-main/20">
          ERROR 404
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-text-primary tracking-tight mb-4">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-text-secondary mb-8 leading-relaxed text-sm lg:text-base">
          Maaf, rute atau halaman yang Anda tuju tidak tersedia di aplikasi ini
          atau telah dipindahkan.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 bg-primary-main text-primary-contrast rounded-2xl font-bold text-sm hover:bg-primary-dark active:scale-[0.99] transition-all shadow-md shadow-primary-main/20"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <TopProgressBar />
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  ),
  errorComponent: GlobalErrorComponent,
  notFoundComponent: GlobalNotFoundComponent,
  pendingMs: 0,
  ssr: true,
});
