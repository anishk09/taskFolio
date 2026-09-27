import type { Assignment } from "@/types";

export function daysRemaining(dueDate: string, now: Date = new Date()): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return (new Date(dueDate).getTime() - now.getTime()) / msPerDay;
}

// ponytail: naive tiered heuristic (weight * urgency tier), no effort/dependency
// modeling. Upgrade to a continuous decay curve if tiers feel too coarse.
export function urgencyMultiplier(days: number): number {
  if (days < 0) return 5;
  if (days <= 2) return 4;
  if (days <= 7) return 2.5;
  if (days <= 14) return 1.5;
  return 1;
}

export function priorityScore(
  assignment: Pick<Assignment, "dueDate" | "weightPct">,
  now: Date = new Date()
): number {
  return assignment.weightPct * urgencyMultiplier(daysRemaining(assignment.dueDate, now));
}
