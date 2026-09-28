export type LetterGrade = "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D+" | "D" | "F";

const GRADE_SCALE: { letter: LetterGrade; minPct: number; points: number }[] = [
  { letter: "A", minPct: 93, points: 4.0 },
  { letter: "A-", minPct: 90, points: 3.7 },
  { letter: "B+", minPct: 87, points: 3.3 },
  { letter: "B", minPct: 83, points: 3.0 },
  { letter: "B-", minPct: 80, points: 2.7 },
  { letter: "C+", minPct: 77, points: 2.3 },
  { letter: "C", minPct: 73, points: 2.0 },
  { letter: "C-", minPct: 70, points: 1.7 },
  { letter: "D+", minPct: 67, points: 1.3 },
  { letter: "D", minPct: 63, points: 1.0 },
  { letter: "F", minPct: 0, points: 0.0 },
];

export const LETTER_GRADES: LetterGrade[] = GRADE_SCALE.map((t) => t.letter);

export function pctToGpaPoints(pct: number): number {
  const tier = GRADE_SCALE.find((t) => pct >= t.minPct) ?? GRADE_SCALE[GRADE_SCALE.length - 1];
  return tier.points;
}

export function letterGradeMinPct(letter: LetterGrade): number {
  return GRADE_SCALE.find((t) => t.letter === letter)?.minPct ?? 0;
}

export type WeightedItem = { weightPct: number; scorePct: number | null };

/** Weighted average (0-100) of only the graded items; null with nothing graded yet. */
export function currentWeightedAverage(items: WeightedItem[]): number | null {
  const graded = items.filter((i): i is WeightedItem & { scorePct: number } => i.scorePct !== null);
  const totalWeight = graded.reduce((sum, i) => sum + i.weightPct, 0);
  if (totalWeight === 0) return null;
  const earned = graded.reduce((sum, i) => sum + i.weightPct * i.scorePct, 0);
  return earned / totalWeight;
}

/**
 * Score (0-100) needed, averaged across every still-ungraded item, to land
 * the course at targetPct overall (weightPct values are assumed to already
 * be percentages of the full course, i.e. sum to ~100). Null when every
 * item is already graded (nothing left to solve for).
 */
export function neededScoreForTarget(items: WeightedItem[], targetPct: number): number | null {
  const remainingWeight = items.filter((i) => i.scorePct === null).reduce((sum, i) => sum + i.weightPct, 0);
  if (remainingWeight <= 0) return null;
  const earnedContribution = items.reduce(
    (sum, i) => sum + (i.scorePct !== null ? (i.weightPct / 100) * i.scorePct : 0),
    0
  );
  return ((targetPct - earnedContribution) * 100) / remainingWeight;
}
