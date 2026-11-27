import { useSyncExternalStore } from "react";

export const DEFAULT_THEME = "After_261127";
export const LIQUID_CLASS_COLOR_THEME = "Liquid Class_color";
export const LIQUID_CLASS_BASIC_THEME = "Liquid Class_basic";
export const THEME_STORAGE_KEY = "kmove:theme";
const themeChangeEvent = "kmove:themechange";
type GlassTheme = typeof LIQUID_CLASS_COLOR_THEME | typeof LIQUID_CLASS_BASIC_THEME;
type Theme = typeof DEFAULT_THEME | GlassTheme;

// Both historical IDs last rendered the neutral version of Liquid Glass.
const glassPreferences = new Map<string, GlassTheme>([
  [LIQUID_CLASS_COLOR_THEME, LIQUID_CLASS_COLOR_THEME],
  [LIQUID_CLASS_BASIC_THEME, LIQUID_CLASS_BASIC_THEME],
  ["Apple_261127", LIQUID_CLASS_BASIC_THEME],
  ["LiquidGlass_261127", LIQUID_CLASS_BASIC_THEME],
]);

// Runs in <head>, before the stylesheet and React hydration.
export const themeBootstrapScript = `try {
  const saved = localStorage.getItem("${THEME_STORAGE_KEY}");
  const theme = new Map(${JSON.stringify([...glassPreferences])}).get(saved);
  if (theme) document.documentElement.dataset.theme = theme;
} catch {}`;

function currentTheme(): Theme {
  return glassPreferences.get(document.documentElement.dataset["theme"] ?? "") ?? DEFAULT_THEME;
}

function applyTheme(theme: Theme) {
  if (theme !== DEFAULT_THEME) document.documentElement.dataset["theme"] = theme;
  else delete document.documentElement.dataset["theme"];
  window.dispatchEvent(new Event(themeChangeEvent));
}

export function setTheme(value: string) {
  const theme = glassPreferences.get(value) ?? DEFAULT_THEME;
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
      const theme = glassPreferences.get(saved ?? "") ?? DEFAULT_THEME;
      if (theme !== DEFAULT_THEME && theme !== saved) {
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
