import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Download, ExternalLink, Minus, Plus, RotateCcw } from "lucide-react";
import type { ReviewPin } from "@/lib/instructor-api";
import {
  errorMessage,
  safeAssetUrl,
  workspaceAssetUrl,
  type WorkspaceAsset,
} from "./workspace-utils";

type Props = {
  asset: WorkspaceAsset;
  pins?: ReviewPin[];
  activePin?: string;
  onSelectPin?: (id: string) => void;
  onAddPin?: ((point: { image_id: string; x: number; y: number }) => void) | undefined;
};
export function AssetViewer({ asset, pins = [], activePin, onSelectPin, onAddPin }: Props) {
  const [url, setUrl] = useState<string | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [zoom, setZoom] = useState(1),
    [attempt, setAttempt] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let alive = true;
    setUrl(null);
    setError("");
    setZoom(1);
    if (asset.kind !== "image") return;
    setLoading(true);
    void workspaceAssetUrl(asset)
      .then((v) => {
        if (alive) setUrl(v);
      })
      .catch((e) => {
        if (alive) setError(errorMessage(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [asset.id, attempt]);
  useEffect(() => {
    if (!activePin) return;
    Array.from(viewport.current?.querySelectorAll<HTMLButtonElement>("[data-pin-id]") ?? [])
      .find((node) => node.dataset["pinId"] === activePin)
      ?.scrollIntoView?.({ block: "nearest", inline: "nearest", behavior: "auto" });
  }, [activePin]);
  async function download() {
    setError("");
    try {
      const value = await workspaceAssetUrl(asset, true);
      if (!value) throw new Error("파일 주소를 확인할 수 없습니다.");
      const a = document.createElement("a");
      a.href = value;
      a.download = asset.title;
      a.rel = "noopener noreferrer";
      document.body.append(a);
      a.click();
      a.remove();
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  function place(e: MouseEvent<HTMLImageElement>) {
    if (!onAddPin) return;
    const r = e.currentTarget.getBoundingClientRect();
    onAddPin({
      image_id: asset.id,
      x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)),
    });
  }
  const safeUrl = safeAssetUrl(asset.url);
  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="break-all text-sm font-semibold">{asset.title}</p>
        <span className="iw-badge">
          {asset.kind === "image" ? "이미지" : asset.kind === "link" ? "링크" : "파일"}
        </span>
      </div>
      {error && (
        <p role="alert" className="iw-error">
          {error}{" "}
          {asset.kind === "image" && (
            <button className="underline" onClick={() => setAttempt((v) => v + 1)}>
              다시 불러오기
            </button>
          )}
        </p>
      )}
      {asset.kind === "image" ? (
        <>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <button
              className="iw-button"
              aria-label="이미지 축소"
              disabled={zoom <= 0.5}
              onClick={() => setZoom((v) => Math.max(0.5, v - 0.25))}
            >
              <Minus size={14} />
            </button>
            <span className="min-w-12 text-center text-xs tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              className="iw-button"
              aria-label="이미지 확대"
              disabled={zoom >= 3}
              onClick={() => setZoom((v) => Math.min(3, v + 0.25))}
            >
              <Plus size={14} />
            </button>
            <button className="iw-button" onClick={() => setZoom(1)}>
              <RotateCcw size={14} />
              맞춤
            </button>
            <button className="iw-button ml-auto" onClick={() => void download()}>
              <Download size={14} />
              원본
            </button>
          </div>
          {onAddPin && (
            <p className="iw-muted mb-2">
              이미지 위치를 클릭하거나 ‘중앙에 핀 추가’를 누른 뒤 메모를 작성하세요.
            </p>
          )}
          <div
            className="iw-viewer"
            ref={viewport}
            tabIndex={0}
            aria-label="이미지 보기, 확대 후 가로 세로 스크롤 가능"
          >
            {loading && (
              <p className="p-8 text-center text-sm text-neutral-500">이미지 불러오는 중…</p>
            )}
            {url && (
              <div className="iw-image-stage" style={{ width: `${zoom * 100}%` }}>
                <img
                  src={url}
                  alt={asset.title}
                  onClick={place}
                  onError={() =>
                    setError("이미지를 불러오지 못했습니다. 주소를 새로 요청해 주세요.")
                  }
                  style={{ cursor: onAddPin ? "crosshair" : undefined }}
                />
                {pins
                  .filter((p) => p.image_id === asset.id)
                  .map((p, i) => (
                    <button
                      key={p.id}
                      data-pin-id={p.id}
                      className="iw-pin"
                      aria-label={`위치 피드백 ${i + 1}: ${p.content.slice(0, 60) || "작성 중"}`}
                      aria-pressed={activePin === p.id}
                      style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                      onClick={() => onSelectPin?.(p.id)}
                    >
                      {i + 1}
                    </button>
                  ))}
              </div>
            )}
          </div>
          {onAddPin && (
            <button
              className="iw-button mt-2"
              onClick={() => onAddPin({ image_id: asset.id, x: 0.5, y: 0.5 })}
            >
              중앙에 핀 추가
            </button>
          )}
        </>
      ) : asset.kind === "link" ? (
        <div className="iw-empty">
          <p className="mb-3 break-all">{safeUrl ?? "올바른 링크가 아닙니다."}</p>
          {safeUrl && (
            <a className="iw-button" href={safeUrl} target="_blank" rel="noopener noreferrer">
              원본 링크 열기 <ExternalLink size={14} />
              <span className="sr-only">새 탭</span>
            </a>
          )}
          <p className="iw-muted mt-3">
            링크의 내용과 접근 권한은 원본 서비스에서 변경될 수 있습니다.
          </p>
        </div>
      ) : (
        <div className="iw-empty">
          <p>파일을 다운로드해 확인하세요.</p>
          {asset.file_size != null && (
            <p className="iw-muted">{(asset.file_size / 1024 / 1024).toFixed(2)} MB</p>
          )}
          <button className="iw-button mt-3" onClick={() => void download()}>
            <Download size={14} />
            파일 다운로드
          </button>
        </div>
      )}
    </div>
  );
}
