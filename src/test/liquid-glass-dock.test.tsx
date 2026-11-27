import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MobileDock } from "@/components/MobileDock";
import { LIQUID_GLASS_V2_THEME } from "@/lib/theme";

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset["theme"];
});

function pointer(target: Element, type: string, x: number, y = 20) {
  const event = new MouseEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0 });
  Object.defineProperties(event, {
    isPrimary: { value: true },
    pointerId: { value: 1 },
    pointerType: { value: "touch" },
  });
  fireEvent(target, event);
}

function renderDock() {
  document.documentElement.dataset["theme"] = LIQUID_GLASS_V2_THEME;
  const visit = vi.fn();
  render(
    <MobileDock activeIndex={0} count={2}>
      {["홈", "수업"].map((label, index) => (
        <a
          href={index ? "/sessions" : "/"}
          key={label}
          onClick={(event) => {
            event.preventDefault();
            visit(label);
          }}
        >
          {label}
        </a>
      ))}
    </MobileDock>,
  );
  const dock = screen.getByRole("navigation");
  const [home, sessions] = screen.getAllByRole("link") as [HTMLElement, HTMLElement];
  dock.setPointerCapture = vi.fn();
  vi.spyOn(dock.querySelector("[data-dock-track]")!, "getBoundingClientRect").mockReturnValue({
    left: 0,
    width: 200,
  } as DOMRect);
  return { dock, home, sessions, visit };
}

describe("Liquid Glass mobile navigation", () => {
  it("visits the released tab once when a horizontal drag ends over a different link", () => {
    const { dock, home, sessions, visit } = renderDock();
    const originalHitTest = Object.getOwnPropertyDescriptor(document, "elementFromPoint");
    Object.defineProperty(document, "elementFromPoint", {
      configurable: true,
      value: () => sessions,
    });
    try {
      pointer(home, "pointerdown", 40);
      pointer(home, "pointermove", 150);
      expect(dock).toHaveAttribute("data-dock-dragging");
      expect(dock.style.getPropertyValue("--dock-drag-position")).toBe("1");
      pointer(dock, "pointerup", 150);
      fireEvent.click(home, { detail: 1 });
      expect(visit.mock.calls).toEqual([["수업"]]);
      expect(dock).not.toHaveAttribute("data-dock-dragging");
    } finally {
      if (originalHitTest) Object.defineProperty(document, "elementFromPoint", originalHitTest);
      else Reflect.deleteProperty(document, "elementFromPoint");
    }
  });

  it("restores selection after cancellation and leaves vertical pans and keyboard clicks usable", () => {
    const { dock, home, sessions, visit } = renderDock();
    pointer(home, "pointerdown", 40);
    pointer(home, "pointermove", 110);
    pointer(dock, "pointercancel", 110);
    expect(dock.style.getPropertyValue("--dock-drag-position")).toBe("");
    expect(dock.style.getPropertyValue("--dock-active-index")).toBe("0");
    fireEvent.click(home, { detail: 1 });
    expect(visit).not.toHaveBeenCalled();

    pointer(home, "pointerdown", 40, 25);
    pointer(home, "pointermove", 41, 0);
    expect(dock).not.toHaveAttribute("data-dock-dragging");
    pointer(home, "pointerup", 41, 0);
    fireEvent.click(home, { detail: 1 });
    expect(visit).not.toHaveBeenCalled();
    fireEvent.click(sessions, { detail: 0 });
    expect(visit).toHaveBeenCalledWith("수업");
  });
});
