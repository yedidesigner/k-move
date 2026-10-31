# 용어별 학습 방식 검토

기존 239개 용어 ID와 A–Z 목록을 유지했습니다. 예시 중심 195개, 예시 + 실습 44개이며 별도 실습 목록을 만들지 않습니다. 영어→한국어 뒤집기 카드의 뒷면은 흰 배경과 검정 텍스트입니다.

## 분류 기준

- 결과물·문서·연구·조직·직무: 실제 형태를 이해하는 시각 예시를 사용합니다. 이름과 문장 분류·순서 외우기를 실습처럼 강제하지 않습니다.
- 속성을 조작하며 원인을 확인하는 개념: 같은 시각 예시 뒤에 간격·대비·크기·레이아웃·반응형·입력·탐색 등의 실제 조작을 제공합니다.
- 분류 자체가 방법인 Affinity diagram과 Information architecture만 분류 활동을 유지합니다. 연구 절차·직무 구분 문제는 예시로 전환했습니다.
- Screen reader와 WCAG는 정적인 관계도·점검 자료를 사용합니다. 대체 텍스트 편집이나 명도 조절만으로 해당 개념 전체를 실습했다고 표현하지 않습니다.

## 시각 자료

코드로 작성한 원본 HTML/SVG 자료입니다. 케이스 스터디는 표지·문제·관찰 근거·설계·검증과 한계가 있는 작은 포트폴리오, Persona는 프로필 문서, Journey map은 단계별 지도, Empathy map은 4영역 맵, Timeline은 일정, Matrix는 비교/기록표 등 개념에 적합한 형태를 사용합니다. 주제와 무관한 공통 장식 도형은 제거했습니다.

F/Z 훑기, 유사성, 커브컷, 통일·변화, 평등·형평은 각각 원리를 보여 주는 별도 SVG를 사용합니다. Layer-cake layout은 시선 패턴과 혼동하지 않고 가로 영역이 세로로 쌓인 화면을 보여 줍니다. 수치·페르소나·관찰·프로젝트는 가상임을 표시하고 검증하지 않은 성과를 만들지 않습니다.

## 확인한 실제 참고 자료

- Case study / Case studies: https://stevenwett.com/work/news-on-spotify — 공개된 수업 프로젝트. 실제 Spotify 출시 기능으로 표시하지 않습니다. 문제·역할·와이어프레임·사용자 테스트·개선·한계를 살펴보는 외부 링크입니다.
- Portfolio: https://stevenwett.com/ — 실제 프로젝트 목록과 상세 사례 구조.
- User journey: https://www.gov.uk/service-manual/user-research/creating-an-experience-map — 경험 지도 작성 안내와 단계·행동·감정 예시.
- WCAG: https://www.w3.org/WAI/standards-guidelines/wcag/ — 공식 범위·버전 안내.
- WebAIM: https://webaim.org/ — 기관의 실제 자료·도구 페이지.
- Alternative text: https://www.w3.org/WAI/tutorials/images/decision-tree/ — 이미지 목적/맥락에 따른 대체 텍스트.
- Design sprint: https://www.gv.com/sprint/ — GV의 5일 모델. 모든 스프린트의 의무 일정으로 일반화하지 않습니다.
- Dopamine: https://www.nimh.nih.gov/research/research-funded-by-nimh/rdoc/units/molecules/149896 — 보상 학습·주의·운동 등 연구 영역. 클릭으로 생체 반응을 추정하지 않습니다.

외부 링크와 원본 교육용 그림은 구분합니다. 외부 이미지의 사용권을 추정하여 LMS 안에 복제하지 않았습니다.

## 검사 범위

239개 ID 및 필드·mode/실습 연결, 236개 일반 학습 화면 렌더링, 예시 모드의 활동 미노출, Case Study 링크, 검색·필터·모달·키보드, 기존 3개 전용 데모를 검사합니다. 전체 학습 방식의 숫자는 데이터에서 계산됩니다. 기존 활동 데이터는 보관되지만 비공개 활동을 완료된 공개 실습으로 세지 않습니다.

최종 검증: 8개 테스트 파일의 79개 검사 통과, TypeScript 및 프로덕션 빌드 통과. 데스크톱 흰 뒷면과 Case Study, 390px 모바일 Case Study·Proximity 4px→40px 실제 조작을 확인했습니다. Figma 앞면·뒷면 각각 239개 mode 라벨 일치 및 흰 뒷면 색상 검증을 완료했습니다.
