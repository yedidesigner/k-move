import type { GlossaryEntry } from "@/data/glossary";
import type {
  DecisionPractice,
  SequencePractice,
  SortPractice,
  VisualPractice,
  VisualPreset,
} from "@/data/practice/types";

export const practiceEntry: GlossaryEntry = {
  id: "practice-fixture",
  english: "Practice fixture",
  pronunciation: "프랙티스 픽스처",
  korean: "실습 검증",
  description: "입력에 따른 화면과 학습 피드백의 변화를 확인한다.",
  example: "선택을 바꾸고 결과 설명을 비교한다.",
  letter: "P",
};

const base = {
  id: practiceEntry.id,
  scenario: "수강생이 과제 제출 화면을 사용하는 상황을 살펴보세요.",
  instruction: "요구에 맞는 행동을 선택하고 결과를 확인하세요.",
  structure: {
    type: "flow" as const,
    labels: ["상황", "행동", "결과"],
    caption: "행동에 따른 결과를 비교합니다.",
  },
  takeaway: "사용자 목표와 관찰 근거를 연결해 판단하세요.",
};

export const decisionFixture: DecisionPractice = {
  ...base,
  kind: "decision",
  options: [
    {
      label: "버튼 색만 바꾼다",
      correct: false,
      feedback: "색 변화만으로 제출 위치를 찾기 어려운 원인이 설명되지는 않습니다.",
    },
    {
      label: "사용 과정을 관찰한다",
      correct: true,
      feedback: "행동을 관찰하면 어디서 망설이는지 근거를 얻을 수 있습니다.",
    },
    {
      label: "사용자에게 익숙해지라고 안내한다",
      correct: false,
      feedback: "적응을 요구하기 전에 화면에서 생기는 장벽을 확인해야 합니다.",
    },
  ],
};

export const sortFixture: SortPractice = {
  ...base,
  kind: "sort",
  categories: ["관찰한 행동", "직접 들은 발언"],
  items: [
    {
      label: "제출 버튼을 세 번 눌렀다",
      category: 0,
      explanation: "반복 클릭은 관찰자가 본 행동입니다.",
    },
    { label: "제출됐는지 모르겠어요", category: 1, explanation: "참여자가 직접 말한 내용입니다." },
    {
      label: "완료 안내를 보고 화면을 닫았다",
      category: 0,
      explanation: "화면을 닫은 것은 관찰 가능한 행동입니다.",
    },
  ],
};

export const sequenceFixture: SequencePractice = {
  ...base,
  kind: "sequence",
  steps: [
    { label: "파일을 고른다", explanation: "제출할 자료를 먼저 선택합니다." },
    { label: "첨부 내용을 확인한다", explanation: "선택한 파일이 맞는지 확인합니다." },
    { label: "제출 완료를 확인한다", explanation: "제출 후 완료 상태를 확인합니다." },
  ],
};

export function visualFixture(preset: VisualPreset): VisualPractice {
  return {
    ...base,
    kind: "visual",
    preset,
    beforeLabel: "첫 번째 표현",
    afterLabel: "두 번째 표현",
    beforeNote: "현재 표현에서 요소들의 관계를 관찰하세요.",
    afterNote: "바뀐 표현에서 같은 내용을 다시 확인하세요.",
  };
}
