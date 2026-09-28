// Short, current gen-z brag phrases — the headline flex on the milestone
// share card. Deliberately terse and emoji-free to match "Light Work."
// energy rather than reading as a generic congrats banner.
export const CELEBRATION_PHRASES = [
  "Light Work.",
  "Say Less.",
  "I Cooked.",
  "No Cap, All Done.",
  "Understood The Assignment.",
  "Ate That.",
  "Certified Lock-In.",
  "Big Slay Energy.",
  "Not Me Finishing Everything.",
  "It's Giving Productive.",
  "Ate And Left No Crumbs.",
  "Main Character Energy.",
] as const;

export function pickRandomCelebrationPhraseIndex(): number {
  return Math.floor(Math.random() * CELEBRATION_PHRASES.length);
}

export function pickRandomCelebrationPhrase(): string {
  return CELEBRATION_PHRASES[pickRandomCelebrationPhraseIndex()];
}
