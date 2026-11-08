# K-MOVE 선정 이유 편지 서체 목록

- 확인일: 2026-11-08
- 화면: `src/components/WinnerReasonLetters.tsx`
- 원칙: 편지마다 랜덤 서체 배정, 한 번 연 편지는 동일한 서체 유지, 기존 Gaegu 사용 중단
- 제공: 눈누에 게시된 외부 웹폰트 URL을 CSS에서 불러오며, 서체 파일은 프로젝트 Git 저장소에 업로드하지 않음

## 웹폰트 적용 (8종)

1. [송암 이형식체](https://noonnu.cc/font_page/1808) — 이경환 (OFL)
2. [그리운X국한박 송글손글 감성 흘림체](https://noonnu.cc/font_page/1884) — 그리운X국립한글박물관
3. [학교안심 분필](https://noonnu.cc/font_page/1205) — KERIS (OFL)
4. [교보손글씨 2020 박도연](https://noonnu.cc/font_page/782) — 교보문고
5. [그리운X국한박 신고양이](https://noonnu.cc/font_page/1888) — 그리운X국립한글박물관
6. [카페24 빛나는별](https://noonnu.cc/font_page/343) — Cafe24
7. [이서윤체](https://noonnu.cc/font_page/872) — 흥국생명
8. [심경하체](https://noonnu.cc/font_page/873) — 흥국생명

## 확인/허가 전까지 제외 (2종)

9. [다이어리체](https://noonnu.cc/font_page/918) — 얼리폰트. 웹폰트/웹 임베딩 등은 별도 문의가 필요하다고 명시됨. 저작권자에게 허가받은 다음 적용.
10. [휴먼범석체](https://noonnu.cc/font_page/1039) — 이범석. 임베딩 조건부 허용, 폰트 파일 무단 복제·재배포 금지. 별도 사용 허가 확인 및 적법한 웹폰트 제공 경로가 확인될 때 적용.

사용권이 확인되기 전에는 8종만 랜덤 적용. 두 서체가 승인되면 `src/lib/winner-letter-fonts.ts` 목록과 `src/components/winner-reason-letters.css`의 `@font-face`에 추가하면 됨.
