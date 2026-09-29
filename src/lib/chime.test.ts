import test from "node:test";
import assert from "node:assert/strict";
import { comboTransposeRatio, pruneAndCheckBurst } from "./chime";

test("comboTransposeRatio is 1 (no change) at level 0", () => {
  assert.equal(comboTransposeRatio(0), 1);
});

test("comboTransposeRatio rises a whole step (2 semitones) per level", () => {
  const oneStep = 2 ** (2 / 12);
  assert.ok(Math.abs(comboTransposeRatio(1) - oneStep) < 1e-9);
  assert.ok(Math.abs(comboTransposeRatio(2) - oneStep ** 2) < 1e-9);
});

test("comboTransposeRatio caps out instead of climbing forever", () => {
  const capped = comboTransposeRatio(8);
  assert.equal(comboTransposeRatio(9), capped);
  assert.equal(comboTransposeRatio(100), capped);
});

test("comboTransposeRatio never goes below 1 for a negative level", () => {
  assert.equal(comboTransposeRatio(-5), 1);
});

test("pruneAndCheckBurst is not a burst below the minimum count", () => {
  const r1 = pruneAndCheckBurst([], 0, 20_000, 3);
  assert.equal(r1.isBurst, false);
  const r2 = pruneAndCheckBurst(r1.timestamps, 1000, 20_000, 3);
  assert.equal(r2.isBurst, false);
});

test("pruneAndCheckBurst becomes a burst once the minimum count is reached within the window", () => {
  let state = pruneAndCheckBurst([], 0, 20_000, 3);
  state = pruneAndCheckBurst(state.timestamps, 1000, 20_000, 3);
  state = pruneAndCheckBurst(state.timestamps, 2000, 20_000, 3);
  assert.equal(state.isBurst, true);
});

test("pruneAndCheckBurst drops entries older than the window, so a slow trickle never bursts", () => {
  let state = pruneAndCheckBurst([], 0, 20_000, 3);
  state = pruneAndCheckBurst(state.timestamps, 25_000, 20_000, 3); // first entry now outside the window
  state = pruneAndCheckBurst(state.timestamps, 26_000, 20_000, 3);
  assert.equal(state.isBurst, false);
  assert.equal(state.timestamps.length, 2);
});
