import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, FolderOpen } from "lucide-react";

const DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1ylEME231wJeG9okmvJaPjKtGO_kccfAo";

export const Route = createFileRoute("/_app/portfolio")({
  head: () => ({
    meta: [
      { title: "내 포트폴리오 | K-Move LMS" },
      { name: "description", content: "Google Drive 포트폴리오 폴더 바로가기" },
      { property: "og:title", content: "내 포트폴리오" },
      { property: "og:description", content: "Google Drive 포트폴리오 폴더 바로가기" },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  return (
    <div className="flex min-h-[65vh] items-center justify-center px-4">
      <h1 className="sr-only">내 포트폴리오</h1>
      <a
        href={DRIVE_FOLDER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <FolderOpen aria-hidden="true" className="size-5" />
        Google Drive 바로가기
        <ExternalLink aria-hidden="true" className="size-4" />
      </a>
    </div>
  );
}
