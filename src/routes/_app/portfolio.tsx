import { createFileRoute } from "@tanstack/react-router";
import { FolderCollection } from "@/components/FolderCollection";

import { PORTFOLIO_FOLDERS, PORTFOLIO_ROOT_FOLDER_URL } from "@/data/student-roster";

export const Route = createFileRoute("/_app/portfolio")({
  head: () => ({
    meta: [
      { title: "내 포트폴리오 | K-Move LMS" },
      { name: "description", content: "수강생별 Google Drive 포트폴리오 폴더" },
      { property: "og:title", content: "내 포트폴리오" },
      { property: "og:description", content: "수강생별 Google Drive 포트폴리오 폴더" },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  return (
    <FolderCollection
      title="PORTFOLIO"
      rootFolderUrl={PORTFOLIO_ROOT_FOLDER_URL}
      folders={PORTFOLIO_FOLDERS}
      tone="yellow"
      listLabel="수강생 포트폴리오 폴더"
    />
  );
}
