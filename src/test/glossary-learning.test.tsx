import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GlossaryLearningLesson } from "@/components/glossary/GlossaryLearningLesson";
import { GLOSSARY, LEARNING_FILTERS, INTERACTIVE_GLOSSARY_COUNT } from "@/data/glossary";
import { LEARNING_ENTRIES, getGlossaryLearning, getLearningMode } from "@/data/glossary-learning";
import { getGlossaryPractice, hasGlossaryPractice } from "@/data/glossary-practice";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const figureKinds = new Set([
  "preset",
  "case-study",
  "portfolio",
  "screen",
  "comparison",
  "board",
  "persona",
  "empathy-map",
  "journey-map",
  "flow",
  "sitemap",
  "storyboard",
  "document",
  "matrix",
  "timeline",
  "chart",
  "typography",
  "palette",
  "code",
  "anatomy",
  "role",
  "concept",
]);

function expectAuthored(value: string, field: string) {
  expect(typeof value, field).toBe("string");
  expect(value.trim().length, field).toBeGreaterThan(0);
  expect(value, field).not.toMatch(/TODO|TBD|준비 중|작성 예정|예시를 입력/i);
}

describe("Learning modes and editorial coverage", () => {
  it("assigns every original term one learning mode and only enables practice for selected terms", () => {
    expect(GLOSSARY).toHaveLength(239);
    expect(Object.keys(LEARNING_ENTRIES).sort()).toEqual(GLOSSARY.map((entry) => entry.id).sort());
    const examples = Object.values(LEARNING_ENTRIES).filter(
      (learning) => learning.mode === "example",
    );
    const practices = Object.values(LEARNING_ENTRIES).filter(
      (learning) => learning.mode === "practice",
    );
    expect(examples.length).toBeGreaterThan(0);
    expect(practices.length).toBeGreaterThan(0);
    expect(examples.length + practices.length).toBe(239);
    expect(INTERACTIVE_GLOSSARY_COUNT).toBe(practices.length);
    expect(LEARNING_FILTERS.map((filter) => filter.value)).toEqual(["all", "example", "practice"]);
    expect(LEARNING_FILTERS.map((filter) => filter.count)).toEqual([
      239,
      examples.length,
      practices.length,
    ]);

    for (const entry of GLOSSARY) {
      const learning = getGlossaryLearning(entry.id)!;
      expect(learning.id, entry.id).toBe(entry.id);
      expect(getLearningMode(entry), entry.id).toBe(learning.mode);
      expect(hasGlossaryPractice(entry), entry.id).toBe(learning.mode === "practice");
      if (learning.mode === "practice") {
        expectAuthored(learning.practiceReason!, `${entry.id}.practiceReason`);
        if (!entry.lessonId) {
          const practice = getGlossaryPractice(entry.id)!;
          expect(practice?.id, entry.id).toBe(entry.id);
          if (learning.figure.kind === "preset") {
            expect(practice.kind, entry.id).toBe("visual");
            if (practice.kind === "visual")
              expect(learning.figure.preset, entry.id).toBe(practice.preset);
          }
        }
      }
      if (entry.lessonId) expect(learning.mode, entry.id).toBe("practice");
    }
    expect(getGlossaryLearning("missing-term")).toBeUndefined();
    expect(getLearningMode({ id: "missing-term" })).toBeUndefined();
    expect(hasGlossaryPractice({ id: "missing-term" })).toBe(false);
  });

  it("provides an authored visual specification and valid reference links for each learning page", () => {
    for (const learning of Object.values(LEARNING_ENTRIES)) {
      expect(["example", "practice"], learning.id).toContain(learning.mode);
      expectAuthored(learning.rationale, `${learning.id}.rationale`);
      const figure = learning.figure;
      expect(figureKinds.has(figure.kind), learning.id).toBe(true);
      for (const field of ["title", "subtitle", "focus", "caption"] as const) {
        expectAuthored(figure[field], `${learning.id}.figure.${field}`);
      }
      expect(figure.items.length, learning.id).toBeGreaterThan(0);
      for (const item of figure.items) {
        expectAuthored(item.label, `${learning.id}.item.label`);
        expectAuthored(item.text, `${learning.id}.item.text`);
        if (item.detail !== undefined) expectAuthored(item.detail, `${learning.id}.item.detail`);
        if (item.value !== undefined) expect(Number.isFinite(item.value), learning.id).toBe(true);
      }
      if (figure.kind === "preset") expect(figure.preset, learning.id).toBeDefined();
      for (const reference of learning.references) {
        expectAuthored(reference.title, `${learning.id}.reference.title`);
        expectAuthored(reference.note, `${learning.id}.reference.note`);
        const url = new URL(reference.url);
        expect(url.protocol, learning.id).toBe("https:");
        expect(url.hostname, learning.id).not.toMatch(/^(localhost|example\.(com|org|net))$/);
      }
    }
  });

  it.each(["case-study", "case-studies"])(
    "teaches %s through a visual example and a real source, without an arbitrary exercise",
    (id) => {
      const entry = GLOSSARY.find((entry) => entry.id === id)!;
      const learning = getGlossaryLearning(id)!;
      expect(learning.mode).toBe("example");
      expect(learning.figure.kind).toBe("case-study");
      expect(
        learning.references.some(
          (reference) => reference.url === "https://stevenwett.com/work/news-on-spotify",
        ),
      ).toBe(true);
      const practice = getGlossaryPractice(id);
      // Retained archive data must never override the editorial example-only mode.
      const { container } = render(
        <GlossaryLearningLesson
          entry={entry}
          learning={learning}
          {...(practice ? { practice } : {})}
        />,
      );
      expect(screen.getByRole("heading", { name: "시각 예시" })).toBeInTheDocument();
      const figure = screen.getByRole("figure");
      expect(figure).toBeInTheDocument();
      expect(figure).toHaveAccessibleName(`${entry.korean} 예시`);
      const exampleScreen = figure.querySelector<HTMLElement>(".gaf-case-screen");
      expect(exampleScreen).toBeInTheDocument();
      const example = within(exampleScreen!);
      const expectedContent =
        id === "case-study"
          ? ["인터뷰 질문 가이드", "컴포넌트 설계 노트"]
          : ["모임 참가비", "재료비", "전체 금액", "20,000원"];
      expectedContent.forEach((text) => expect(example.getByText(text)).toBeInTheDocument());
      expect(within(figure).getByText("설계 방향을 보여 주는 정적 예시")).toBeInTheDocument();
      expect(within(figure).getByText("K-Move 교육용 재구성")).toBeInTheDocument();
      const references = within(screen.getByRole("region", { name: "실제 사례 더 보기" }));
      for (const reference of learning.references) {
        const link = references
          .getAllByRole("link")
          .find((link) => link.getAttribute("href") === reference.url);
        expect(link).toHaveAccessibleName(expect.stringContaining(reference.title));
      }
      expect(screen.queryByRole("heading", { name: "직접 해보기" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "처음부터 해보기" })).not.toBeInTheDocument();
      expect(container.querySelector(".gp-exercise")).not.toBeInTheDocument();
      expect(screen.queryByRole("group", { name: "상황에 맞는 선택" })).not.toBeInTheDocument();
    },
  );
});

describe("Selected analysis practices", () => {
  it.each(["affinity-diagram", "information-architecture-ia"])(
    "keeps the %s classification task connected to its example",
    (id) => {
      const entry = GLOSSARY.find((entry) => entry.id === id)!;
      const learning = getGlossaryLearning(id)!;
      const practice = getGlossaryPractice(id)!;
      expect(learning.mode).toBe("practice");
      expect(practice.kind).toBe("sort");
      if (practice.kind !== "sort") throw new Error(`Expected a classification practice for ${id}`);
      render(<GlossaryLearningLesson entry={entry} learning={learning} practice={practice} />);
      expect(screen.getByRole("figure")).toHaveAccessibleName(`${entry.korean} 예시`);
      const exercise = within(screen.getByRole("region", { name: "직접 해보기" }));
      expect(exercise.getByText(learning.practiceReason!)).toBeInTheDocument();
      expect(exercise.getByText(practice.instruction)).toBeInTheDocument();
      expect(exercise.getByRole("button", { name: "분류 확인하기" })).toBeDisabled();
      for (const item of practice.items) {
        fireEvent.change(exercise.getByRole("combobox", { name: `${item.label} 분류` }), {
          target: { value: String(item.category) },
        });
      }
      fireEvent.click(exercise.getByRole("button", { name: "분류 확인하기" }));
      expect(exercise.getByRole("status")).toHaveTextContent(
        `${practice.items.length}개 중 ${practice.items.length}개`,
      );
      practice.items.forEach((item) =>
        expect(exercise.getByText(item.explanation, { exact: false })).toBeInTheDocument(),
      );
      fireEvent.click(exercise.getByRole("button", { name: "처음부터 해보기" }));
      expect(exercise.getByRole("button", { name: "분류 확인하기" })).toBeDisabled();
      exercise.getAllByRole("combobox").forEach((select) => expect(select).toHaveValue("-1"));
    },
  );
});

describe("Complete learning rendering", () => {
  it("renders every non-legacy term with its figure and obeys its example/practice mode", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnings = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const entry of GLOSSARY.filter((entry) => !entry.lessonId)) {
      const learning = getGlossaryLearning(entry.id)!;
      const practice = getGlossaryPractice(entry.id);
      const view = render(
        <GlossaryLearningLesson
          entry={entry}
          learning={learning}
          {...(practice ? { practice } : {})}
        />,
      );
      expect(
        screen.getByRole("heading", { name: entry.english, level: 2 }),
        entry.id,
      ).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "시각 예시" }), entry.id).toBeInTheDocument();
      expect(screen.getByRole("figure"), entry.id).toBeInTheDocument();
      expect(screen.getByRole("figure"), entry.id).toHaveAccessibleName(`${entry.korean} 예시`);
      const exercise = screen.queryByRole("heading", { name: "직접 해보기" });
      if (learning.mode === "practice") {
        expect(exercise, entry.id).toBeInTheDocument();
        expect(view.container.querySelector(".gp-exercise"), entry.id).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "처음부터 해보기" }),
          entry.id,
        ).toBeInTheDocument();
      } else {
        expect(exercise, entry.id).not.toBeInTheDocument();
        expect(view.container.querySelector(".gp-exercise"), entry.id).not.toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: "처음부터 해보기" }),
          entry.id,
        ).not.toBeInTheDocument();
      }
      for (const reference of learning.references) {
        expect(
          Array.from(view.container.querySelectorAll("a"), (link) => link.getAttribute("href")),
          entry.id,
        ).toContain(reference.url);
      }
      view.unmount();
    }
    expect(errors).not.toHaveBeenCalled();
    expect(warnings).not.toHaveBeenCalled();
  }, 30_000);
});
