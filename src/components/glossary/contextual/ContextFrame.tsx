import type { ReactNode } from "react";
import { LockKeyhole, Signal, Wifi, BatteryFull } from "lucide-react";
import "./context-frame.css";

export function ContextFrame({
  children,
  brand = "STUDIO",
  chrome = "web",
  url,
  className = "",
  label,
}: {
  children: ReactNode;
  brand?: string;
  chrome?: "web" | "mobile" | "workspace" | "document";
  url?: string;
  className?: string;
  label?: string;
}) {
  return (
    <div className={`cx-frame cx-frame-${chrome} ${className}`} aria-label={label}>
      {chrome === "mobile" ? (
        <div className="cx-status-bar" aria-hidden="true">
          <b>9:41</b>
          <span className="cx-device-island" />
          <span>
            <Signal size={14} />
            <Wifi size={14} />
            <BatteryFull size={18} />
          </span>
        </div>
      ) : (
        <div className="cx-browser-bar" aria-hidden="true">
          <span className="cx-window-controls">
            <i />
            <i />
            <i />
          </span>
          <span className="cx-address">
            <LockKeyhole size={10} />
            {url || brand}
          </span>
          <span className="cx-browser-more">···</span>
        </div>
      )}
      <div className="cx-frame-content">{children}</div>
      {chrome === "mobile" && <div className="cx-home-indicator" aria-hidden="true" />}
    </div>
  );
}

export function ContextPhoto({
  asset,
  alt,
  className = "",
}: {
  asset: "forest" | "coast" | "desert";
  alt: string;
  className?: string;
}) {
  const heights = { forest: 499, coast: 500, desert: 563 };
  return (
    <img
      className={`cx-photo ${className}`}
      src={`/glossary/${asset}.jpg`}
      alt={alt}
      loading="lazy"
      decoding="async"
      width="750"
      height={heights[asset]}
    />
  );
}

export function ContextCallout({ children, number = 1 }: { children: ReactNode; number?: number }) {
  return (
    <div className="cx-callout">
      <span className="cx-callout-number" aria-hidden="true">
        {String(number).padStart(2, "0")}
      </span>
      <div>{children}</div>
    </div>
  );
}
