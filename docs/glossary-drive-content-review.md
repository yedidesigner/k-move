# Drive 자료 기반 용어·교육 콘텐츠 개정 검토

검토일: 2026-10-31 (한국 시간)

## 실제 수정 범위

기존 239개 용어를 검토했습니다. 작업 시작 커밋 `ae4d6ea740513ba2cd84661c3e815c9fc7d68f4a`의 `src/data/glossary.json`과 개정 데이터를 ID 기준으로 대조한 결과입니다.

| 항목 | 결과 |
|---|---:|
| 용어 개수 | 239개 유지 |
| ID·영어 표제어·한국어 발음 변경 | 0개 |
| 한국어 표제어 수정 | 75개 |
| 정의 수정 | 83개 |
| 짧은 활용 예시 수정 | 14개 |
| `aliases` 필드 추가 | 239개 항목 / 검색 별칭 570개 |
| 학습 방식 | 예시 195개 / 예시 + 실습 44개 유지 |

239개를 모두 다시 썼다는 뜻은 아닙니다. 이미 자연스럽고 정확한 항목은 유지했습니다. 표기를 바꾼 항목의 이전 한국어 번역을 `aliases`에 남겨 기존 검색 경로를 보존했으며, 띄어쓰기 변형과 통용 표현도 추가했습니다.

대표적으로 사례 연구 → 케이스 스터디, 공감 지도 → 엠퍼시 맵, 재현 충실도 → 피델리티, 사용자 여정 → 유저 저니로 정리했습니다. CTA·IA·WCAG처럼 원어/약어가 자연스러운 경우는 이를 살리고, 접근성·근접성·서체·시각적 위계처럼 정확한 한국어는 유지했습니다. 정의와 학습 설명에서 개념을 풀어 주므로 한국어 표제어에 긴 직역을 반복하지 않습니다.

`Initial focus`는 이 용어집의 시각적 주목 맥락과 접근성 구현의 초기 키보드 포커스를 구분했습니다. 피델리티를 작동 여부나 개발 완료 상태와 혼동하지 않고, 프로덕트 목표는 기능 목록보다 사용자에게 제공할 가치를 설명하도록 보완했습니다. 기존 예시·실습 문구와 한국어 조사도 함께 대조했습니다.

## 교육 자료실

비어 있던 `/materials`에 다음 7개 가이드를 추가했습니다. 각 가이드는 학습 목표, 원본 시각 도식, 4개 설명 섹션, 선택 적용 질문, 관련 용어, 확인한 서지·장/항목을 제공합니다.

| 가이드 | 기존 시각 예시 연결 |
|---|---|
| UX와 UI, 하나의 화면을 함께 읽기 | User experience |
| 관찰에서 디자인 근거 만들기 | Persona |
| 레이아웃과 타이포그래피로 읽는 순서 만들기 | Hierarchy |
| 사용자가 끝까지 작성할 수 있는 폼 | Feedback loops |
| 컴포넌트를 넘어 함께 사용하는 디자인 시스템 | Design system |
| 케이스 스터디로 디자인 판단 보여 주기 | Case study |
| AI 초안을 검토 가능한 결과로 바꾸기 | Iteration |

시각 자료는 기존 K-Move 원본 HTML/SVG 도식을 재사용합니다. 정적 예시를 새 인터랙션으로 표시하지 않습니다. 선택 활동은 자신의 화면이나 프로젝트에 적용해 보는 질문이며 자동 제출·채점 기능이 아닙니다. 관련 용어는 최종 239개 데이터와 ID·영어·한국어 표기를 맞췄고, `/glossary?term=영어표제어`로 연결합니다. 회차별 일정이나 커리큘럼 배정은 바꾸지 않았습니다.

## 제공된 11개 자료의 실제 확인 범위

제공된 Drive 폴더의 Google Docs 1개와 PDF 10개를 식별했습니다. 아래 표는 제목을 확인한 것과 실제 활용한 본문 범위를 구분한 기록입니다. 전권 정독·모든 코드 예제 검증을 의미하지 않습니다. 내부 `source-N` 번호는 읽기 자료를 구분하기 위한 검토 식별자이며 LMS의 학생용 표제가 아닙니다.

| 검토 ID | 제공 자료 | 확인·활용한 범위 |
|---|---|---|
| source-0 | UX·UI 용어집 · Google UX Design Certificate 비공식 한국어 참고 번역 | A–Z 용어를 기존 239개와 대조. UX/UCD, 리서치, 프로토타입, 포트폴리오 관련 항목을 가이드에 참고. 번역을 그대로 정답으로 채택하지 않음. |
| source-1 | Adam Silver, Form Design Patterns (2018) | 목차·도입과 Chapter 1 A Registration Form의 Labels, Placeholders, The Question Protocol, Button Styles, Validation, Forgiving Trivial Mistakes를 중심으로 검토. 폼의 목적·라벨·안내·오류 복구에 활용. 나머지 전 장을 검토한 것은 아님. |
| source-2 | Above the Fold, 50 UX Best Practices (2012) | Connect the goals, Share knowledge early, Build personas, Listen to actions, Tell a story 등 확인된 본문을 참고. 현재 제품 추천으로 쓸 수 없는 오래된 도구·구현 제안 제외. |
| source-3 | Jon Yablonski, Laws of UX · 제공된 Early Release 판본 | 판본·목차와 Mental Models, Cognitive Load, Miller’s Law의 Chunking, Aesthetic-Usability Effect 관련 부분을 참고. 최신 완전판 검토로 표시하지 않음. |
| source-4 | Susan M. Weinschenk, 100 MORE Things Every Designer Needs to Know About People | 목차·색인과 추출된 일부 본문만 확인. 이번 7개 가이드의 직접 출처로 채택하지 않았음. 제목 수준의 심리 주장을 보편적 규칙으로 옮기지 않음. |
| source-5 | Alla Kholmatova, Design Systems (2017) | Terminology, Chapter 1 Design Systems의 기능·시각 패턴과 공통 언어, Chapter 6 조직 모델, Chapter 10 Pattern Documentation 및 People and Responsibilities를 중심으로 활용. 모든 구현 예제를 검증한 것은 아님. |
| source-6 | Harrell Howard, The Vibe Coding Playbook | 목차와 Set Up Version Control, Using AI as a First Drafter, Review Critically, Refine Iteratively, Security Concerns, Testing and Validating Code 관련 부분. 요청·검토·수정·버전 관리의 관점만 활용. |
| source-7 | The Vibecoding Revolution: Your Path to Micro SaaS Success | 도입, 사업 관련 주장, Getting Started with Replit의 Your First Conversation with Replit Agent 부분을 확인. 구체적 요청과 결과 검토·수정 흐름만 활용. 저자를 임의로 단정하지 않음. |
| source-8 | Introduction of UI & UX | UX·UI 차이, 핵심 용어, 사용자 목표와 테스트 개요 본문을 참고. UI와 UX를 단순히 외형/기능으로 분리하지 않음. |
| source-9 | Elisa Paduraru / Creative Tim, Fundamentals of Creating a Great UI/UX (2022) | 원본 272페이지 PDF에서 텍스트를 추출해 Grid and Layout, Typography, Colors 등 필요한 본문을 확인. 모든 페이지를 시각 검수했다는 의미는 아님. |
| source-10 | 웹디자인 관련 용어 (제공 자료, 2026) | CSS 레이아웃·박스 모델, 타이포그래피·색상, Button/Form/Modal, Design System, 와이어프레임·프로토타입·사용성 등 관련 항목을 대조. 실무 명칭 참고 자료로 활용. |

## 개념 검토에서 유지한 구분

- CTA는 특정 행동을 제안하는 역할입니다. 모든 버튼의 동의어로 쓰지 않습니다.
- 캐러셀의 자동재생·화살표·페이지 표시를 모든 캐러셀의 필수 요건으로 만들지 않습니다.
- 와이어프레임 → 목업 → 프로토타입을 로파이 → 중간 → 하이파이의 의무 순서로 가르치지 않습니다.
- 디자인 시스템은 UI 키트나 패턴 라이브러리만이 아니라 원칙·사용 기준·공통 언어·팀의 유지 방식도 포함합니다.
- 페르소나의 실제 조사 근거와 가정, 케이스 스터디의 측정 결과와 미검증 계획을 구분합니다.
- 8px 간격, 특정 컬럼 수·타입 스케일·서체, 고정 기기별 브레이크포인트, 44×44px 등 문헌의 수치 제안을 모든 맥락의 의무 규칙으로 옮기지 않습니다.
- “5명으로 문제의 85% 발견” 같은 수치나 시각적 인상을 전체 사용성의 증거로 일반화하지 않습니다.
- 모달의 포커스 유지와 Escape 닫기를 같은 동작으로 설명하지 않습니다. 플레이스홀더를 유일한 라벨로 권하지 않습니다.
- AI 도구의 현재 요금·기능, 수익·취업·시간 절약·성과 보장을 책의 설명만으로 주장하지 않습니다. 생성된 화면과 실제 데이터 처리 기능을 구분합니다.

## 공개 범위와 동기화

LMS에는 새로 작성한 한국어 설명·적용 질문, 기존 원본 도식과 서지 정보만 제공합니다. 책 원문·PDF·스캔 페이지·비공개 Drive 다운로드 링크를 공개하거나 Drive 공유 권한을 변경하지 않았습니다. 출처의 문장·사례를 대량 복제하지 않았으며, 교육용 가상 화면을 실제 사용자 조사 결과로 표시하지 않습니다.

Figma는 별도의 디자인 자료입니다. 이번 용어·가이드 개정이 Figma에 자동으로 동기화되었다고 주장하지 않습니다. 추후 Figma를 갱신할 때는 최종 JSON과 표기·ID·정렬을 다시 대조해야 합니다.

## 완료한 검증

- 테스트 88/88 통과: 기존 239개 학습 연결과 실습, 원어·기존 번역 aliases 검색, 자료실 7개 가이드 내용·출처·관련 용어, 실제 도식 렌더링, 검색/빈 결과/초기화, 대화상자 닫기·Escape·포커스 복귀.
- TypeScript 검사와 프로덕션 빌드 통과.
- 데스크톱 브라우저: 7개 가이드 카드, Case Study 가이드와 원본 시각 도식, 관련 용어 클릭 후 실제 `/glossary?term=Case+study` 검색 결과 확인.
- 390px 모바일 브라우저: 폼 가이드 표시 확인. 대화상자 `clientWidth`와 `scrollWidth` 모두 375px로 가로 넘침 없음.

이 문서 작성 시점에는 운영 배포 후 확인을 아직 수행하지 않았으므로, 위 결과는 코드·빌드·미리보기 검증 기록입니다.
