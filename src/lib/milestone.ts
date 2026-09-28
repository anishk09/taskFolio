import type { Assignment } from "@/types";

// Genuine "all caught up": every assignment (not just what's due soon) is
// done, AND at least one was completed today. The completed-today gate
// keeps this a one-day celebration tied to actually finishing the last
// task, rather than a status that just sits true forever once idle — and
// requiring every assignment (not only the next-48h window) means the
// popup can't be triggered while real work is still outstanding.
export function isAllTasksCleared(assignments: Assignment[], now: Date = new Date()): boolean {
  if (assignments.length === 0) return false;
  const allDone = assignments.every((a) => a.status === "done");

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const completedToday = assignments.some(
    (a) => a.status === "done" && a.completedAt && new Date(a.completedAt).getTime() >= startOfToday
  );

  return allDone && completedToday;
}
