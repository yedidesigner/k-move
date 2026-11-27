import type { ReactNode } from "react";
import { Check, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export function StatusBadge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  const emphasized = tone !== "neutral";
  return (
    <span
      data-status-tone={tone}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold",
        emphasized ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {(tone === "warning" || tone === "danger") && (
        <CircleAlert aria-hidden className="size-3.5 shrink-0" />
      )}
      {tone === "success" && <Check aria-hidden className="size-3.5 shrink-0" />}
      {children}
    </span>
  );
}

export function PageTitle({
  title,
  titleId,
  description,
}: {
  title: string;
  titleId?: string;
  description?: string | undefined;
}) {
  return (
    <div className="@container min-w-0 flex-[1_1_18rem]">
      <div className="flex flex-col gap-y-1.5 @min-[32rem]:flex-row @min-[32rem]:items-baseline @min-[32rem]:gap-x-4">
        <h1 id={titleId} className="shrink-0 text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-3xl break-keep text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">{description}</p>
        )}
      </div>
    </div>
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
  return (
    <section className={cn("border border-border bg-card p-5 sm:p-6", className)}>
      {children}
    </section>
  );
}

export function EmptyState({ title, reason }: { title: string; reason: string }) {
  return (
    <div className="border-y border-border bg-card px-5 py-10 sm:px-6">
      <StatusBadge tone="neutral">준비 중</StatusBadge>
      <p className="mt-3 text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{reason}</p>
    </div>
  );
}

export function Spinner({ label = "불러오는 중" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 p-6 text-muted-foreground">
      <span
        aria-hidden
        className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary"
      />
      {label}…
    </div>
  );
}
