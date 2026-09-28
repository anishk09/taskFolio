"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, RefreshCw, X } from "lucide-react";
import { pushVaultToCloud, regenerateSyncKey } from "@/store/useTaskStore";

export function SyncDeviceModal({ syncKey, onClose }: { syncKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);

  // The debounced auto-sync in the store only fires on a state *change*, so
  // a device that hasn't mutated anything since generating its syncKey would
  // otherwise never have a vault record to scan into. Push immediately the
  // moment the user expresses intent to sync, so the QR is always scannable.
  useEffect(() => {
    pushVaultToCloud();
  }, []);
  const origin = typeof window !== "undefined" ? window.location.origin : "https://taskfol.io";
  const syncUrl = `${origin}/s/${syncKey}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(syncUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard access denied — the link is still visible for manual copy
    }
  }

  async function handleReset() {
    if (!window.confirm("Reset your sync key? Any device using the old QR code or link will lose access.")) {
      return;
    }
    setResetting(true);
    await regenerateSyncKey();
    setResetting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="rijks-card relative flex w-full max-w-sm flex-col items-center gap-4 p-7 text-center"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1.5 text-zinc-500 hover:bg-black/5 hover:text-zinc-900"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="font-sans text-lg font-bold tracking-tight text-zinc-900">Sync to Mobile</h2>
        <p className="text-xs text-zinc-600">
          Scan with your phone&apos;s camera to bring your courses, tasks, and to-dos to another device.
        </p>

        <div className="rounded-2xl border border-[#D9B454]/30 bg-white p-4 shadow-[0_8px_24px_rgba(217,180,84,0.18)]">
          <QRCodeSVG value={syncUrl} size={176} fgColor="#1a1b22" bgColor="#ffffff" level="M" />
        </div>

        <button
          onClick={handleCopy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#8B7EC8] px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(139,126,200,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#7A6CB8]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Link Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy Link
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 transition-colors hover:text-[#DC2626] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${resetting ? "animate-spin" : ""}`} />
          {resetting ? "Resetting…" : "Reset Sync Key"}
        </button>
      </div>
    </div>
  );
}
