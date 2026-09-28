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

// Local calendar date as "YYYY-MM-DD" — not toISOString(), which is UTC and
// would flip to the next/previous day for part of the day in any non-UTC
// timezone. Used as a stable per-day key (e.g. milestone streak tracking).
export function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "YYYY-MM-DDTHH:mm" in local time — the format a <input type="datetime-local">
// needs as its value. Assignment due dates are stored as either ISO instants
// (Canvas imports) or raw local strings (manual entry), so this normalizes both.
export function toLocalInputValue(value: string): string {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${localDateKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function isSameCalendarDay(a: string | Date, b: string | Date): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

// A fixed 6-week (42-day) grid for the reference date's month, including the
// leading/trailing days from adjacent months needed to fill a Sun-Sat grid.
// Fixed at 42 cells (rather than 5 or 6 rows depending on the month) so the
// calendar's height never jumps when switching months.
export function getMonthGridDays(reference: Date): Date[] {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}
