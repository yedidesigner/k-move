import { Palette } from "lucide-react";
import {
  AFTER_THEME,
  LIQUID_GLASS_COLOR_THEME,
  LIQUID_GLASS_BASIC_THEME,
  LIQUID_GLASS_V2_THEME,
  setTheme,
  useTheme,
} from "@/lib/theme";

export function ThemeSelect({ compact = false }: { compact?: boolean }) {
  const theme = useTheme();
  return (
    <label
      title={compact ? "화면 테마" : undefined}
      className={
        compact
          ? "relative flex min-h-11 w-full items-center justify-center focus-within:outline-2 focus-within:outline-ring"
          : "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground"
      }
    >
      {compact && <Palette aria-hidden className="size-4" />}
      <span className={compact ? "sr-only" : undefined}>화면 테마</span>
      <select
        className={
          compact
            ? "absolute inset-0 h-full w-full cursor-pointer opacity-0"
            : "min-h-11 min-w-0 max-w-full flex-1 rounded-md border border-input bg-card px-2 text-base text-foreground focus-visible:outline-2 focus-visible:outline-ring md:text-sm"
        }
        value={theme}
        onChange={(event) => setTheme(event.target.value)}
      >
        <option value={LIQUID_GLASS_V2_THEME}>{LIQUID_GLASS_V2_THEME}</option>
        <option value={LIQUID_GLASS_COLOR_THEME}>{LIQUID_GLASS_COLOR_THEME}</option>
        <option value={LIQUID_GLASS_BASIC_THEME}>{LIQUID_GLASS_BASIC_THEME}</option>
        <option value={AFTER_THEME}>After 261127</option>
      </select>
    </label>
  );
}
