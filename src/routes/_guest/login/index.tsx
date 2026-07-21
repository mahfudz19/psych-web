import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../../utils/api";

export const Route = createFileRoute("/_guest/login/")({
  component: Login,
});

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: () =>
      api("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    onSuccess: () => {
      // Invalidate memaksa router menjalankan ulang beforeLoad di semua rute
      router.invalidate().then(() => {
        router.navigate({ to: "/dashboard" });
      });
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div
      style={{ border: "1px solid #ccc", padding: "2rem", maxWidth: "400px" }}
    >
      <h3>Masuk ke Akun</h3>
      {loginMutation.isError && (
        <p style={{ color: "red" }}>Login Gagal: Periksa kredensial Anda.</p>
      )}

      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
}
