import { useSyncExternalStore } from "react";

export const AFTER_THEME = "After_261127";
export const LIQUID_GLASS_COLOR_THEME = "Liquid Glass_color";
export const LIQUID_GLASS_BASIC_THEME = "Liquid Glass_basic";
export const LIQUID_GLASS_V2_THEME = "LiquidGlass_v2";
export const DEFAULT_THEME = LIQUID_GLASS_V2_THEME;
export const THEME_STORAGE_KEY = "kmove:theme";
const themeChangeEvent = "kmove:themechange";
type Theme =
  | typeof AFTER_THEME
  | typeof LIQUID_GLASS_COLOR_THEME
  | typeof LIQUID_GLASS_BASIC_THEME
  | typeof LIQUID_GLASS_V2_THEME;

const preferences = new Map<string, Theme>([
  [AFTER_THEME, AFTER_THEME],
  [LIQUID_GLASS_V2_THEME, LIQUID_GLASS_V2_THEME],
  [LIQUID_GLASS_COLOR_THEME, LIQUID_GLASS_COLOR_THEME],
  [LIQUID_GLASS_BASIC_THEME, LIQUID_GLASS_BASIC_THEME],
  ["Liquid Class_color", LIQUID_GLASS_COLOR_THEME],
  ["Liquid Class_basic", LIQUID_GLASS_BASIC_THEME],
  ["Apple_261127", LIQUID_GLASS_BASIC_THEME],
  ["LiquidGlass_261127", LIQUID_GLASS_BASIC_THEME],
]);

// Runs in <head>, before the stylesheet and React hydration.
export const themeBootstrapScript = `try {
  const saved = localStorage.getItem("${THEME_STORAGE_KEY}");
  const theme = new Map(${JSON.stringify([...preferences])}).get(saved) ?? "${DEFAULT_THEME}";
  if (theme === "${AFTER_THEME}") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
} catch {}`;

function currentTheme(): Theme {
  return preferences.get(document.documentElement.dataset["theme"] ?? "") ?? AFTER_THEME;
}

function applyTheme(theme: Theme) {
  if (theme !== AFTER_THEME) document.documentElement.dataset["theme"] = theme;
  else delete document.documentElement.dataset["theme"];
  window.dispatchEvent(new Event(themeChangeEvent));
}

export function setTheme(value: string) {
  const theme = preferences.get(value) ?? DEFAULT_THEME;
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The active tab still keeps the selection until it closes or reloads.
  }
}

export function syncStoredTheme() {
  function restore() {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      const selected = preferences.get(saved ?? "");
      const theme = selected ?? DEFAULT_THEME;
      if (selected && theme !== saved) {
        setTheme(theme);
      } else {
        applyTheme(theme);
      }
    } catch {
      // Storage can be unavailable in an embedded preview.
    }
  }
  function onStorage(event: StorageEvent) {
    if (event.key === THEME_STORAGE_KEY || event.key === null) restore();
  }
  restore();
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

function subscribe(notify: () => void) {
  window.addEventListener(themeChangeEvent, notify);
  return () => window.removeEventListener(themeChangeEvent, notify);
}

export function useTheme() {
  return useSyncExternalStore(subscribe, currentTheme, () => DEFAULT_THEME);
}
