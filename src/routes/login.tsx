import { createFileRoute, redirect } from "@tanstack/react-router";
import { isAuthenticated } from "../utils/auth";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (isAuthenticated()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: Login,
});

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-default">
      <div className="bg-bg-paper p-8 rounded-lg shadow-md border border-divider w-full max-w-sm">
        <h1 className="text-2xl font-bold text-primary-main mb-6 text-center">
          Login @psych-web
        </h1>
        {/* Form login kamu akan ada di sini */}
        <p className="text-text-secondary text-center">
          Silakan masukkan kredensial Anda.
        </p>
      </div>
    </div>
  );
}
