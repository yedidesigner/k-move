import { createFileRoute, redirect } from "@tanstack/react-router";

// Keep existing bookmarks working after learning content moved into the glossary.
export const Route = createFileRoute("/_app/materials")({
  beforeLoad: () => {
    throw redirect({ to: "/glossary", replace: true });
  },
});
