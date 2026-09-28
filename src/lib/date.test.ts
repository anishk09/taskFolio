import test from "node:test";
import assert from "node:assert/strict";
import { formatCountdown, getCountdown, getMonthGridDays, isSameCalendarDay, localDateKey } from "./date";

test("getCountdown splits a future target into days/hours/minutes", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const c = getCountdown("2026-01-03T05:30:00Z", now);
  assert.equal(c.isPast, false);
  assert.equal(c.days, 2);
  assert.equal(c.hours, 5);
  assert.equal(c.minutes, 30);
});

test("getCountdown flags a past target", () => {
  const now = new Date("2026-01-03T00:00:00Z");
  const c = getCountdown("2026-01-01T00:00:00Z", now);
  assert.equal(c.isPast, true);
  assert.equal(c.days, 2);
});

test("formatCountdown picks the coarsest useful unit", () => {
  assert.equal(formatCountdown({ totalMs: 1, days: 3, hours: 2, minutes: 5, isPast: false }), "3d 2h");
  assert.equal(formatCountdown({ totalMs: 1, days: 0, hours: 4, minutes: 5, isPast: false }), "4h 5m");
  assert.equal(formatCountdown({ totalMs: 1, days: 0, hours: 0, minutes: 5, isPast: false }), "5m");
  assert.equal(formatCountdown({ totalMs: -1, days: 0, hours: 0, minutes: 5, isPast: true }), "Past");
});

test("isSameCalendarDay ignores time-of-day and timezone-shifted instants on the same date", () => {
  assert.equal(isSameCalendarDay("2026-03-05T23:59:00", "2026-03-05T00:01:00"), true);
  assert.equal(isSameCalendarDay("2026-03-05T23:59:00", "2026-03-06T00:01:00"), false);
});

test("localDateKey formats using local date parts, zero-padded", () => {
  assert.equal(localDateKey(new Date(2026, 0, 5)), "2026-01-05");
  assert.equal(localDateKey(new Date(2026, 10, 30)), "2026-11-30");
});

test("getMonthGridDays returns a fixed 42-day Sun-Sat grid covering the reference month", () => {
  const grid = getMonthGridDays(new Date("2026-09-15T12:00:00"));
  assert.equal(grid.length, 42);
  assert.equal(grid[0].getDay(), 0);
  assert.equal(grid[41].getDay(), 6);
  const firstOfMonth = grid.find((d) => d.getDate() === 1 && d.getMonth() === 8);
  assert.ok(firstOfMonth, "grid must contain Sept 1");
});
