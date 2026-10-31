# 이전 실습 제작 검토 기록 (보관)

이 문서는 239개 전체에 활동을 연결했던 이전 버전의 기록입니다. 현재 공개 학습 방식은 `glossary-learning-content-review.md`와 `src/data/learning/entries.json`을 따릅니다. 현재 예시 195개·예시+실습 44개이며 아래의 전체 실습 수와 방식은 현재 화면을 설명하지 않습니다.

# 전체 용어 실습 검토 기록

기존 전용 UI 실습 3개와 신규 데이터 실습 236개를 합쳐 총 239개입니다. 화면 조작 55, 상황 선택 91, 분류 65, 순서 배열 28개이며 유형별 개수는 데이터에서 계산합니다. 모든 사례는 교육용 가상 상황입니다.

## A–G 실습 콘텐츠 검수

기존 입력 79개(Above the fold–Generalist)의 ID를 모두 보존했습니다. 신규 용어는 추가하지 않았습니다.

- 상황 선택 32개: 선택지 3개, 명시적인 학습 목표에 맞는 선택 1개, 모든 선택에 개별 피드백.
- 시각 조작 18개: 실제 렌더러의 컨트롤과 전후 상태를 대조했습니다.
- 분류 22개: 2~3개 범주, 3~4개 항목, 각 분류의 이유.
- 순서 구성 7개: 해당 가상 과업의 구체적 순서. 디자인 씽킹을 의무적 선형 단계로 가르치지 않습니다.
- 모든 항목에 개념 도식의 유형·레이블·설명, 시나리오, 조작 안내, 기억할 점이 있습니다.

## 개념 검토

- 대체 텍스트의 목적·맥락, 장식과 기능 이미지 구분은 W3C의 의사결정 자료로 확인했습니다: https://www.w3.org/WAI/tutorials/images/decision-tree/
- Design Sprint의 순서 실습은 GV의 5일 모델임을 명시하고 일반적인 디자인 프로젝트의 의무 순서라고 쓰지 않았습니다: https://www.gv.com/sprint/
- 도파민 실습은 생체 반응을 시뮬레이션하지 않습니다. 재방문 행동만으로 도파민의 변화나 학습 효과를 측정했다고 할 수 없다는 판단을 연습합니다. NIMH는 도파민을 보상 학습을 포함한 여러 구성과 연결합니다: https://www.nimh.nih.gov/research/research-funded-by-nimh/rdoc/units/molecules/149896
- Corporation 실습은 법적 형식과 규모를 구분하며, 특정 관할권의 법률 해석·설립 지침을 제공하지 않습니다.
- 경쟁사·리서치·편향 실습의 회사와 참여자는 가상 상황입니다. 실제 연구 성과나 인과관계를 주장하지 않습니다.

## 렌더러 정합성

실제 엔진의 장식 before/after는 없음→그림자이며 테두리·채우기는 별도 선택입니다. Borders와 Fill의 안내를 별도 선택 조작에 맞췄고, after 라벨이 테두리나 채우기가 자동 선택됐다고 주장하지 않도록 했습니다.

Navigation의 before/after는 선택 항목 변경이 아닌 현재 위치 표시 off/on, form은 제출 후 도움/입력 중 도움, focus는 기본/강한 포커스, alttext는 설명 없음/설명 제공으로 문구를 맞췄습니다.

모든 도식은 추상적 관계를 설명하는 코드 기반 자료이며 실제 제품 스크린샷으로 표시하지 않습니다. 개념 적용 결과는 현재 예제 안의 관찰이며 모든 사용자에게 보장된 효과가 아닙니다.


---

## K-Move glossary practices: group 2 audit

## Coverage

- Original input: `part-2-input.json` (Gestalt principles through Qualitative research).
- Output: `part-2-output.json`.
- All 79 input IDs preserved, once each, in the original order.
- 20 visual exercises, 21 sorting exercises, 28 contextual decisions, 10 contextual sequences.
- Every exercise includes an original Korean scenario, an actionable instruction, a concept relationship diagram specification (2–4 labels), and a misconception-focused takeaway.
- Every decision has exactly three choices and exactly one correct choice, with specific feedback for every choice.
- Every sort has 2–3 categories and 3–5 items with valid category indexes and item-specific explanations.
- Every sequence has 3–5 steps in the intended order, with explanations. Scenario wording makes these example-specific, rather than asserting a universal design process.
- Scenario, instruction, and takeaway strings are unique across all 79 entries.

## Renderer alignment

Reviewed actual `GlossaryPracticeLesson.tsx` controls and fixed sample content, not only the proposed renderer contract.

- Spacing (Gestalt principles, negative space, Proximity): shipping recipient/address groups; only between-group spacing changes from 4 to 40 px, while internal relationships remain fixed. Proximity is a manipulable spacing exercise.
- Forms (high-fidelity prototypes, interaction designers): fictional project name, two-character validation rule, sample creation result, comparison between post-submit guidance and during-input guidance. No signup, checkout, email, transmission, or persistence is claimed.
- Navigation (interactivity, navigation, prototype): three local menu items switch example content; comparison buttons turn current-position indicators off/on. Both comparison states support the local menu clicks.
- Hierarchy: exhibition example with title/date/body emphasis. Initial focus is explicitly visual attention, not keyboard focus.
- Motion: project-information panel opens/closes; compare immediate and animated transitions.
- Cards: same three content items in one-column list versus three-column card layout.
- Grid: 1–3 columns and an optional guide.
- Responsive: adjustable example viewport; no claim that viewport resizing alone constitutes a complete mobile-first design process.
- Fidelity: static representation changes; no claim that the static card itself implements a flow.
- Scale: relative visual size; no claim that larger elements always produce balance.

The shared visual simulator demonstrates the named property with an original fixed example. Decision, sort, and sequence exercises have term-specific authored data and concrete contexts; they are not definition-recall quizzes.

## Accuracy checks

Primary sources reviewed for technical distinctions:

- MDN, Progressive enhancement: https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement
- MDN, Graceful degradation: https://developer.mozilla.org/en-US/docs/Glossary/Graceful_degradation
- W3C, Landmarks: https://www.w3.org/WAI/WCAG21/Techniques/html/H101
- W3C APG, Landmark regions: https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/
- W3C heading tutorial source: https://w3c.github.io/wai-website/tutorials/page-structure/headings/

Nuances retained: progressive enhancement starts with usable core content and enhances with capabilities; graceful degradation preserves core use when richer capabilities fail; semantic headings are not established solely by font size; landmarks communicate page regions; low-fidelity prototypes can be paper-based; high visual detail does not guarantee real data processing; products can be services; research methods and job scopes depend on context.

The impostor-syndrome activity contrasts observed evidence and interpretations, and does not diagnose. The NDA activity asks for agreement scope and permission checking, and does not state jurisdiction-specific enforceability. Payment percentages are explicitly part of a fictional agreed project example.

## Validation run

`python practice-content/write-part-2.py` passes all coverage/shape/field validations. A separate check also verified unique scenario/instruction/takeaway text and complete item feedback/explanations.


---

## Q–Z 실습 78개 검토 메모

모든 문항과 사례는 학습을 위해 작성한 한국어 가상 상황입니다. 실제 서비스 화면이나 연구 문구를 복제하지 않았습니다.

## 확인한 1차 자료

- W3C, Understanding SC 1.4.3 Contrast (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html — 일반 텍스트 AA 대비 4.5:1과 전체 접근성 준수 판단의 구분.
- W3C, Understanding SC 2.5.3 Label in Name: https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html — 음성 제어에서 화면의 레이블과 접근 가능한 이름의 연결.
- W3C, Labeling Controls: https://www.w3.org/WAI/tutorials/forms/labels/ — 폼 레이블과 컨트롤의 연결.
- John Brooke, SUS: A quick and dirty usability scale (1996): https://hci-studies.org/methods-and-measures/downloads/SUS_Brooke1996.pdf — SUS는 0–100 범위의 사용성 설문 점수이며 작업 성공률 또는 백분위수가 아님.

## 구현 일치 검토

- 78개 원본 ID 및 순서 보존; decision 31, sort 22, sequence 11, visual 14.
- 모든 scenario 고유; decision은 선택지 3개 중 정답 1개; sort/sequence 필수 필드 및 범위 검증.
- 시각 실습의 전/후 레이블은 공용 렌더러 실제 상태와 일치시킴.
- screen-reader는 대체 텍스트 제공/편집 실습이며 실제 음성 출력으로 표현하지 않음.
- traversal-order는 Tab/Shift+Tab 탐색 실습. 전/후는 포커스 강조만 바꾸며 DOM 순서를 바꾸지 않음을 명시.
- single-column-layout은 실제 1열/3열 비교와 열 수 조절에 맞춤.
- 연구·조직·업무 개념은 구체적 상황에서 해석·분류·순서 선택으로 연습하도록 작성.
- 문항 데이터의 출처는 참고용이며 학습 화면에 외부 출처의 보증 또는 실제 사용자 연구 결과로 표시하지 않음.


## 통합 검토

- 236개 신규 ID가 기존 용어의 ID와 빠짐없이 일치합니다. 기존 3개 전용 데모는 유지했습니다.
- 선택지의 정답 위치를 고유 ID 기반으로 분산했습니다(첫째28 / 둘째35 / 셋째28).
- 탐색 예시의 비교 라벨은 현재 위치 표시 없음/있음으로 조작 버튼 이름과 구분했습니다.
- 236개 전체 렌더링과 16개 화면 조작 유형의 실제 DOM 변화, 분류·순서·선택 결과, 초기화·키보드·모달 검사를 자동화했습니다.
- 교차 검수에서 서체 분류의 세리프 특징, 사용자 집단의 주 사용 기기, 업로드 오류 원인을 명확히 하여 복수 해석이 생기지 않도록 3개 상황을 보정했습니다.
