import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/lms";

export const Route = createFileRoute("/_app/tools")({
  head: () => ({
    meta: [
      { title: "실습 도구 | K-Move LMS" },
      { name: "description", content: "Gemini와 Google AI Studio 바로가기" },
      { property: "og:title", content: "실습 도구" },
      { property: "og:description", content: "Gemini와 Google AI Studio 바로가기" },
    ],
  }),
  component: Tools,
});

const TOOLS = [
  { name: "Gemini", url: "https://gemini.google.com/", desc: "프로젝트 설명과 소개문 초안 작성" },
  { name: "Google AI Studio", url: "https://aistudio.google.com/", desc: "프롬프트 실험과 웹 포트폴리오 제작" },
];

function Tools() {
  return (
    <>
      <PageHeader title="실습 도구" description="새 탭에서 열립니다." />
      <div className="grid gap-4 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <a key={t.name} href={t.url} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between rounded-xl border border-border bg-card p-5 shadow-soft hover:border-primary">
            <span>
              <span className="block text-lg font-bold">{t.name}</span>
              <span className="text-sm text-muted-foreground">{t.desc}</span>
            </span>
            <ExternalLink className="h-5 w-5 text-primary" aria-label="새 탭에서 열기" />
          </a>
        ))}
      </div>
    </>
  );
}
