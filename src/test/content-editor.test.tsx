import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContentEditor } from "@/components/instructor/ContentManager";

const api = vi.hoisted(() => ({ save: vi.fn(), publish: vi.fn() }));
vi.mock("@/lib/instructor-api", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/instructor-api")>("@/lib/instructor-api");
  return { ...actual, saveContentDraft: api.save, publishContent: api.publish };
});
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  api.save.mockImplementation(async (kind, key, payload, version) => ({
    kind,
    content_key: key,
    ...payload,
    version: version + 1,
    published_version: 0,
    updated_at: "2026-11-01T00:00:00Z",
    updated_by: "teacher",
  }));
  api.publish.mockResolvedValue({ id: "pub-1" });
});
function editor(onPublished?: () => Promise<void>) {
  const onSaved = vi.fn();
  render(
    <ContentEditor
      kind="announcement"
      contentKey="notice-1"
      onSaved={onSaved}
      onDirtyChange={() => {}}
      {...(onPublished ? { onPublished } : {})}
    />,
  );
  fireEvent.change(screen.getByLabelText(/공지 제목/), { target: { value: "다음 수업 준비" } });
  fireEvent.change(screen.getByLabelText(/공지 내용/), {
    target: { value: "포트폴리오 초안을 준비해 주세요." },
  });
  return { onSaved };
}
describe("instructor content editor", () => {
  it("saving a draft never publishes it", async () => {
    editor();
    fireEvent.click(screen.getByRole("button", { name: "초안 저장" }));
    await screen.findByText("비공개 초안을 저장했습니다.");
    expect(api.save).toHaveBeenCalledWith(
      "announcement",
      "notice-1",
      {
        document: {
          title: "다음 수업 준비",
          body: "포트폴리오 초안을 준비해 주세요.",
          sessionNumber: null,
        },
        hidden: false,
      },
      0,
    );
    expect(api.publish).not.toHaveBeenCalled();
  });
  it("explicit publish uses the newly saved revision", async () => {
    editor();
    fireEvent.click(screen.getByRole("button", { name: "학생에게 공개" }));
    await screen.findByText("학생에게 공개했습니다.");
    expect(api.publish).toHaveBeenCalledWith("announcement", "notice-1", 1, null);
  });
  it("reports a completed publication honestly when the subsequent refresh fails", async () => {
    editor(async () => {
      throw new Error("Network disconnected");
    });
    fireEvent.click(screen.getByRole("button", { name: "학생에게 공개" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("공개 처리는 완료"));
    expect(api.publish).toHaveBeenCalledTimes(1);
  });
  it("retains edited text and does not publish after a concurrent-version rejection", async () => {
    api.save.mockRejectedValue(new Error("version conflict"));
    editor();
    fireEvent.click(screen.getByRole("button", { name: "학생에게 공개" }));
    await screen.findByRole("alert");
    expect(screen.getByLabelText(/공지 내용/)).toHaveValue("포트폴리오 초안을 준비해 주세요.");
    expect(api.publish).not.toHaveBeenCalled();
  });
  it("publishes an explicit hidden tombstone instead of deleting a baseline override", async () => {
    editor();
    fireEvent.click(screen.getByRole("checkbox", { name: /학생 화면에서 숨기기/ }));
    fireEvent.click(screen.getByRole("button", { name: "숨김 적용" }));
    await screen.findByText("학생 화면에서 숨겼습니다.");
    expect(api.save.mock.calls[0]?.[2].hidden).toBe(true);
    expect(api.publish).toHaveBeenCalledTimes(1);
  });
  it("does not create a publication for a past scheduled time", async () => {
    editor();
    fireEvent.change(screen.getByLabelText("공개 예약 시각"), {
      target: { value: "2000-01-01T10:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "이 내용으로 공개 예약" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("미래 시각"));
    expect(api.save).not.toHaveBeenCalled();
    expect(api.publish).not.toHaveBeenCalled();
  });
});
