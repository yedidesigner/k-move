export type VisualLessonId = "cta" | "hamburger" | "carousel";

export const VISUAL_LESSONS = {
  cta: {
    english: "CTA",
    pronunciation: "씨 티 에이",
    meaning: "CTA",
    definition:
      "사용자에게 다음 행동을 제안하는 요소입니다. 버튼이나 텍스트 링크 등으로 표현할 수 있습니다.",
  },
  hamburger: {
    english: "Hamburger menus",
    pronunciation: "햄버거 메뉴즈",
    meaning: "햄버거 메뉴",
    definition:
      "세 줄 아이콘을 눌러 숨겨진 내비게이션을 여는 패턴입니다. 아이콘은 트리거이고, 펼쳐진 링크 목록이나 패널이 메뉴입니다.",
  },
  carousel: {
    english: "Carousels",
    pronunciation: "캐러셀즈",
    meaning: "캐러셀",
    definition: "한 영역에서 여러 콘텐츠를 순서대로 살펴보는 구성입니다.",
  },
} satisfies Record<
  VisualLessonId,
  { english: string; pronunciation: string; meaning: string; definition: string }
>;
