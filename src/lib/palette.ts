export const PALETTE = {
  lavender: "#8B7EC8", // primary accent — buttons, active states, glow
  lavenderHover: "#7A6CB8",
  lavenderText: "#5D4E9E", // deep enough for small text on light glass
  periwinkle: "#6C86D6", // gradient partner for lavender (rings, glows)
  gold: "#D9B454",
  goldBright: "#E8C468",
  lapis: "#2A52A8", // fills / pairs with light text on top
  lapisLight: "#3E6BD1", // border accents readable on dark glass
  glass: "#121418",
  ink: "#0A0B0D",
  paper: "#F5F5F0",
} as const;

// Course accents are picked for contrast against the bright frosted cards
// (checked: 4.7-11:1 vs white), not the light bright hues used for the
// dark-glass passes — those read as near-invisible once the surface went light.
export const ACCENT_PRESETS = [
  { name: "Ultramarine", hex: "#1B3B6F" },
  { name: "Emerald", hex: "#1F6B45" },
  { name: "Violet", hex: "#5B4FA8" },
  { name: "Rose", hex: "#A34B5E" },
];

export function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export type UrgencyZone = "urgent" | "caution" | "safe";

// ponytail: 3-zone scheme (urgent/caution/safe) instead of a finer split —
// one badge tier per assignment is enough signal for planning.
export function urgencyZone(days: number): UrgencyZone {
  if (days <= 2) return "urgent";
  if (days <= 7) return "caution";
  return "safe";
}

export const ZONE_STYLE: Record<UrgencyZone, { bg: string; fg: string }> = {
  urgent: { bg: PALETTE.lavenderText, fg: PALETTE.paper },
  caution: { bg: PALETTE.gold, fg: PALETTE.ink },
  safe: { bg: "#2E7D53", fg: PALETTE.paper },
};
