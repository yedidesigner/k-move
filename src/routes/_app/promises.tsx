import { createFileRoute } from "@tanstack/react-router";
import { OurPromises } from "@/components/OurPromises";

export const Route = createFileRoute("/_app/promises")({
  head: () => ({
    meta: [{ title: "OUR PROMISE | K-Move LMS" }, { name: "robots", content: "noindex" }],
  }),
  component: OurPromises,
});
