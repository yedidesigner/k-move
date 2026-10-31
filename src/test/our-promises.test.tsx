import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OurPromises } from "@/components/OurPromises";

interface PromiseRecord {
  content: string;
  updated_at: string;
}

interface PromiseWrite {
  user_id: string;
  content: string;
}

interface DatabaseResult {
  data: PromiseRecord | null;
  error: { message: string } | null;
}

interface TestUser {
  id: string;
  user_metadata: { username: string };
}

const auth = vi.hoisted(() => ({ user: null as TestUser | null }));
const database = vi.hoisted(() => ({ read: vi.fn(), write: vi.fn() }));

vi.mock("@/lib/auth", () => ({ useAuth: () => auth }));
vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    from: (table: string) => {
      if (table !== "kmove_promises") throw new Error(`Unexpected table: ${table}`);
      return {
        select: () => ({
          eq: (column: string, userId: string) => {
            if (column !== "user_id") throw new Error("Promise reads must be scoped to the owner");
            return { maybeSingle: () => database.read(userId) };
          },
        }),
        upsert: (row: PromiseWrite, options: { onConflict: string }) => ({
          select: () => ({ single: () => database.write(row, options) }),
        }),
      };
    },
  }),
}));

const studentA: TestUser = {
  id: "00000000-0000-4000-8000-000000000001",
  user_metadata: { username: "첫 번째 수강생" },
};
const studentB: TestUser = {
  id: "00000000-0000-4000-8000-000000000002",
  user_metadata: { username: "두 번째 수강생" },
};
const savedAt = "2026-10-31T18:00:00.000Z";
const serverRows = new Map<string, PromiseRecord>();
const record = (content: string): PromiseRecord => ({ content, updated_at: savedAt });

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((complete) => { resolve = complete; });
  return { promise, resolve };
}

beforeEach(() => {
  auth.user = studentA;
  serverRows.clear();
  database.read.mockReset().mockImplementation(async (userId: string): Promise<DatabaseResult> => ({
    data: serverRows.get(userId) ?? null,
    error: null,
  }));
  database.write.mockReset().mockImplementation(async (row: PromiseWrite): Promise<DatabaseResult> => {
    const saved = record(row.content);
    serverRows.set(row.user_id, saved);
    return { data: saved, error: null };
  });
});
afterEach(cleanup);

function changePromise(content: string) {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: content } });
}

describe("Our promises and each student's personal tenth promise", () => {
  it("preserves all nine supplied statements and provides a tenth writing area", async () => {
    render(<OurPromises />);
    await screen.findByRole("textbox", { name: "첫 번째 수강생님의 약속" });
    const items = within(screen.getByRole("list", { name: "우리의 열 가지 약속" })).getAllByRole("listitem");
    expect(items).toHaveLength(10);
    const statements = [
      "긍정적인 자세로 배웁니다",
      "긍정적인 에너지를 전하는 학생이 됩니다",
      "모르는 것에 대해서 부끄러워 하지 않습니다",
      "친구들간에 도와주는 자세를 가집니다",
      "서로 칭찬하는 분위기를 가집니다",
      "예의를 갖춰 대화합니다",
      "적극적인 태도로 듣습니다",
      "포기하지 않습니다",
      "스스로를 자랑스럽게 여깁니다",
    ];
    statements.forEach((statement, index) => {
      expect(within(items[index]!).getByText(statement, { exact: true })).toBeVisible();
    });
    expect(screen.getByRole("textbox")).toHaveAttribute("maxlength", "500");
    expect(screen.getByText("0 / 500자")).toBeVisible();
    expect(database.read).toHaveBeenCalledWith(studentA.id);
  });

  it("waits for the backend confirmation, trims text, and blocks duplicate saves", async () => {
    const pending = deferred<DatabaseResult>();
    database.write.mockReturnValueOnce(pending.promise);
    render(<OurPromises />);
    const textarea = await screen.findByRole("textbox");
    changePromise("  매일 작은 도전을 이어 가겠습니다. \n");
    fireEvent.click(screen.getByRole("button", { name: "약속 저장" }));

    expect(database.write).toHaveBeenCalledWith(
      { user_id: studentA.id, content: "매일 작은 도전을 이어 가겠습니다." },
      { onConflict: "user_id" },
    );
    expect(textarea).toBeDisabled();
    expect(screen.getByRole("button", { name: "저장 중…" })).toBeDisabled();
    fireEvent.submit(textarea.closest("form")!);
    expect(database.write).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("나의 약속이 저장되었습니다.")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "수정하기" })).not.toBeInTheDocument();

    await act(async () => pending.resolve({ data: record("매일 작은 도전을 이어 가겠습니다."), error: null }));
    expect(screen.getByText("나의 약속이 저장되었습니다.")).toBeVisible();
    expect(screen.getByRole("button", { name: "수정하기" })).toHaveFocus();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("reloads the saved statement and supports editing, cancellation, and a persisted revision", async () => {
    const first = render(<OurPromises />);
    await screen.findByRole("textbox");
    changePromise("나의 첫 번째 다짐");
    fireEvent.click(screen.getByRole("button", { name: "약속 저장" }));
    await screen.findByRole("button", { name: "수정하기" });
    first.unmount();

    const second = render(<OurPromises />);
    expect(await screen.findByText("나의 첫 번째 다짐")).toBeVisible();
    expect(database.read).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("button", { name: "수정하기" }));
    expect(screen.getByRole("textbox")).toHaveValue("나의 첫 번째 다짐");
    expect(screen.getByRole("textbox")).toHaveFocus();
    changePromise("취소할 초안");
    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(screen.getByText("나의 첫 번째 다짐")).toBeVisible();
    expect(database.write).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "수정하기" }));
    changePromise("친구의 도전도 응원하겠습니다.");
    fireEvent.click(screen.getByRole("button", { name: "변경 내용 저장" }));
    await screen.findByRole("button", { name: "수정하기" });
    second.unmount();

    render(<OurPromises />);
    expect(await screen.findByText("친구의 도전도 응원하겠습니다.")).toBeVisible();
    expect(screen.queryByText("나의 첫 번째 다짐")).not.toBeInTheDocument();
    expect(database.write).toHaveBeenCalledTimes(2);
    expect(serverRows.size).toBe(1);
  });

  it("rejects whitespace-only or oversized content without sending it to the database", async () => {
    render(<OurPromises />);
    await screen.findByRole("textbox");
    changePromise(" \n\t ");
    fireEvent.click(screen.getByRole("button", { name: "약속 저장" }));
    expect(screen.getByRole("alert")).toHaveTextContent("빈칸만으로는 저장할 수 없습니다.");
    expect(screen.getByRole("textbox")).toHaveFocus();
    changePromise("가".repeat(501));
    fireEvent.click(screen.getByRole("button", { name: "약속 저장" }));
    expect(screen.getByRole("alert")).toHaveTextContent("500자 이내");
    expect(database.write).not.toHaveBeenCalled();
  });

  it("does not offer an empty editor after a read failure and restores the existing record on retry", async () => {
    serverRows.set(studentA.id, record("이미 저장한 약속"));
    database.read.mockResolvedValueOnce({ data: null, error: { message: "Unavailable" } });
    render(<OurPromises />);
    expect(await screen.findByRole("alert")).toHaveTextContent("약속을 불러오지 못했습니다.");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "약속 저장" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "다시 불러오기" }));
    expect(await screen.findByText("이미 저장한 약속")).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(database.write).not.toHaveBeenCalled();
  });

  it.each(["database error", "network rejection", "missing saved record"])(
    "keeps the draft and does not claim success after a %s",
    async (failure) => {
      if (failure === "network rejection") {
        database.write.mockRejectedValueOnce(new Error("Offline"));
      } else {
        database.write.mockResolvedValueOnce({
          data: null,
          error: failure === "database error" ? { message: "Denied" } : null,
        });
      }
      render(<OurPromises />);
      await screen.findByRole("textbox");
      changePromise("실패해도 초안은 남아 있습니다.");
      fireEvent.click(screen.getByRole("button", { name: "약속 저장" }));
      expect(await screen.findByRole("alert")).toHaveTextContent("약속을 저장하지 못했습니다.");
      expect(screen.getByRole("textbox")).toHaveValue("실패해도 초안은 남아 있습니다.");
      expect(screen.getByRole("textbox")).toBeEnabled();
      expect(screen.queryByText("나의 약속이 저장되었습니다.")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "수정하기" })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "약속 저장" }));
      expect(await screen.findByText("나의 약속이 저장되었습니다.")).toBeVisible();
    },
  );

  it("removes personal content on logout and makes no additional database calls while signed out", async () => {
    serverRows.set(studentA.id, record("첫 번째 계정의 비공개 약속"));
    const view = render(<OurPromises />);
    await screen.findByText("첫 번째 계정의 비공개 약속");
    auth.user = null;
    view.rerender(<OurPromises />);
    expect(screen.queryByText("첫 번째 계정의 비공개 약속")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "수정하기" })).not.toBeInTheDocument();
    expect(screen.getByText("로그인하면 나의 열 번째 약속을 작성할 수 있습니다.")).toBeVisible();
    expect(database.read).toHaveBeenCalledTimes(1);
    expect(database.write).not.toHaveBeenCalled();
  });

  it("ignores a stale read after switching accounts and saves only as the current account", async () => {
    const oldRead = deferred<DatabaseResult>();
    database.read.mockReturnValueOnce(oldRead.promise);
    const view = render(<OurPromises />);
    auth.user = studentB;
    view.rerender(<OurPromises />);
    const currentEditor = await screen.findByRole("textbox", { name: "두 번째 수강생님의 약속" });
    await act(async () => oldRead.resolve({ data: record("이전 계정의 늦은 응답"), error: null }));
    expect(screen.queryByText("이전 계정의 늦은 응답")).not.toBeInTheDocument();
    expect(currentEditor).toHaveValue("");
    changePromise("두 번째 계정의 새 약속");
    fireEvent.click(screen.getByRole("button", { name: "약속 저장" }));
    await screen.findByRole("button", { name: "수정하기" });
    expect(database.write).toHaveBeenCalledWith(
      { user_id: studentB.id, content: "두 번째 계정의 새 약속" },
      { onConflict: "user_id" },
    );
    expect(serverRows.has(studentA.id)).toBe(false);
  });

  it("ignores an old account's save response without replacing the current account's statement", async () => {
    const oldSave = deferred<DatabaseResult>();
    database.write.mockReturnValueOnce(oldSave.promise);
    serverRows.set(studentB.id, record("두 번째 계정에 저장된 약속"));
    const view = render(<OurPromises />);
    await screen.findByRole("textbox");
    changePromise("첫 번째 계정의 저장 요청");
    fireEvent.click(screen.getByRole("button", { name: "약속 저장" }));
    auth.user = studentB;
    view.rerender(<OurPromises />);
    expect(await screen.findByText("두 번째 계정에 저장된 약속")).toBeVisible();

    await act(async () => oldSave.resolve({ data: record("첫 번째 계정의 저장 요청"), error: null }));
    expect(screen.queryByText("첫 번째 계정의 저장 요청")).not.toBeInTheDocument();
    expect(screen.queryByText("나의 약속이 저장되었습니다.")).not.toBeInTheDocument();
    expect(screen.getByText("두 번째 계정에 저장된 약속")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "수정하기" }));
    changePromise("두 번째 계정의 수정한 약속");
    fireEvent.click(screen.getByRole("button", { name: "변경 내용 저장" }));
    await waitFor(() => expect(screen.getByText("나의 약속이 저장되었습니다.")).toBeVisible());
    expect(database.write).toHaveBeenLastCalledWith(
      { user_id: studentB.id, content: "두 번째 계정의 수정한 약속" },
      { onConflict: "user_id" },
    );
  });
});
