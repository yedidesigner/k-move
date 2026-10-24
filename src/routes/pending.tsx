import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/pending")({
  ssr: false,
  component: () => <Navigate to="/" />,
});
