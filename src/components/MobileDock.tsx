import { useEffect, useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { LIQUID_GLASS_V2_THEME, useTheme } from "@/lib/theme";
import "./liquid-glass-navigation.css";

const navProps = {
  "aria-label": "하단 메뉴",
  "data-lms-dock": "",
  className:
    "fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden",
};

interface DockProps {
  activeIndex: number;
  count: number;
  children: ReactNode;
}

export function MobileDock(props: DockProps) {
  const theme = useTheme();
  return theme === LIQUID_GLASS_V2_THEME ? (
    <GlassDock {...props} />
  ) : (
    <nav {...navProps}>{props.children}</nav>
  );
}

const DRAG_THRESHOLD = 6;

function GlassDock({ activeIndex, count, children }: DockProps) {
  const nav = useRef<HTMLElement>(null);
  const track = useRef<HTMLSpanElement>(null);
  const gesture = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    left: number;
    width: number;
    dragging: boolean;
  } | null>(null);
  const suppressPointerClick = useRef(false);

  useEffect(() => {
    const dock = nav.current;
    if (!dock) return;
    const update = () => dock.toggleAttribute("data-dock-scrolled", window.scrollY > 32);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  function start(event: PointerEvent<HTMLElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    suppressPointerClick.current = false;
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    if (!(event.target instanceof Element) || !event.target.closest("a")) return;
    const bounds = track.current?.getBoundingClientRect();
    if (!bounds?.width) return;
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: bounds.left,
      width: bounds.width,
      dragging: false,
    };
  }

  function clearGesture(dock: HTMLElement) {
    gesture.current = null;
    dock.removeAttribute("data-dock-dragging");
    dock.style.removeProperty("--dock-drag-position");
  }

  function move(event: PointerEvent<HTMLElement>) {
    const press = gesture.current;
    if (!press || event.pointerId !== press.pointerId) return;
    const dock = event.currentTarget;
    if (!press.dragging) {
      const dx = Math.abs(event.clientX - press.startX);
      const dy = Math.abs(event.clientY - press.startY);
      if (Math.max(dx, dy) < DRAG_THRESHOLD) return;
      if (dy > dx) {
        suppressPointerClick.current = true;
        clearGesture(dock);
        return;
      }
      dock.setPointerCapture(event.pointerId);
      press.dragging = true;
      suppressPointerClick.current = true;
      dock.setAttribute("data-dock-dragging", "");
    }
    const position = ((event.clientX - press.left) / press.width) * count - 0.5;
    dock.style.setProperty(
      "--dock-drag-position",
      String(Math.max(0, Math.min(count - 1, position))),
    );
  }

  function end(event: PointerEvent<HTMLElement>) {
    const press = gesture.current;
    if (!press || event.pointerId !== press.pointerId) return;
    const dock = event.currentTarget;
    clearGesture(dock);
    if (!press.dragging) return; // A tap uses the anchor's own click, including router guards.
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("a");
    if (target instanceof HTMLAnchorElement && dock.contains(target)) {
      if (event.pointerType === "mouse") target.focus({ preventScroll: true });
      target.click();
    }
  }

  function cancel(event: PointerEvent<HTMLElement>) {
    if (event.pointerId !== gesture.current?.pointerId) return;
    suppressPointerClick.current = true;
    clearGesture(event.currentTarget);
  }

  return (
    <nav
      {...navProps}
      ref={nav}
      style={{ "--dock-active-index": activeIndex, "--dock-count": count } as CSSProperties}
      data-dock-selected={activeIndex >= 0 ? "" : undefined}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={cancel}
      onLostPointerCapture={(event) => {
        if (event.target === event.currentTarget) cancel(event);
      }}
      onPointerLeave={(event) => {
        const press = gesture.current;
        if (press?.pointerId === event.pointerId && !press.dragging)
          clearGesture(event.currentTarget);
      }}
      onDragStart={(event) => event.preventDefault()}
      onClickCapture={(event) => {
        // Suppress the browser's compatibility click on the original pressed anchor after a drag.
        // Keyboard, assistive technology and the chosen destination's click all have detail 0.
        if (suppressPointerClick.current && event.detail > 0) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <span ref={track} data-dock-track aria-hidden="true" />
      {children}
    </nav>
  );
}
