import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { requestEditorExit, useEditorExitGuard } from "@/lib/editor-exit-guard";

function Guard({ check }: { check: () => boolean | Promise<boolean> }) {
  useEditorExitGuard(check);
  return null;
}

afterEach(cleanup);

describe("editor exit protection outside router navigation", () => {
  it("allows exit when no editor is mounted", async () => {
    expect(await requestEditorExit()).toBe(true);
  });

  it("uses current editor state and unregisters an unmounted editor", async () => {
    const clean = vi.fn(() => true);
    const dirty = vi.fn(() => false);
    const view = render(<Guard check={clean} />);
    expect(await requestEditorExit()).toBe(true);
    view.rerender(<Guard check={dirty} />);
    expect(await requestEditorExit()).toBe(false);
    expect(dirty).toHaveBeenCalledOnce();
    view.unmount();
    expect(await requestEditorExit()).toBe(true);
    expect(dirty).toHaveBeenCalledOnce();
  });

  it("awaits saving before permitting exit and shares repeated exit requests", async () => {
    let resolve!: (saved: boolean) => void;
    const save = new Promise<boolean>((done) => {
      resolve = done;
    });
    const check = vi.fn(() => save);
    render(<Guard check={check} />);
    const first = requestEditorExit();
    const second = requestEditorExit();
    expect(first).toBe(second);
    expect(check).toHaveBeenCalledOnce();
    let completed = false;
    void first.then(() => {
      completed = true;
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(completed).toBe(false);
    await act(async () => {
      resolve(true);
      expect(await first).toBe(true);
    });
    expect(completed).toBe(true);
  });

  it("stops after a rejected leave decision without discarding a second editor", async () => {
    const second = vi.fn(() => true);
    render(
      <>
        <Guard check={() => false} />
        <Guard check={second} />
      </>,
    );
    expect(await requestEditorExit()).toBe(false);
    expect(second).not.toHaveBeenCalled();
  });

  it("keeps the session open after a failed save and permits a successful retry", async () => {
    const check = vi
      .fn<() => Promise<boolean>>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(true);
    render(<Guard check={check} />);
    expect(await requestEditorExit()).toBe(false);
    expect(await requestEditorExit()).toBe(true);
  });
});
