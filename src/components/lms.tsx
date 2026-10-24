import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export function StatusBadge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  const tones: Record<Tone, string> = {
    neutral: "bg-muted text-muted-foreground border-border",
    info: "bg-info-soft text-info border-info/30",
    success: "bg-success-soft text-success border-success/30",
    warning: "bg-warning-soft text-warning border-warning/30",
    danger: "bg-destructive/10 text-destructive border-destructive/30",
  };
  const dot: Record<Tone, string> = {
    neutral: "bg-muted-foreground",
    info: "bg-info",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", dot[tone])} />
      {children}
    </span>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
      {description && <p className="mt-1.5 text-base text-muted-foreground">{description}</p>}
    </header>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-xl border border-border bg-card p-5 shadow-soft", className)}>{children}</section>;
}

export function EmptyState({ title, reason }: { title: string; reason: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
      <StatusBadge tone="neutral">준비 중</StatusBadge>
      <p className="mt-3 text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{reason}</p>
    </div>
  );
}

export function Spinner({ label = "불러오는 중" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 p-6 text-muted-foreground">
      <span aria-hidden className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
      {label}…
    </div>
  );
}
