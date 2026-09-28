import test from "node:test";
import assert from "node:assert/strict";
import { CELEBRATION_PHRASES, pickRandomCelebrationPhrase, pickRandomCelebrationPhraseIndex } from "./celebrationPhrases";

test("pickRandomCelebrationPhrase always returns a phrase from the bank", () => {
  for (let i = 0; i < 50; i++) {
    assert.ok((CELEBRATION_PHRASES as readonly string[]).includes(pickRandomCelebrationPhrase()));
  }
});

test("pickRandomCelebrationPhraseIndex always returns a valid index into the bank", () => {
  for (let i = 0; i < 50; i++) {
    const idx = pickRandomCelebrationPhraseIndex();
    assert.ok(idx >= 0 && idx < CELEBRATION_PHRASES.length);
  }
});

test("every phrase is a non-empty string", () => {
  for (const phrase of CELEBRATION_PHRASES) {
    assert.ok(phrase.length > 0);
  }
});
