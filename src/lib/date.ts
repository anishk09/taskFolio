const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export type Countdown = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
};

export function getCountdown(target: string, now: Date = new Date()): Countdown {
  const totalMs = new Date(target).getTime() - now.getTime();
  const abs = Math.abs(totalMs);
  return {
    totalMs,
    days: Math.floor(abs / DAY_MS),
    hours: Math.floor((abs % DAY_MS) / HOUR_MS),
    minutes: Math.floor((abs % HOUR_MS) / MINUTE_MS),
    isPast: totalMs < 0,
  };
}

export function formatCountdown(c: Countdown): string {
  if (c.isPast) return "Past";
  if (c.days > 0) return `${c.days}d ${c.hours}h`;
  if (c.hours > 0) return `${c.hours}h ${c.minutes}m`;
  return `${c.minutes}m`;
}

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
