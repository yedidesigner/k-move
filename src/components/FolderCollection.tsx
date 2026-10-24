import { ExternalLink } from "lucide-react";
import type { CSSProperties } from "react";

type FolderTone = "yellow" | "sky";

type FolderCollectionProps = {
  title: string;
  rootFolderUrl: string;
  folders: readonly { name: string; url: string }[];
  tone: FolderTone;
  listLabel: string;
};

const FOLDER_COLORS = {
  yellow: { back: "oklch(0.89 0.2 110)", front: "oklch(0.967 0.211 109.77)" },
  sky: { back: "oklch(0.75 0.12 237)", front: "oklch(0.84 0.1 233)" },
} as const;

// Keep the existing image size while halving the space between centered folders.
const FOLDER_GRID_STYLE = {
  "--previous-column-width":
    "calc((100cqw - (var(--folder-columns) - 1) * var(--previous-gap)) / var(--folder-columns))",
  "--folder-size": "min(10.08rem, calc((var(--previous-column-width) - 0.5rem) * 0.84))",
  width: "calc((100% + var(--folder-columns) * var(--folder-size)) / 2)",
} as CSSProperties;

function FolderIllustration({ tone }: { tone: FolderTone }) {
  return (
    <svg
      viewBox="0 0 200 168"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="h-auto w-[var(--folder-size)] max-w-full drop-shadow-sm transition-transform duration-200 motion-safe:group-hover:-translate-y-1 motion-safe:group-focus-visible:-translate-y-1 motion-reduce:transition-none"
    >
      <path
        d="M6 26C6 16 14 8 24 8H57C64 8 67 10 73 14L82 20C86 23 90 24 96 24H176C186 24 194 32 194 42V142C194 152 186 160 176 160H24C14 160 6 152 6 142V26Z"
        fill={FOLDER_COLORS[tone].back}
      />
      <path
        d="M24 38H176C186 38 194 46 194 56V142C194 152 186 160 176 160H24C14 160 6 152 6 142V56C6 46 14 38 24 38Z"
        fill={FOLDER_COLORS[tone].front}
      />
    </svg>
  );
}

export function FolderCollection({
  title,
  rootFolderUrl,
  folders,
  tone,
  listLabel,
}: FolderCollectionProps) {
  return (
    <div className="@container">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-2 sm:mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            폴더를 선택하면 Google Drive로 이동합니다.
          </p>
        </div>
        <a
          href={rootFolderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          전체 폴더
          <ExternalLink aria-hidden="true" className="size-3.5" />
          <span className="sr-only">(새 탭에서 열기)</span>
        </a>
      </header>

      <ul
        aria-label={listLabel}
        style={FOLDER_GRID_STYLE}
        className="grid grid-cols-2 gap-x-2.5 gap-y-3.5 [--folder-columns:2] [--previous-gap:1.25rem] sm:grid-cols-3 sm:gap-x-3.5 sm:gap-y-4.5 sm:[--folder-columns:3] sm:[--previous-gap:1.75rem] lg:grid-cols-4 lg:[--folder-columns:4]"
      >
        {folders.map(({ name, url }) => (
          <li key={url} className="min-w-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col items-center gap-1 px-0.5 py-1 text-foreground outline-offset-4"
            >
              <FolderIllustration tone={tone} />
              <span className="text-sm font-medium group-hover:underline group-focus-visible:underline underline-offset-4 sm:text-base">
                {name}
              </span>
              <span className="sr-only">Google Drive 폴더 (새 탭에서 열기)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
