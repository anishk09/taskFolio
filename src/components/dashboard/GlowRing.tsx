"use client";

import { useId } from "react";
import { PALETTE } from "@/lib/palette";

const SIZE = 96;
const RADIUS = 40;
const CIRC = 2 * Math.PI * RADIUS;
const RING_TRANSITION = "stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)";

export function GlowRing({
  pct,
  label,
  sublabel,
}: {
  pct: number;
  label?: string;
  sublabel?: string;
}) {
  const uid = useId();
  const glowGradientId = `${uid}-glow`;
  const mainGradientId = `${uid}-main`;
  const clampedPct = Math.max(0, Math.min(1, pct));
  const offset = CIRC * (1 - clampedPct);

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 -rotate-90 opacity-70 blur-md"
      >
        <defs>
          <linearGradient id={glowGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={PALETTE.lavender} />
            <stop offset="100%" stopColor={PALETTE.periwinkle} />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={`url(#${glowGradientId})`}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          style={{ strokeDashoffset: offset, transition: RING_TRANSITION }}
        />
      </svg>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 -rotate-90">
        <defs>
          <linearGradient id={mainGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={PALETTE.lavender} />
            <stop offset="100%" stopColor={PALETTE.periwinkle} />
          </linearGradient>
        </defs>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth={6} />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={`url(#${mainGradientId})`}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          style={{ strokeDashoffset: offset, transition: RING_TRANSITION }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold tabular-nums text-zinc-900">
          {label ?? `${Math.round(clampedPct * 100)}%`}
        </span>
        {sublabel && <span className="text-[9px] uppercase tracking-wide text-zinc-600">{sublabel}</span>}
      </div>
    </div>
  );
}
