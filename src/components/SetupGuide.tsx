import { missingConfigKeys, REQUIRED_KEYS, supabaseConfig } from "@/lib/supabase";
import { Panel, StatusBadge } from "./lms";

export function SetupGuide() {
  const missing = missingConfigKeys();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Supabase 연결 설정</h1>
      <Panel>
        <h2 className="font-semibold">1. 브라우저 환경변수</h2>
        <p className="mt-1 text-sm text-muted-foreground">Supabase Project Settings → API에서 Project URL과 Publishable key를 등록합니다. 서비스 역할 키는 절대 브라우저에 넣지 마세요.</p>
        <ul className="mt-3 space-y-2">
          {REQUIRED_KEYS.map((key) => (
            <li key={key} className="flex items-center justify-between gap-2 text-sm">
              <code className="rounded bg-muted px-2 py-0.5">{key}</code>
              {(key === "VITE_SUPABASE_URL" ? supabaseConfig.url : supabaseConfig.publishableKey)
                ? <StatusBadge tone="success">설정됨</StatusBadge>
                : <StatusBadge tone="danger">없음</StatusBadge>}
            </li>
          ))}
        </ul>
        {missing.length > 0 && <p className="mt-3 text-sm">누락: {missing.join(", ")}</p>}
      </Panel>
      <Panel>
        <h2 className="font-semibold">2. 수강생 계정 등록</h2>
        <p className="mt-1 text-sm text-muted-foreground">수강생 계정은 운영자가 미리 등록합니다. 이 앱은 로그인 이름을 내부 전용 이메일로 변환하며, 공개 회원가입 화면을 제공하지 않습니다. 등록 시 이메일 인증을 완료한 계정으로 만들고, 로그인 후 본인이 비밀번호를 변경할 수 있도록 안내합니다.</p>
      </Panel>
      <Panel>
        <h2 className="font-semibold">3. 강사 계정 지정</h2>
        <p className="mt-1 text-sm text-muted-foreground">Table Editor → kmove_profiles에서 해당 사용자의 role을 student에서 instructor로 변경합니다.</p>
      </Panel>
      <Panel>
        <h2 className="font-semibold">4. 데이터 보호</h2>
        <p className="mt-1 text-sm text-muted-foreground">kmove_profiles와 kmove_portfolios에는 RLS가 적용되어 있으며, 일반 사용자는 자신의 데이터만 조회하고 수정할 수 있습니다.</p>
      </Panel>
    </div>
  );
}
