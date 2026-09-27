import test from "node:test";
import assert from "node:assert/strict";
import { formatCountdown, getCountdown } from "./date";

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
