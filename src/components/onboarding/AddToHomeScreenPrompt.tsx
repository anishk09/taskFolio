"use client";

import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
import {
  detectMobilePlatform,
  hasNativeInstallPrompt,
  isStandalone,
  triggerInstallPrompt,
  type MobilePlatform,
} from "@/lib/installPrompt";

const SEEN_KEY = "taskfolio_has_seen_pwa_prompt";

// `trigger` is a counter (not a boolean) so this can re-fire every time
// onboarding closes — including a deliberate "Replay Gallery Tour" — while
// SEEN_KEY still gates it down to showing real UI only once, ever.
type PromptState = { platform: MobilePlatform; canNativeInstall: boolean };

export function AddToHomeScreenPrompt({ trigger }: { trigger: number }) {
  const [prompt, setPrompt] = useState<PromptState | null>(null);

  useEffect(() => {
    if (trigger === 0) return;
    if (localStorage.getItem(SEEN_KEY)) return;
    if (isStandalone()) return;
    const detected = detectMobilePlatform();
    if (!detected) return;
    // Gated one-shot check against browser-only APIs (localStorage, matchMedia,
    // UA) — same pattern as the intro-check effect in page.tsx.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrompt({ platform: detected, canNativeInstall: hasNativeInstallPrompt() });
  }, [trigger]);

  function dismiss() {
    localStorage.setItem(SEEN_KEY, "true");
    setPrompt(null);
  }

  async function handleInstallClick() {
    const outcome = await triggerInstallPrompt();
    if (outcome !== "unavailable") dismiss();
  }

  if (!prompt) return null;
  const { platform, canNativeInstall } = prompt;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 sm:hidden">
      <div className="rijks-card w-full max-w-sm p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="font-sans text-sm font-bold tracking-tight text-zinc-900">
            🏛️ Add taskFolio to Your Home Screen
          </h2>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="shrink-0 rounded-full p-1 text-zinc-500 hover:bg-black/5 hover:text-zinc-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {platform === "ios" && (
          <ol className="flex flex-col gap-2 text-xs text-zinc-700">
            <li className="flex items-center gap-2">
              <Share className="h-4 w-4 shrink-0 text-[#5D4E9E]" />
              Tap the <span className="font-semibold">Share</span> icon in Safari&apos;s toolbar
            </li>
            <li className="flex items-center gap-2">
              <SquarePlus className="h-4 w-4 shrink-0 text-[#5D4E9E]" />
              Scroll down and tap <span className="font-semibold">Add to Home Screen</span>
            </li>
            <li className="flex items-center gap-2">
              <Download className="h-4 w-4 shrink-0 text-[#5D4E9E]" />
              Tap <span className="font-semibold">Add</span> in the top right
            </li>
          </ol>
        )}

        {platform === "android" && canNativeInstall && (
          <>
            <p className="mb-3 text-xs text-zinc-600">
              Install taskFolio for faster access and an offline-ready app icon on your home screen.
            </p>
            <button
              onClick={handleInstallClick}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#8B7EC8] px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(139,126,200,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#7A6CB8]"
            >
              <Download className="h-3.5 w-3.5" /> Install App
            </button>
          </>
        )}

        {(platform === "other" || (platform === "android" && !canNativeInstall)) && (
          <p className="text-xs text-zinc-700">
            Open your browser&apos;s menu and look for{" "}
            <span className="font-semibold">Add to Home Screen</span> or{" "}
            <span className="font-semibold">Install App</span>.
          </p>
        )}

        <button onClick={dismiss} className="mt-3 w-full text-center text-[11px] font-semibold text-zinc-500 hover:underline">
          Maybe later
        </button>
      </div>
    </div>
  );
}
