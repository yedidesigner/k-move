# 인터랙션 확장 검토 기록

검토일: 2026-11-01 (한국시간). 기존 PDF에서 새 인용 범위를 추정하지 않고, 아래의 공식·저자 자료를 별도로 열어 확인했다. 30개 정의와 사례·판단 문장은 K-Move용으로 새로 작성했다.

## 반영 범위

- 내비게이션·오버레이·선택 컨트롤 12개, 진행·콘텐츠 상태와 탐색 10개, 행동 개념 2개, 시스템·레이아웃 4개, 터치·모션 접근성 2개.
- 30개 모두 독립된 정적 화면·비교 도해를 포함한다. 버튼처럼 보이는 요소는 그림의 일부로 그렸으며 실제로 작동한다고 표시하지 않는다. 자동 애니메이션·외부 이미지·개인 데이터 입력은 없다.
- WAI/APG는 역할·상태·키보드 의미를 확인하는 자료로 사용했다. 특정 패턴을 쓰는 것만으로 WCAG 준수를 보장한다고 설명하지 않는다.
- WCAG AA 타깃 최소 24×24 CSS px와 간격·인라인 등의 예외를 함께 구분했다. 그림의 44px는 여유 있게 설계한 예시이며 모든 상황의 AA 의무값이 아니다.
- reduced motion은 비필수 이동을 줄이되 결과 피드백을 유지하는 것으로 설명했다. WCAG 2.3.3은 AAA로 구분했다.
- DTCG의 최신 draft URL이 preview를 가리켜, 확정된 2025.10 Community Group Report를 사용했다. W3C Recommendation으로 부르지 않는다.
- Dropdown은 외형을 묶는 넓은 표현으로 정의하고 select·명령 메뉴·combobox의 의미를 구분한다.
- Affordance는 사람과 대상 사이의 행동 가능성, Signifier는 이를 해석하게 하는 단서로 구분한다.

## 확인한 근거

- [W3C WAI APG · Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) — accordion. 공식 패턴의 역할·상태·키보드 동작을 확인했습니다. 예시는 K-Move가 새로 구성했습니다.
- [W3C WAI APG · Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) — tabs. 공식 패턴의 역할·상태·키보드 동작을 확인했습니다. 예시는 K-Move가 새로 구성했습니다.
- [W3C WAI APG · Breadcrumb Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/) — breadcrumbs. 공식 패턴의 역할·상태·키보드 동작을 확인했습니다. 예시는 K-Move가 새로 구성했습니다.
- [W3C WAI APG · Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — modal-dialog. 공식 패턴의 역할·상태·키보드 동작을 확인했습니다. 예시는 K-Move가 새로 구성했습니다.
- [W3C WAI APG · Tooltip Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) — tooltip. 공식 패턴의 역할·상태·키보드 동작을 확인했습니다. 예시는 K-Move가 새로 구성했습니다.
- [W3C WAI APG · Checkbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) — checkbox. 공식 패턴의 역할·상태·키보드 동작을 확인했습니다. 예시는 K-Move가 새로 구성했습니다.
- [W3C WAI APG · Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) — radio-button. 공식 패턴의 역할·상태·키보드 동작을 확인했습니다. 예시는 K-Move가 새로 구성했습니다.
- [W3C WAI APG · Switch Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) — toggle-switch. 공식 패턴의 역할·상태·키보드 동작을 확인했습니다. 예시는 K-Move가 새로 구성했습니다.
- [W3C WAI APG · Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) — combobox. 공식 패턴의 역할·상태·키보드 동작을 확인했습니다. 예시는 K-Move가 새로 구성했습니다.
- [W3C WAI APG · Menu Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) — dropdown. 공식 패턴의 역할·상태·키보드 동작을 확인했습니다. 예시는 K-Move가 새로 구성했습니다.
- [W3C WAI APG · Feed Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/feed/) — infinite-scroll. 공식 패턴의 역할·상태·키보드 동작을 확인했습니다. 예시는 K-Move가 새로 구성했습니다.
- [MDN · Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) — popover. HTML Popover API의 비모달 동작과 일반적인 오버레이 용어의 차이를 확인했습니다.
- [Carbon · Notifications](https://www.carbondesignsystem.com/building-blocks/core/patterns/notifications) — toast. 알림의 위치·긴급성·방해 정도를 구분하는 참고 자료입니다. Carbon의 규칙을 모든 제품의 규칙으로 적용하지 않습니다.
- [Carbon · Loading](https://www.carbondesignsystem.com/building-blocks/core/patterns/loading) — skeleton-screen. 스켈레톤·인라인 로딩·점진적 로딩을 구분했습니다.
- [Carbon · Empty states](https://www.carbondesignsystem.com/building-blocks/core/patterns/empty-states) — empty-state. 콘텐츠가 없는 이유와 다음 행동을 연결하는 패턴을 참고했습니다.
- [GOV.UK · Error message](https://design-system.service.gov.uk/components/error-message/) — error-state. 입력 검증 오류와 서비스 문제를 구분하고, 입력값을 보존하는 원칙을 참고했습니다.
- [GOV.UK · Select](https://design-system.service.gov.uk/components/select/) — dropdown. 값 선택을 위한 select와 펼쳐진 명령 메뉴를 구분하기 위한 자료입니다.
- [MDN · ARIA progressbar role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/progressbar_role) — progress-indicator. 진행률을 아는 경우와 알 수 없는 경우의 값 표현을 확인했습니다.
- [MDN · aria-busy](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy) — loading-state. 진행 중인 갱신과 완료 후 안내를 보조기술에 전달하는 근거입니다.
- [W3C WAI · Understanding Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) — focus-state. WCAG 2.2의 2.4.7(AA): 키보드 포커스의 위치를 알아볼 수 있어야 한다는 기준입니다.
- [MDN · disabled HTML attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/disabled) — disabled-state. 네이티브 disabled와 readonly의 포커스·입력·폼 제출 차이를 확인했습니다.
- [GOV.UK · Pagination](https://design-system.service.gov.uk/components/pagination/) — pagination. 여러 페이지 사이의 이동과 현재 위치 표현을 참고했습니다.
- [Jakob Nielsen · Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) — progressive-disclosure. 빈번한 핵심 작업과 요청할 때 보이는 추가 옵션의 구분을 참고했습니다. 모든 정보를 숨기라는 원칙이 아닙니다.
- [Don Norman · Affordances and Design](https://jnd.org/affordances-and-design/) — affordance. 행위자와 대상 사이의 행동 가능성, 지각된 가능성, 관습을 구분하는 저자 설명입니다.
- [Don Norman · Signifiers, not affordances](https://jnd.org/signifiers-not-affordances/) — signifier. 행동·상태를 해석하게 하는 지각 가능한 단서의 개념을 확인했습니다.
- [DTCG · Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/2025.10/format/) — design-token. 확정된 Community Group Report의 이름·값·타입·참조 개념입니다. W3C 권고 표준과는 구분합니다.
- [Figma Learn · Create and use variants](https://help.figma.com/hc/en-us/articles/360056440594-Create-and-use-variants) — component-variant. 컴포넌트 집합의 속성과 값, 유효한 조합을 관리하는 개념을 확인했습니다.
- [Figma Learn · Guide to auto layout in Figma](https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout-in-Figma) — auto-layout. 방향·간격·패딩·정렬에 따라 자식과 컨테이너가 조정되는 방식을 확인했습니다.
- [MDN · Responsive web design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design) — breakpoint. 레이아웃 전환 지점과 유연한 레이아웃을 구분했습니다. 예시 너비는 제품별 결정입니다.
- [W3C WAI · Understanding Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) — touch-target. WCAG 2.2 2.5.8(AA)의 24×24 CSS px 기준과 간격·인라인 등의 예외를 함께 확인했습니다.
- [W3C WAI · Understanding Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) — reduced-motion. WCAG 2.2 2.3.3(AAA)의 비필수 상호작용 애니메이션 중단 기준을 참고했습니다.

## 검증

- manifest의 30개 ID, 출처 참조, 필수 필드, figure 항목을 스크립트로 확인했다.
- 담당 TSX의 ESLint와 세 파일의 Prettier를 통과했다.
- 전체 컴파일·브라우저 검수·배포는 통합 담당자가 수행한다. 이 문서는 아직 그 결과를 주장하지 않는다.
