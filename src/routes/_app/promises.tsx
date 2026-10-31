import { createFileRoute } from "@tanstack/react-router";
import { OurPromises } from "@/components/OurPromises";

export const Route = createFileRoute("/_app/promises")({
  head: () => ({
    meta: [{ title: "우리의 약속 | K-Move LMS" }, { name: "robots", content: "noindex" }],
  }),
  component: OurPromises,
});
