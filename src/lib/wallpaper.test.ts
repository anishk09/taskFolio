import test from "node:test";
import assert from "node:assert/strict";
import { computeScaledDimensions } from "./wallpaper";

test("computeScaledDimensions downscales an oversized landscape image", () => {
  const { width, height } = computeScaledDimensions(4000, 3000, 1920);
  assert.equal(width, 1920);
  assert.equal(height, 1440);
});

test("computeScaledDimensions downscales an oversized portrait image", () => {
  const { width, height } = computeScaledDimensions(3000, 4000, 1920);
  assert.equal(width, 1440);
  assert.equal(height, 1920);
});

test("computeScaledDimensions leaves an already-small image untouched", () => {
  const { width, height } = computeScaledDimensions(800, 600, 1920);
  assert.equal(width, 800);
  assert.equal(height, 600);
});
