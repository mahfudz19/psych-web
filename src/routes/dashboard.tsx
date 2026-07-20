import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../src/utils/api";

const fetchUserProfile = () => apiFetch("/api/v1/users/me");

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context: { queryClient } }) => {
    if (!localStorage.getItem("token")) {
      throw redirect({ to: "/login" });
    }

    try {
      await queryClient.fetchQuery({
        queryKey: ["userProfile"],
        queryFn: fetchUserProfile,
        staleTime: 1000 * 60 * 5,
      });
    } catch (error) {
      localStorage.removeItem("token");
      throw redirect({ to: "/login" });
    }
  },
  component: Dashboard,
});

function Dashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: responseData } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Jika backend Anda butuh request POST untuk menghancurkan session
      await apiFetch("/api/v1/auth/logout", { method: "POST" });
    },
    onSettled: () => {
      // Hapus token dari client, apa pun hasil dari API logout
      localStorage.removeItem("token");
      queryClient.clear();
      router.invalidate().then(() => {
        router.navigate({ to: "/login" });
      });
    },
  });

  // MENYESUAIKAN DENGAN STRUKTUR CURL: user ada langsung di dalam .data
  const user = responseData?.data || {};

  return (
    <div className="min-h-screen bg-bg-default flex flex-col">
      {/* Navbar Minimalis */}
      <header className="bg-bg-paper border-b border-divider px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-primary-main">@psych-web</h1>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            {/* Field fullName dan email sekarang akan terbaca dengan benar */}
            <p className="text-sm font-semibold text-text-primary">
              {user.fullName || "User"}
            </p>
            <p className="text-xs text-text-secondary">{user.email}</p>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="px-4 py-2 border border-error-main text-error-main rounded hover:bg-error-main hover:text-white transition disabled:opacity-50 text-sm font-medium"
          >
            {logoutMutation.isPending ? "Keluar..." : "Logout"}
          </button>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="flex-1 p-8 max-w-5xl w-full mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text-primary mb-2">
            Ikhtisar Dashboard
          </h2>
          <p className="text-text-secondary">
            Selamat datang kembali, kelola aktivitas Anda di sini.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kartu Profil */}
          <div className="bg-bg-paper border border-divider p-6 rounded-lg shadow-sm md:col-span-1">
            <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-divider pb-2">
              Informasi Akun
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-text-disabled uppercase font-medium tracking-wider">
                  Status
                </p>
                <p className="text-sm font-medium text-success-main capitalize">
                  {user.status || "Active"}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-disabled uppercase font-medium tracking-wider">
                  Peran
                </p>
                <div className="flex gap-2 mt-1">
                  {(user.roles || ["USER"]).map((role: string) => (
                    <span
                      key={role}
                      className="bg-primary-light/20 text-primary-dark px-2 py-0.5 rounded text-xs font-semibold"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-text-disabled uppercase font-medium tracking-wider">
                  Tipe Akun
                </p>
                <p className="text-sm font-medium text-text-primary capitalize">
                  {user.accountType || "Individual"}
                </p>
              </div>
            </div>
          </div>

          {/* Area Konten Dinamis */}
          <div className="bg-bg-paper border border-divider p-6 rounded-lg shadow-sm md:col-span-2 flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <p className="text-text-disabled mb-2 text-4xl">📊</p>
              <p className="text-text-secondary">
                Area statistik atau widget aplikasi akan tampil di sini.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
