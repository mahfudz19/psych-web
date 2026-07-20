import { createFileRoute, redirect, useRouter } from "@tanstack/react-router"; //[cite: 13]
import { useMutation } from "@tanstack/react-query"; //[cite: 13]
import { useState } from "react"; //[cite: 13]
import { apiFetch } from "../src/utils/api"; //[cite: 13]

const fetchUserProfile = () => apiFetch("/api/v1/auth/me"); //[cite: 13]

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context: { queryClient } }) => {
    let isSuccess = false;

    try {
      await queryClient.fetchQuery({
        queryKey: ["userProfile"], //[cite: 13]
        queryFn: fetchUserProfile, //[cite: 13]
        staleTime: 1000 * 60 * 5, //[cite: 13]
      });
      isSuccess = true;
    } catch (error) {
      isSuccess = false;
    }

    // Eksekusi redirect secara aman di luar blok try-catch
    if (isSuccess) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: Login, //[cite: 13]
});

function Login() {
  const router = useRouter(); //[cite: 13]
  const [email, setEmail] = useState(""); //[cite: 13]
  const [password, setPassword] = useState(""); //[cite: 13]

  const loginMutation = useMutation({
    mutationFn: async () => {
      return apiFetch("/api/v1/auth/login", {
        //[cite: 13]
        method: "POST", //[cite: 13]
        body: JSON.stringify({ email, password }), //[cite: 13]
      });
    },
    onSuccess: () => {
      router.invalidate().then(() => {
        //[cite: 13]
        router.navigate({ to: "/dashboard" }); //[cite: 13]
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    //[cite: 13]
    e.preventDefault(); //[cite: 13]
    if (!email || !password) return; //[cite: 13]
    loginMutation.mutate(); //[cite: 13]
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
