import { ContentManager } from "./ContentManager";
export function SessionManager({ initialKey }: { initialKey?: string }) {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">수업 관리</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600">
          회차별 교육 내용·산출물·핵심 용어·사용 도구·과제를 직접 수정하고 공개하세요. 시간은 한국
          시간을 기준으로 합니다.
        </p>
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
