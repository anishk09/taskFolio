import test from "node:test";
import assert from "node:assert/strict";
import { daysRemaining, priorityScore, urgencyMultiplier } from "./priority";

test("urgencyMultiplier tiers", () => {
  assert.equal(urgencyMultiplier(-1), 5);
  assert.equal(urgencyMultiplier(0), 4);
  assert.equal(urgencyMultiplier(2), 4);
  assert.equal(urgencyMultiplier(3), 2.5);
  assert.equal(urgencyMultiplier(7), 2.5);
  assert.equal(urgencyMultiplier(8), 1.5);
  assert.equal(urgencyMultiplier(14), 1.5);
  assert.equal(urgencyMultiplier(15), 1);
});

test("daysRemaining computes fractional days between now and dueDate", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  assert.equal(daysRemaining("2026-01-03T00:00:00Z", now), 2);
  assert.equal(daysRemaining("2025-12-31T00:00:00Z", now), -1);
});

test("priorityScore weights urgency by grade weight", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const dueTomorrow = { dueDate: "2026-01-02T00:00:00Z", weightPct: 20 };
  const dueInAMonth = { dueDate: "2026-02-01T00:00:00Z", weightPct: 20 };
  assert.ok(priorityScore(dueTomorrow, now) > priorityScore(dueInAMonth, now));
});
