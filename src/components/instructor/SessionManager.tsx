import { ContentManager } from "./ContentManager";
export function SessionManager({ initialKey }: { initialKey?: string }) {
  return (
    <div>
      <header className="mb-7 border-b border-neutral-300 pb-5">
        <p className="text-xs font-semibold tracking-[0.12em] text-neutral-500">수업 관리</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">CLASSES</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-neutral-600">회차별 교육 내용·산출물·핵심 용어·사용 도구·과제를 수정하고 공개합니다. 시간은 한국 시간을 기준으로 합니다.</p>
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
