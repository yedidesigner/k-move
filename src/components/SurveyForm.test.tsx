import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SurveyForm } from "./SurveyForm";
import { InstructorDashboard } from "./InstructorDashboard";
import { survey, type Answers, type SurveyResponse } from "@/lib/survey";
const valid: Answers = {
  name: "테스트 수강생",
  aiExperience: "basic",
  aiServices: ["chatgpt_free"],
  designSkills: Object.fromEntries(
    survey.questions.find((q) => q.id === "designSkills")!.rows!.map((r) => [r.id, "guided"]),
  ),
  portfolio: "works",
  interests: ["graphic"],
  goals: ["prompt", "image"],
  message: "",
};
afterEach(cleanup);
describe("submission and review", () => {
  it("requires review confirmation before submitting", () => {
    const save = vi.fn();
    render(<SurveyForm initialAnswers={valid} initialStep={3} onSubmit={save} />);
    expect(screen.getByRole("button", { name: "설문 제출" })).toBeDisabled();
    expect(save).not.toHaveBeenCalled();
  });
  it("keeps answers on server failure and allows retry", async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error("연결 오류")).mockResolvedValue(undefined);
    render(<SurveyForm initialAnswers={valid} initialStep={3} onSubmit={save} />);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "설문 제출" }));
    await screen.findByRole("alert");
    expect(screen.getByText(/입력한 내용은 유지/)).toBeInTheDocument();
    expect(screen.getByText("테스트 수강생")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "설문 제출" }));
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    expect(save.mock.calls[1]?.[0]).toEqual(valid);
  });
  it("does not send a second request while saving", async () => {
    let finish!: () => void;
    const save = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(<SurveyForm initialAnswers={valid} initialStep={3} onSubmit={save} />);
    fireEvent.click(screen.getByRole("checkbox"));
    const button = screen.getByRole("button", { name: "설문 제출" });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(save).toHaveBeenCalledTimes(1);
    finish();
    await waitFor(() => expect(button).not.toBeDisabled());
  });
  it("does not count teacher test responses as student responses", () => {
    const profiles = [
      { id: "s1", username: "수강생가", role: "student" as const, created_at: "2026-10-25" },
      { id: "s2", username: "수강생나", role: "student" as const, created_at: "2026-10-25" },
      { id: "t1", username: "강사", role: "instructor" as const, created_at: "2026-10-25" },
    ];
    const responses = ["s1", "t1"].map((user_id) => ({
      user_id,
      survey_id: survey.id,
      schema_version: 2,
      answers: valid,
      submitted_at: "2026-10-25T00:00:00Z",
      updated_at: "2026-10-25T00:00:00Z",
    })) as SurveyResponse[];
    render(
      <InstructorDashboard
        profiles={profiles}
        responses={responses}
        refreshing={false}
        onRefresh={() => {}}
      />,
    );
    expect(screen.getByText("50%")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "제출 상태" }), {
      target: { value: "pending" },
    });
    expect(screen.getByText("수강생나")).toBeInTheDocument();
    expect(screen.queryByText("수강생가")).not.toBeInTheDocument();
  });
});
