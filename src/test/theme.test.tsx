import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { runInNewContext } from "node:vm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeSelect } from "@/components/ThemeSelect";
import {
  LIQUID_CLASS_BASIC_THEME,
  LIQUID_CLASS_COLOR_THEME,
  DEFAULT_THEME,
  syncStoredTheme,
  themeBootstrapScript,
  THEME_STORAGE_KEY,
} from "@/lib/theme";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.removeItem(THEME_STORAGE_KEY);
  delete document.documentElement.dataset["theme"];
});

describe("LMS theme preference", () => {
  it.each(["Apple_261127", "LiquidGlass_261127"])(
    "applies and migrates %s to the neutral version",
    (previous) => {
      localStorage.setItem(THEME_STORAGE_KEY, previous);
      runInNewContext(themeBootstrapScript, { localStorage, document });
      expect(document.documentElement).toHaveAttribute("data-theme", LIQUID_CLASS_BASIC_THEME);
      const stop = syncStoredTheme();
      try {
        render(<ThemeSelect />);
        expect(screen.getByRole("combobox")).toHaveValue(LIQUID_CLASS_BASIC_THEME);
        expect(screen.getByRole("option", { name: "Liquid Class_color" })).toHaveValue(
          LIQUID_CLASS_COLOR_THEME,
        );
        expect(screen.getByRole("option", { name: "Liquid Class_basic" })).toHaveValue(
          LIQUID_CLASS_BASIC_THEME,
        );
        expect(screen.getAllByRole("option")).toHaveLength(3);
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(LIQUID_CLASS_BASIC_THEME);
      } finally {
        stop();
      }
    },
  );

  it.each([LIQUID_CLASS_COLOR_THEME, LIQUID_CLASS_BASIC_THEME])(
    "keeps %s in both selectors and restores it before hydration",
    (theme) => {
      render(
        <>
          <ThemeSelect />
          <ThemeSelect compact />
          <input aria-label="작성 중인 내용" defaultValue="초안" />
        </>,
      );
      const [desktop, mobile] = screen.getAllByRole("combobox", { name: "화면 테마" });
      expect(desktop).toHaveValue(DEFAULT_THEME);
      fireEvent.change(desktop!, { target: { value: theme } });
      expect(mobile).toHaveValue(theme);
      expect(document.documentElement).toHaveAttribute("data-theme", theme);
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(theme);
      expect(screen.getByLabelText("작성 중인 내용")).toHaveValue("초안");

      cleanup();
      delete document.documentElement.dataset["theme"];
      runInNewContext(themeBootstrapScript, { localStorage, document });
      expect(document.documentElement).toHaveAttribute("data-theme", theme);
      const stop = syncStoredTheme();
      try {
        render(<ThemeSelect />);
        expect(screen.getByRole("combobox")).toHaveValue(theme);

        const otherTheme =
          theme === LIQUID_CLASS_BASIC_THEME ? LIQUID_CLASS_COLOR_THEME : LIQUID_CLASS_BASIC_THEME;
        localStorage.setItem(THEME_STORAGE_KEY, otherTheme);
        act(() => window.dispatchEvent(new StorageEvent("storage", { key: THEME_STORAGE_KEY })));
        expect(screen.getByRole("combobox")).toHaveValue(otherTheme);
        expect(document.documentElement).toHaveAttribute("data-theme", otherTheme);

        localStorage.removeItem(THEME_STORAGE_KEY);
        act(() => window.dispatchEvent(new StorageEvent("storage", { key: THEME_STORAGE_KEY })));
        expect(screen.getByRole("combobox")).toHaveValue(DEFAULT_THEME);
        expect(document.documentElement).not.toHaveAttribute("data-theme");
      } finally {
        stop();
      }
    },
  );

  it("falls back for an unknown theme and works in the current tab when storage is blocked", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "old-theme");
    const stop = syncStoredTheme();
    try {
      render(<ThemeSelect />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveValue(DEFAULT_THEME);
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage unavailable");
      });
      fireEvent.change(select, { target: { value: LIQUID_CLASS_COLOR_THEME } });
      expect(select).toHaveValue(LIQUID_CLASS_COLOR_THEME);
      fireEvent.change(select, { target: { value: DEFAULT_THEME } });
      expect(document.documentElement).not.toHaveAttribute("data-theme");
    } finally {
      stop();
    }
  });
});
