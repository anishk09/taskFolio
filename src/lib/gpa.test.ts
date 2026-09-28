import test from "node:test";
import assert from "node:assert/strict";
import { currentWeightedAverage, letterGradeMinPct, neededScoreForTarget, pctToGpaPoints } from "./gpa";

test("pctToGpaPoints maps standard boundaries", () => {
  assert.equal(pctToGpaPoints(97), 4.0);
  assert.equal(pctToGpaPoints(93), 4.0);
  assert.equal(pctToGpaPoints(92.9), 3.7);
  assert.equal(pctToGpaPoints(85), 3.0);
  assert.equal(pctToGpaPoints(50), 0.0);
});

test("letterGradeMinPct returns the tier threshold", () => {
  assert.equal(letterGradeMinPct("A"), 93);
  assert.equal(letterGradeMinPct("B+"), 87);
});

test("currentWeightedAverage ignores ungraded items and null with nothing graded", () => {
  assert.equal(currentWeightedAverage([{ weightPct: 10, scorePct: null }]), null);
  const avg = currentWeightedAverage([
    { weightPct: 20, scorePct: 90 },
    { weightPct: 10, scorePct: null },
    { weightPct: 20, scorePct: 80 },
  ]);
  assert.equal(avg, (20 * 90 + 20 * 80) / 40);
});

test("neededScoreForTarget solves for the remaining ungraded weight", () => {
  // 50% weight already earned 100%, 50% weight remaining, target overall 80%.
  const needed = neededScoreForTarget(
    [
      { weightPct: 50, scorePct: 100 },
      { weightPct: 50, scorePct: null },
    ],
    80
  );
  assert.equal(needed, 60);
});

test("neededScoreForTarget is null when nothing remains ungraded", () => {
  assert.equal(neededScoreForTarget([{ weightPct: 100, scorePct: 90 }], 95), null);
});
