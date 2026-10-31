import { createFileRoute } from "@tanstack/react-router";
import { AssignmentWorkspace } from "@/components/instructor/AssignmentWorkspace";

export const Route = createFileRoute("/_app/feedback")({
  head: () => ({
    meta: [{ title: "피드백 | K-Move LMS" }, { name: "robots", content: "noindex" }],
  }),
  component: AssignmentWorkspace,
});
