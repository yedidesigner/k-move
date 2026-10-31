import { ContentManager } from "./ContentManager";
export function SessionManager() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">수업 관리</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600">
          회차별 일정과 수업 안내를 준비하고, 학습자료를 연결해 공개하세요. 시간은 한국 시간을
          기준으로 합니다.
        </p>
      </header>
      <ContentManager initialKind="session" sessionOnly />
    </div>
  );
}
