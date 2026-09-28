"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { copyElementToClipboard, downloadElementAsPng } from "@/lib/exportImage";

const DEFAULT_PRIMARY_CLS =
  "rounded-full bg-[#8B7EC8] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(139,126,200,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#7A6CB8]";
const DEFAULT_SECONDARY_CLS =
  "rounded-full border border-white/25 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:bg-white/20";

export function ExportCardModal({
  onClose,
  filename,
  children,
  shimmer = false,
  primaryAction = "download",
  copyLabel = "Copy PNG",
  downloadLabel = "Download PNG",
  primaryClassName = DEFAULT_PRIMARY_CLS,
  secondaryClassName = DEFAULT_SECONDARY_CLS,
}: {
  onClose: () => void;
  filename: string;
  children: React.ReactNode;
  shimmer?: boolean;
  primaryAction?: "copy" | "download";
  copyLabel?: string;
  downloadLabel?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function handleCopy() {
    if (!cardRef.current) return;
    try {
      await copyElementToClipboard(cardRef.current);
      setStatus("Copied to clipboard.");
    } catch {
      setStatus("Couldn't copy — try downloading instead.");
    }
  }

  async function handleDownload() {
    if (!cardRef.current) return;
    try {
      await downloadElementAsPng(cardRef.current, filename);
      setStatus("Downloaded.");
    } catch {
      setStatus("Couldn't generate the image.");
    }
  }

  const copyBtn = (
    <button
      key="copy"
      onClick={handleCopy}
      className={`${primaryAction === "copy" ? primaryClassName : secondaryClassName} ${primaryAction === "copy" && shimmer ? "shimmer-sweep" : ""}`}
    >
      {copyLabel}
    </button>
  );
  const downloadBtn = (
    <button
      key="download"
      onClick={handleDownload}
      className={`${primaryAction === "download" ? primaryClassName : secondaryClassName} ${primaryAction === "download" && shimmer ? "shimmer-sweep" : ""}`}
    >
      {downloadLabel}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-md flex-col items-center gap-4"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="self-end rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>

        <div ref={cardRef} className="w-full">
          {children}
        </div>

        <div className={primaryAction === "copy" ? "flex w-full flex-col items-center gap-2" : "flex items-center gap-3"}>
          {primaryAction === "copy" ? (
            <>
              <div className="w-full">{copyBtn}</div>
              {downloadBtn}
            </>
          ) : (
            <>
              {copyBtn}
              {downloadBtn}
            </>
          )}
        </div>
        {status && <p className="text-xs font-medium text-white/80">{status}</p>}
      </div>
    </div>
  );
}
