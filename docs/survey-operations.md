# K-Move OT 설문 운영

## 화면

- 수강생: 전체 수업 → 1주차 (S01) → 설문조사 (`/survey`).
- 강사: 회원가입 또는 로그인 → 강사 대시보드 (`/admin`). DB의 `kmove_profiles.role = instructor`를 확인한 후 이동한다.
- 회원가입 화면에서 이미 만들어진 계정과 정확한 비밀번호를 입력하면 로그인한다. 클라이언트 이름 비교로 권한을 부여하지 않는다.
- 설문은 필수 항목 검증 → 응답 확인 → 최종 제출 → DB 저장 성공 확인 순서다.
- 계정당 하나의 응답만 저장되며, 수정 제출은 기존 응답을 갱신한다. 최초 제출 시각은 유지한다.
- 작성 중인 응답은 계정별 sessionStorage에 임시 보관된다. 이는 강사에게 전달되지 않는다. 제출 완료 응답은 Supabase에만 저장한다.
- 관리자 검색/상태 필터에 해당하는 제출 응답을 UTF-8 BOM CSV로 내려받는다. 강사 계정의 테스트 응답은 수강생 통계에 포함하지 않는다.

## 운영 DB 적용 순서

현재 운영 URL의 프로젝트 참조는 `wymhiilvllyfcmzfqlwr`다. 다른 LMS 프로젝트에 적용하지 않는다.

1. 운영 DB에서 기존 `kmove_profiles`, `private.is_kmove_instructor()` 및 RLS를 확인한다. 기존 설정은 `docs/supabase-setup.sql`에 기록되어 있다.
2. `supabase/migrations/*_kmove_ot_survey.sql`을 적용한다. 이 파일은 기존 사용자/포트폴리오 데이터를 삭제하거나 변경하지 않는다.
3. 권한 있는 운영자가 Auth에서 생성된 강사 계정을 확인하고 해당 사용자 UUID 한 건에만 `kmove_profiles.role = 'instructor'`를 지정한다. 비밀번호나 서비스 키를 Git에 넣지 않는다. 사용자 metadata는 권한 판단에 쓰지 않는다.
4. 새 수강생 계정으로 제출한 후 강사 로그인에서 응답을 조회한다. 다른 수강생의 조회·수정 및 익명 접근이 차단되는지 검증한다.
5. 운영 DB 검증 이후 코드 변경을 main에 병합하고 Vercel 운영 배포 상태를 확인한다.

## 검증

- `npm test`: 필수/선택 규칙, 실패 후 재제출, CSV, 강사 통계, Auth 권한 전환.
- `npx tsc --noEmit` 및 `npm run build`.
- `scripts/test-survey-db.mjs`: 별도 PGlite 설치 경로를 `PGLITE_MODULE_PATH`로 전달하면 격리된 Postgres에서 마이그레이션과 RLS를 검증한다. 운영 DB를 수정하지 않는다.

일반 회원에게는 `kmove_profiles` 역할 변경 권한, 다른 사람의 응답 수정 권한, 응답 삭제 권한을 주지 않는다. 관리자 조회는 DB RLS로 제한된다.
