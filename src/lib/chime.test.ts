import test from "node:test";
import assert from "node:assert/strict";
import { comboTransposeRatio } from "./chime";

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
