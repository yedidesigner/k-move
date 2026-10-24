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
        <h2 className="font-semibold">2. 아이디 회원가입 설정</h2>
        <p className="mt-1 text-sm text-muted-foreground">Authentication → Providers → Email에서 이메일 로그인을 켜고 Confirm email을 끕니다. 이 앱은 아이디를 내부 전용 이메일로 변환하므로 확인 메일을 사용하지 않습니다.</p>
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
