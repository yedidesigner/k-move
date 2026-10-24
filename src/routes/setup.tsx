import { createFileRoute } from "@tanstack/react-router";
import { SetupGuide } from "@/components/SetupGuide";

export const Route = createFileRoute("/setup")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "운영자 설정 안내 | K-Move LMS" },
      { name: "description", content: "LMS 운영자를 위한 연결 설정 안내" },
      { property: "og:title", content: "운영자 설정 안내" },
      { property: "og:description", content: "LMS 운영자를 위한 연결 설정 안내" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <SetupGuide />
    </div>
  ),
});
