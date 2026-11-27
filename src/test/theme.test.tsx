import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { runInNewContext } from "node:vm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeSelect } from "@/components/ThemeSelect";
import {
  AFTER_THEME,
  LIQUID_GLASS_V2_THEME,
  LIQUID_GLASS_BASIC_THEME,
  LIQUID_GLASS_COLOR_THEME,
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
  it.each([
    ["Apple_261127", LIQUID_GLASS_BASIC_THEME],
    ["LiquidGlass_261127", LIQUID_GLASS_BASIC_THEME],
    ["Liquid Class_color", LIQUID_GLASS_COLOR_THEME],
    ["Liquid Class_basic", LIQUID_GLASS_BASIC_THEME],
  ] as const)("migrates %s to %s before hydration", (previous, expected) => {
    localStorage.setItem(THEME_STORAGE_KEY, previous);
    runInNewContext(themeBootstrapScript, { localStorage, document });
    expect(document.documentElement).toHaveAttribute("data-theme", expected);
    const stop = syncStoredTheme();
    try {
      render(<ThemeSelect />);
      expect(screen.getByRole("combobox")).toHaveValue(expected);
      expect(screen.getByRole("option", { name: "Liquid Glass_color" })).toHaveValue(
        LIQUID_GLASS_COLOR_THEME,
      );
      expect(screen.getByRole("option", { name: "Liquid Glass_basic" })).toHaveValue(
        LIQUID_GLASS_BASIC_THEME,
      );
      expect(screen.getByRole("option", { name: "LiquidGlass_v2" })).toHaveValue(
        LIQUID_GLASS_V2_THEME,
      );
      expect(screen.getAllByRole("option")).toHaveLength(4);
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(expected);
    } finally {
      stop();
    }
  });

  it.each([LIQUID_GLASS_COLOR_THEME, LIQUID_GLASS_BASIC_THEME, LIQUID_GLASS_V2_THEME])(
    "keeps %s in both selectors and restores it before hydration",
    (theme) => {
      runInNewContext(themeBootstrapScript, { localStorage, document });
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
          theme === LIQUID_GLASS_BASIC_THEME ? LIQUID_GLASS_COLOR_THEME : LIQUID_GLASS_BASIC_THEME;
        localStorage.setItem(THEME_STORAGE_KEY, otherTheme);
        act(() => window.dispatchEvent(new StorageEvent("storage", { key: THEME_STORAGE_KEY })));
        expect(screen.getByRole("combobox")).toHaveValue(otherTheme);
        expect(document.documentElement).toHaveAttribute("data-theme", otherTheme);

        localStorage.removeItem(THEME_STORAGE_KEY);
        act(() => window.dispatchEvent(new StorageEvent("storage", { key: THEME_STORAGE_KEY })));
        expect(screen.getByRole("combobox")).toHaveValue(DEFAULT_THEME);
        expect(document.documentElement).toHaveAttribute("data-theme", LIQUID_GLASS_V2_THEME);
      } finally {
        stop();
      }
    },
  );

  it("honors an explicitly saved After preference on the first paint", () => {
    document.documentElement.dataset["theme"] = DEFAULT_THEME;
    localStorage.setItem(THEME_STORAGE_KEY, AFTER_THEME);
    runInNewContext(themeBootstrapScript, { localStorage, document });
    render(<ThemeSelect />);
    expect(document.documentElement).not.toHaveAttribute("data-theme");
    expect(screen.getByRole("combobox")).toHaveValue(AFTER_THEME);
  });

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
      fireEvent.change(select, { target: { value: LIQUID_GLASS_COLOR_THEME } });
      expect(select).toHaveValue(LIQUID_GLASS_COLOR_THEME);
      fireEvent.change(select, { target: { value: AFTER_THEME } });
      expect(document.documentElement).not.toHaveAttribute("data-theme");
    } finally {
      stop();
    }
  });
});
