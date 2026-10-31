import { createFileRoute } from "@tanstack/react-router";
import { StudentDriveFolders } from "@/components/StudentDriveFolders";

export const Route = createFileRoute("/_app/assignments")({
  head: () => ({
    meta: [
      { title: "과제 | K-Move LMS" },
      { name: "description", content: "수강생별 Google Drive 과제 폴더" },
      { property: "og:title", content: "과제" },
      { property: "og:description", content: "수강생별 Google Drive 과제 폴더" },
    ],
  }),
  component: Assignments,
});

function Assignments() {
  return <StudentDriveFolders kind="assignment" />;
}
