# 디자인 기본 이론 확장 가이드 조사 기록

확인일: 2026-11-01 (Asia/Seoul). 기존 PDF 10개 기반 가이드는 보존하며, 이 파일은 추가 8개 가이드의 웹 근거와 편집 범위를 기록한다.

## 작성 범위

- 8개 가이드, 각 4개 본문 절, 학습 목표, 설계 판단 사례, 대안·검증, 적용 과제와 점검 기준.
- 준비생·경력·프로 구분 없음. 가상 상황은 실제 사용자 연구나 성과로 제시하지 않음.
- 원본 PDF 페이지·외부 이미지·로고를 복제하지 않음. `sourceRefs: []`, 직접 확인한 웹 문헌을 `references`에 표시.
- 공식·저자 제공 페이지를 직접 열고 본문을 확인함. 검색 결과 제목만으로 근거를 부여하지 않음.
- 인용문 없이 독자적인 한국어 해설과 가상 사례로 작성. 각 가이드의 개념·절차 요약은 3개 다른 페이지에 분산했으며 특정 페이지의 전체 내용이나 고유 사례를 재현하지 않음.
- Adobe의 일반 인쇄 해상도나 도련 예시를 모든 제작물의 의무 수치로 옮기지 않음.
- MIT 자료는 실제 브랜드 운영 방식의 참고 사례이며, 그 기관의 수치·자산 사용 규칙을 모든 브랜드에 적용하지 않음.
- 실험 가이드는 전문 통계 분석 절차를 대신하지 않으며 신뢰구간의 반복 표집 의미와 결과 해석 한계를 구분.

## 가이드별 확인한 근거

### 타이포그래피 간격: 글자에서 문단까지 (`typography-spacing`)

- [Adobe · Kerning and tracking in InDesign](https://helpx.adobe.com/indesign/desktop/format-and-style-text/tabs-indents-and-spacing/about-kerning-and-tracking.html) — Kerning, tracking, metrics/optical/manual 구분. 개념 근거 · 조정 범위를 확인했습니다. InDesign의 단위를 다른 도구의 숫자에 그대로 대응시키지 않습니다.
- [Adobe · Change letter and line spacing in text](https://www.adobe.com/learn/indesign/web/adjust-letter-spacing) — 문자 간격·행간·행 길이의 관계. 적용 참고 · 서체·목적·행 길이에 따라 조정하며 고정 공식을 두지 않는 관점입니다.
- [W3C · Understanding SC 1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) — Intent / Author Responsibility. 공식 접근성 근거 · 기본 디자인 수치와 사용자 스타일 변경을 견디는 요구를 구분했습니다.

### 화면의 색을 인쇄로 옮길 때 확인할 것 (`color-for-screen-print`)

- [Adobe · Color models and color spaces](https://helpx.adobe.com/creative-cloud/apps/colors/understand-color-modes.html) — Color models / Color spaces / Gamut. 개념 근거 · 모델·색공간·기기별 재현 범위를 구분했습니다.
- [Adobe · Change color profiles](https://helpx.adobe.com/photoshop/desktop/adjust-color/color-profiles/change-a-documents-color-profile.html) — Assign or remove / Convert colors. 개념 근거 · 할당과 변환이 색상 수치에 미치는 차이를 확인했습니다.
- [Adobe · Print with color management](https://helpx.adobe.com/photoshop/desktop/print/print-with-color-management.html) — 출력 조건·프린터 프로파일·교정 표시. 적용 참고 · 프로파일과 출력 조건에 따라 교정의 정확도가 달라집니다. 절대적 색 재현 보증으로 해석하지 않습니다.

### 인쇄 파일: 화면 완성에서 납품 검수까지 (`print-production-checklist`)

- [Adobe · Print bleed and slug areas](https://helpx.adobe.com/indesign/desktop/print/page-set-up-and-printer-marks/print-bleed-and-slug-areas.html) — 도련·재단 범위·인쇄 표시. 개념 근거 · 도련의 목적과 인쇄 업체별 요구 확인을 참고했습니다.
- [Adobe · Create and manage preflight profiles](https://helpx.adobe.com/indesign/desktop/print/preflight/create-and-manage-preflight-profiles.html) — Preflight profiles / production needs. 적용 참고 · 검수 규칙을 제작 조건에 맞추는 원칙입니다.
- [Adobe · Produce print-ready PDF files](https://helpx.adobe.com/indesign/desktop/print/print-production-and-file-creation/produce-print-ready-pdf-files.html) — 링크·폰트·도련·검수·PDF 내보내기. 제작 절차 참고 · 특정 해상도와 프리셋을 모든 인쇄물의 보편 정답으로 옮기지 않았습니다.

### 브랜드를 로고 한 개에서 사용 규칙으로 확장하기 (`identity-and-brand-systems`)

- [MIT Brand Guide · Brand Architecture](https://brand.mit.edu/brand-architecture) — Parent brand / Sub-branding / Endorsed branding. 실제 운영 사례 · MIT의 관계 구분을 분석 참고했습니다. 프로젝트의 정답이나 일반 의무로 사용하지 않습니다.
- [MIT Brand Guide · MIT Logo](https://brand.mit.edu/logos-marks/mit-logo) — Clear space / Micro logo / Placement. 실제 운영 사례 · 크기·배경·용도에 연결된 로고 사용 규칙의 예입니다. 로고 자산을 복제하지 않습니다.
- [MIT Brand Guide · Do/Don’t](https://brand.mit.edu/applying-brand/do-dont) — 원본 파일 사용·수정 금지·여백 사례. 문서 구성 참고 · 허용·금지 사례로 규칙을 전달하는 방식을 참고했습니다.

### UI 패턴 선택: 무엇을 한 번에 보여줄까? (`ui-pattern-selection`)

- [GOV.UK Design System · Accordion](https://design-system.service.gov.uk/components/accordion/) — When to use / When not to use / component comparison. 선택 기준 참고 · 필수 콘텐츠 숨김과 중첩 접힘의 비용을 검토했습니다.
- [GOV.UK Design System · Tabs](https://design-system.service.gov.uk/components/tabs/) — 한 번에 한 섹션 보기·비교 및 순차 읽기의 한계. 선택 기준 참고 · 해당 서비스 맥락의 권장 사항이며 모든 제품에 대한 효과 보증은 아닙니다.
- [W3C APG · Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — 모달의 배경 비활성화·포커스·키보드 동작. 구현 근거 · 정적 시안과 실제 동작 검증의 범위를 구분했습니다.

### 리서치 방법을 질문에서 선택하기 (`research-method-selection`)

- [GOV.UK Service Manual · Plan user research for your service](https://www.gov.uk/service-manual/user-research/plan-user-research-for-your-service) — Research questions / relevant activities / user groups. 계획 원칙 참고 · 질문과 필요한 근거에 맞춰 방법을 고르는 관점입니다.
- [GOV.UK Service Manual · Contextual research and observation](https://www.gov.uk/service-manual/user-research/contextual-research-and-observation) — 일상 환경 관찰·질문에 따른 개입. 방법 근거 · 실제 맥락과 관찰자의 개입 사이의 차이를 확인했습니다.
- [GOV.UK Service Manual · Using moderated usability testing](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing) — 과업 설계·관찰·참여자 모집. 방법 근거 · 목표를 주고 답이나 경로를 유도하지 않는 과업 설계를 참고했습니다.

### 제품 지표와 실험: 숫자를 설계 판단으로 읽기 (`product-evidence-experiments`)

- [GOV.UK Service Manual · How to set performance metrics for your service](https://www.gov.uk/service-manual/measuring-success/how-to-set-performance-metrics-for-your-service) — 목적·혜택·가설·측정·맥락. 측정 설계 참고 · 서비스 목표와 지표를 연결하고 리서치와 함께 해석하는 원칙입니다.
- [Kohavi 외 · Practical Guide to Controlled Experiments on the Web](https://exp-platform.com/practical-guide/) — 저자 제공 초록: 인과 추정·무작위 배정·표본 및 제약. 연구 근거 · 온라인 대조 실험의 역할과 조건을 참고했습니다. 이 가이드는 통계 분석 절차 전체를 대신하지 않습니다.
- [NIST/SEMATECH · Confidence Limits for the Mean](https://www.itl.nist.gov/div898/handbook/eda/section3/eda352.htm) — Purpose / 신뢰수준과 반복 표집의 해석. 통계 개념 근거 · 평균의 신뢰구간 설명에서 불확실성 해석을 참고했으며 다른 지표에 같은 공식을 무조건 적용하지 않습니다.

### UX 라이팅: 짧은 문구를 과업에 연결하기 (`content-and-microcopy`)

- [GOV.UK · Understand content design](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/understand-content-design/) — 사용자 필요·분량·형식·위치·유지 관리. 콘텐츠 설계 참고 · 영문 문체 규칙 자체를 한국어에 그대로 옮기지 않았습니다.
- [W3C WAI · Labeling Controls](https://www.w3.org/WAI/tutorials/forms/labels/) — 컨트롤의 목적·시각 및 프로그램상 레이블 연결. 접근성 근거 · 레이블과 입력 요소의 관계를 확인했습니다.
- [GOV.UK Design System · Error message](https://design-system.service.gov.uk/components/error-message/) — 오류 원인과 수정 방법의 안내. 작성 기준 참고 · 본문의 한국어 예시는 원문을 복제하지 않은 가상 서비스 문구입니다.

## 범위와 한계

- 문헌의 현재 페이지에 제시된 원칙을 참고했으며 외부 사이트의 인터랙션 전체·실제 출력 장비·실험 플랫폼을 직접 테스트한 것은 아니다.
- 저자 사이트의 Practical Guide는 공개 초록을 확인했다. 이를 근거로 무작위 대조 실험의 역할·샘플 및 기술적 조건을 설명하며, 논문 전체를 검토했다고 주장하지 않는다.
- `https://www.color.org/iccprofile.xalter`는 404로 확인되어 채택하지 않았다. 컬러 프로파일 설명에는 확인 가능한 Adobe 공식 문서를 사용했다.
- Adobe 이전 proofing-colors URL이 Print with color management 문서로 이동하여 최종 공식 URL을 기록했다.
- 데이터 자체 검사: 8개 ID 고유, 4개 본문 절, 각 합계 500자 이상, 연결 용어 ID·시각 예시 ID 유효, 가이드별 3개 URL과 적용 범위 기재. UI·배포 검증은 담당 에이전트에서 별도로 수행한다.
