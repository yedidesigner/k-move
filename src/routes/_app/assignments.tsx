import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/assignments")({
  beforeLoad: ({ location }) => {
    throw redirect({ to: "/feedback", search: location.search, replace: true });
  },
});
