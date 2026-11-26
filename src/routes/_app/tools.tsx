import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageTitle } from "@/components/lms";

export const Route = createFileRoute("/_app/tools")({
  head: () => ({
    meta: [
      { title: "TOOLS | K-Move LMS" },
      { name: "description", content: "Gemini, Google AI Studio, AI ATLAS 등 수업·실습용 AI 도구 모음" },
      { property: "og:title", content: "TOOLS" },
      { property: "og:description", content: "Gemini, Google AI Studio, AI ATLAS 등 수업·실습용 AI 도구 모음" },
    ],
  }),
  component: Tools,
});

const TOOLS = [
  { name: "Gemini", url: "https://gemini.google.com/", desc: "프로젝트 설명과 소개문 초안 작성" },
  {
    name: "Google AI Studio",
    url: "https://aistudio.google.com/",
    desc: "프롬프트 실험과 웹 포트폴리오 제작",
  },
  {
    name: "AI ATLAS",
    url: "https://ai-atlas-yedi3.vercel.app",
    desc: "AI 플랫폼별 특징·요금·용도를 비교하고 필요한 도구를 탐색",
  },
];

function Tools() {
  return (
    <>
      <header className="mb-7 border-b border-border pb-5">
        <PageTitle title="TOOLS" description="수업과 실습에 사용하는 AI·디자인 도구를 빠르게 열고 활용합니다." />
      </header>
      <div className="divide-y divide-border border-y border-border bg-card">
        {TOOLS.map((t) => (
          <a
            key={t.name}
            href={t.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-28 items-center justify-between gap-5 px-5 py-6 transition-colors hover:bg-muted sm:px-7"
          >
            <span>
              <span className="block text-lg font-semibold">{t.name}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{t.desc}</span>
            </span>
            <ExternalLink
              className="h-5 w-5 shrink-0 text-foreground"
              aria-label="새 탭에서 열기"
            />
          </a>
        ))}
      </div>
    </>
  );
}
