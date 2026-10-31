import { createFileRoute } from "@tanstack/react-router";
import { FolderCollection } from "@/components/FolderCollection";

import { ASSIGNMENT_FOLDERS, ASSIGNMENT_ROOT_FOLDER_URL } from "@/data/student-roster";

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
  return (
    <FolderCollection
      title="ASSIGNMENTS"
      rootFolderUrl={ASSIGNMENT_ROOT_FOLDER_URL}
      folders={ASSIGNMENT_FOLDERS}
      tone="sky"
      listLabel="수강생 과제 폴더"
    />
  );
}
