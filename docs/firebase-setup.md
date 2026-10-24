# Firebase 연결 안내

## 1. 웹 앱 설정값 (공개 값)
Firebase Console → 프로젝트 설정 → 일반 → 내 앱 → 웹 앱 추가 → SDK 설정 값을 아래 이름으로 등록합니다.

| 변수 | Firebase 값 |
|---|---|
| VITE_FIREBASE_API_KEY | apiKey |
| VITE_FIREBASE_AUTH_DOMAIN | authDomain |
| VITE_FIREBASE_PROJECT_ID | projectId |
| VITE_FIREBASE_APP_ID | appId |
| VITE_FIREBASE_STORAGE_BUCKET (선택) | storageBucket |
| VITE_FIREBASE_MESSAGING_SENDER_ID (선택) | messagingSenderId |
| VITE_FIREBASE_MEASUREMENT_ID (선택) | measurementId (Google Analytics) |

서비스 계정 비밀키, 관리자 토큰, Google OAuth 토큰은 브라우저나 소스에 절대 넣지 않습니다(추후 Cloud Functions 비밀로만 사용).

## 2. Google 로그인
Authentication → 로그인 방법 → Google 사용 설정.
Authentication → 설정 → 승인된 도메인에 추가:
- id-preview--1514fd04-24d9-430c-bc9c-1340594be29a.lovable.app (미리보기)
- 배포 후 *.lovable.app 주소, 사용자 지정 도메인

## 3. Firestore
Firestore Database 생성 → 규칙 탭에 `firestore.rules` 붙여넣고 게시.

## 4. 강사 지정
강사 계정으로 로그인 → Authentication → 사용자에서 UID 복사 → Firestore에 `roles/<UID>` 문서 생성, `role: "instructor"`.

## 5. 수강 승인
학생이 로그인하면 `enrollments/kmove-us-design-2026_<UID>` 가 `pending` 으로 생성됩니다. 관리자 화면에서 승인/거절합니다.
