# K-Move 이미지 기반 피드백 기능 설정

## 현재 구현
- LMS /feedback: 수강생별 1~24주차 피드백 아카이브
- 학생·강사: JPG, PNG, WebP 스크린샷 업로드 (이미지당 최대 10MB)
- 강사: 이미지 위 원하는 위치 클릭 → 번호 핀 생성 → 피드백 저장/수정/삭제
- 강사: 이미지 삭제 및 학생 로그인 계정 연결
- 학생: 계정 연결 후 자신의 기록만 업로드·열람
- 스크린샷은 비공개 Supabase Storage 버킷에 저장하고 1시간 유효한 signed URL로 표시

## 최초 설정

1. Vercel k-move 프로젝트의 VITE_SUPABASE_URL이 가리키는 **K-Move Supabase 프로젝트**를 엽니다.
   프로젝트 ref는 wymhiilvllyfcmzfqlwr입니다. 기존 교육용 Supabase 프로젝트(class-a-lms)와 혼동하지 마세요.
2. Supabase SQL Editor에서 docs/kmove-feedback-setup.sql 파일 전체를 실행합니다. 기존 kmove_profiles 테이블이 먼저 있어야 합니다.
3. 다음 두 SQL을 실행해 결과가 나오는지 확인합니다.

    select name, user_id from public.kmove_feedback_students order by name;
    select id, public from storage.buckets where id = 'kmove-feedback-screenshots';

4. 강사 계정으로 LMS에 로그인한 뒤 피드백 메뉴에서 학생을 선택합니다.
5. 수강생 계정 연결 드롭다운에서 실제 LMS 회원가입 계정을 선택합니다. 계정이 없다면 학생이 회원가입한 후 연결해야 합니다.
6. 강사나 계정이 연결된 학생이 스크린샷을 업로드합니다.
7. 강사는 이미지를 클릭해 위치 핀을 찍고 텍스트를 작성·저장합니다.
8. 학생 계정으로 로그인해 본인만 자신의 피드백을 볼 수 있는지 확인합니다.

## 개인정보 및 보안
- 강사는 학생별 이미지와 피드백을 관리하고 로그인 계정을 매핑할 수 있습니다.
- 학생은 명시적으로 매핑된 경우에만 본인의 이미지를 업로드하고 피드백을 읽을 수 있으며 피드백은 편집할 수 없습니다.
- Postgres RLS와 비공개 Storage RLS로 데이터 접근을 검증합니다.
- 기존 앱의 4자리 PIN 로그인은 민감한 기록을 다루기에는 취약하므로 운영 전에 추가 인증 또는 더 강한 로그인 체계를 고려하세요.
- 브라우저에는 Supabase publishable key만 사용하며 비밀 서비스 키를 넣지 마세요.

## 오류별 점검
- relation kmove_feedback_students does not exist: K-Move의 정확한 Supabase DB에 SQL을 적용했는지 확인
- row-level security policy 위반: 강사 역할 또는 학생 계정 연결 확인
- Storage upload 실패: private 버킷과 storage.objects RLS 확인
- signed URL 오류: 사용자의 로그인 상태와 파일 경로 확인

이 저장소에 SQL 파일을 추가했다고 해서 데이터베이스에 자동 적용되지는 않습니다.
