import { createFileRoute, redirect } from "@tanstack/react-router";
import { isAuthenticated } from "../utils/auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (isAuthenticated()) {
      throw redirect({ to: "/dashboard" });
    } else {
      throw redirect({ to: "/login" });
    }
  },
  // Komponen tidak akan pernah dirender karena selalu di-redirect
  component: () => null,
});
