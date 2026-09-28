import test from "node:test";
import assert from "node:assert/strict";
import { MASTERPIECE_PALETTES, pickRandomPalette, pickRandomPaletteIndex } from "./masterpiecePalettes";

test("pickRandomPalette always returns a palette from the bank", () => {
  for (let i = 0; i < 50; i++) {
    const p = pickRandomPalette();
    assert.ok(MASTERPIECE_PALETTES.includes(p));
  }
});

test("pickRandomPaletteIndex always returns a valid index into the bank", () => {
  for (let i = 0; i < 50; i++) {
    const idx = pickRandomPaletteIndex();
    assert.ok(idx >= 0 && idx < MASTERPIECE_PALETTES.length);
  }
});

test("every palette has 4 colors and an accent", () => {
  for (const p of MASTERPIECE_PALETTES) {
    assert.equal(p.colors.length, 4);
    assert.ok(p.accent.startsWith("#"));
  }
});
