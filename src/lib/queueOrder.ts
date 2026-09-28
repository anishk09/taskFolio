import type { Assignment } from "@/types";
import { priorityScore } from "./priority";

// Orders pending assignments. With no manual order it's pure priority score.
// With one, the user's ranking wins, but assignments they haven't placed yet
// (newly added, or synced in) float to the top in priority order — an urgent
// new item shouldn't silently land at the bottom of a hand-sorted list.
export function sortPending(pending: Assignment[], queueOrder: string[] | null, now: Date): Assignment[] {
  const byPriority = [...pending].sort((x, y) => priorityScore(y, now) - priorityScore(x, now));
  if (!queueOrder) return byPriority;
  const rank = new Map(queueOrder.map((id, i) => [id, i]));
  const placed = byPriority.filter((a) => rank.has(a.id)).sort((x, y) => rank.get(x.id)! - rank.get(y.id)!);
  const unplaced = byPriority.filter((a) => !rank.has(a.id));
  return [...unplaced, ...placed];
}

// When a filter (course / calendar day) is active the user only sees, and can
// only drag, a subset. Drop the reordered subset back into the slots that
// subset occupied in the full list so hidden items keep their positions.
export function mergeSubsetOrder(fullIds: string[], reorderedSubset: string[]): string[] {
  const inSubset = new Set(reorderedSubset);
  let next = 0;
  return fullIds.map((id) => (inSubset.has(id) ? reorderedSubset[next++] : id));
}
