import { createFileRoute } from "@tanstack/react-router";
import TestCatalogPage from "./-components/page";

export const Route = createFileRoute("/_auth/_individu/test/")({
  component: TestCatalogPage,
});
