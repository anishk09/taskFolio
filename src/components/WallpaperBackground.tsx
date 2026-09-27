"use client";

import { useTaskStore } from "@/store/useTaskStore";

// Sits behind all page content, on top of the body's default Monet
// background (globals.css) — rendering nothing when no custom wallpaper is
// set lets that default show through untouched.
export function WallpaperBackground() {
  const wallpaperDataUrl = useTaskStore((s) => s.wallpaperDataUrl);

  if (!wallpaperDataUrl) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(18, 20, 28, 0.25) 0%, rgba(18, 20, 28, 0.45) 100%), url(${wallpaperDataUrl})`,
      }}
    />
  );
}
