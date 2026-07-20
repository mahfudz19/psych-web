import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "../src/utils/api";

const fetchUserProfile = () => apiFetch("/api/v1/users/me");

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context: { queryClient } }) => {
    // Jika token tidak ada di localStorage, jangan repot-repot tembak API
    if (!localStorage.getItem("token")) return;

    try {
      await queryClient.fetchQuery({
        queryKey: ["userProfile"],
        queryFn: fetchUserProfile,
        staleTime: 1000 * 60 * 5,
      });
      throw redirect({ to: "/dashboard" });
    } catch (error) {
      // Token invalid/expired, bersihkan saja
      localStorage.removeItem("token");
    }
  },
  component: Login,
});

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      // Gunakan apiFetch agar rapi
      return apiFetch("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },
    onSuccess: (responseData) => {
      // SIMPAN TOKEN KE LOCAL STORAGE
      // Mengacu pada curl: {"success":true,"data":{"token":"..."}}
      localStorage.setItem("token", responseData.data.token);

      router.invalidate().then(() => {
        router.navigate({ to: "/dashboard" });
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-default px-4">
      <div className="bg-bg-paper p-8 rounded-lg shadow-md border border-divider w-full max-w-sm">
        <h1 className="text-2xl font-bold text-primary-main mb-2 text-center">
          Login @psych-web
        </h1>
        <p className="text-text-secondary text-center mb-6 text-sm">
          Masuk ke akun Anda untuk melanjutkan
        </p>

        {/* Notifikasi Error jika gagal */}
        {loginMutation.isError && (
          <div className="mb-4 p-3 bg-error-main/10 border border-error-main text-error-dark rounded text-sm">
            {loginMutation.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loginMutation.isPending}
              className="px-3 py-2 bg-bg-default border border-divider rounded focus:outline-none focus:border-primary-main text-text-primary transition disabled:opacity-50"
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loginMutation.isPending}
              className="px-3 py-2 bg-bg-default border border-divider rounded focus:outline-none focus:border-primary-main text-text-primary transition disabled:opacity-50"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="mt-2 bg-primary-main text-primary-contrast font-medium py-2 px-4 rounded hover:bg-primary-dark transition disabled:bg-primary-light flex justify-center items-center h-10"
          >
            {loginMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Masuk"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
