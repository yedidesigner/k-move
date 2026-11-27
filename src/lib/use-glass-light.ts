import { useEffect } from "react";
import { LIQUID_GLASS_V2_THEME, useTheme } from "./theme";

// Only the active control reflects the pointer. Reading surfaces stay still.
const controls = [
  "[data-lms-sidebar] a[data-nav-active]",
  "[data-lms-header] summary",
  ".lms-login-card button",
  ".lms-login-card select",
  ".lms-workbook-submit",
  ".lms-submit-action",
  ".iw-primary",
  "button.bg-primary",
].join(",");

export function useGlassLight() {
  const theme = useTheme();
  useEffect(() => {
    if (theme !== LIQUID_GLASS_V2_THEME) return;
    const quiet = window.matchMedia(
      "(prefers-reduced-motion: reduce), (prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active)",
    );
    let active: HTMLElement | null = null;
    let frame = 0;
    let x = 0;
    let y = 0;

    function clear() {
      cancelAnimationFrame(frame);
      frame = 0;
      active?.removeAttribute("data-glass-lit");
      active?.style.removeProperty("--glass-light-x");
      active?.style.removeProperty("--glass-light-y");
      active = null;
    }
    function move(event: PointerEvent) {
      if (!active || !event.isPrimary) return;
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!active) return;
        const rect = active.getBoundingClientRect();
        active.style.setProperty("--glass-light-x", `${x - rect.left}px`);
        active.style.setProperty("--glass-light-y", `${y - rect.top}px`);
        active.setAttribute("data-glass-lit", "");
      });
    }
    function enter(event: PointerEvent) {
      if (quiet.matches || !event.isPrimary || !(event.target instanceof Element)) return;
      const next = event.target.closest<HTMLElement>(controls);
      if (next !== active) clear();
      if (!next || next.matches(":disabled, [aria-disabled='true']")) return;
      active = next;
      move(event);
    }
    function leave(event: PointerEvent) {
      if (!active || (event.relatedTarget instanceof Node && active.contains(event.relatedTarget)))
        return;
      clear();
    }
    function release(event: PointerEvent) {
      if (event.pointerType !== "mouse") clear();
    }
    document.addEventListener("pointerover", enter);
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerout", leave);
    document.addEventListener("pointerup", release);
    document.addEventListener("pointercancel", clear);
    window.addEventListener("blur", clear);
    quiet.addEventListener("change", clear);
    return () => {
      clear();
      document.removeEventListener("pointerover", enter);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("pointerup", release);
      document.removeEventListener("pointercancel", clear);
      window.removeEventListener("blur", clear);
      quiet.removeEventListener("change", clear);
    };
  }, [theme]);
}
