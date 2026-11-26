import { ContentManager } from "./ContentManager";
import { PageTitle } from "@/components/lms";
export function SessionManager({ initialKey }: { initialKey?: string }) {
  return (
    <div>
      <header className="mb-7 border-b border-neutral-300 pb-5">
        <PageTitle title="CLASSES" description="회차별 교육 내용·산출물·핵심 용어·사용 도구·과제를 수정하고 공개합니다. 시간은 한국 시간을 기준으로 합니다." />
      </header>
      <ContentManager
        key={initialKey ?? "default"}
        initialKind="session"
        sessionOnly
        {...(initialKey ? { initialKey } : {})}
      />
    </div>
  );
}
