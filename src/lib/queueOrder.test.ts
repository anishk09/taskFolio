import test from "node:test";
import assert from "node:assert/strict";
import { mergeSubsetOrder, sortPending } from "./queueOrder";
import type { Assignment } from "@/types";

const NOW = new Date("2026-01-01T00:00:00Z");
function a(id: string, daysOut: number, weightPct: number): Assignment {
  return {
    id,
    courseId: "c",
    title: id,
    dueDate: new Date(NOW.getTime() + daysOut * 86_400_000).toISOString(),
    weightPct,
    status: "todo",
  };
}

test("sortPending with no manual order sorts by priority score", () => {
  const list = [a("low", 20, 5), a("hot", 1, 30), a("mid", 6, 10)];
  assert.deepEqual(sortPending(list, null, NOW).map((x) => x.id), ["hot", "mid", "low"]);
});

test("sortPending honors a manual order over priority", () => {
  const list = [a("low", 20, 5), a("hot", 1, 30), a("mid", 6, 10)];
  assert.deepEqual(sortPending(list, ["low", "mid", "hot"], NOW).map((x) => x.id), ["low", "mid", "hot"]);
});

test("sortPending floats unplaced items to the top and ignores stale ids", () => {
  const list = [a("low", 20, 5), a("hot", 1, 30), a("fresh", 2, 20)];
  const order = ["gone", "low", "hot"];
  assert.deepEqual(sortPending(list, order, NOW).map((x) => x.id), ["fresh", "low", "hot"]);
});

test("mergeSubsetOrder puts a reordered subset back into its own slots", () => {
  const full = ["a", "b", "c", "d", "e"];
  // b, d, e are visible (filtered); user drags e to the front of that subset
  assert.deepEqual(mergeSubsetOrder(full, ["e", "b", "d"]), ["a", "e", "c", "b", "d"]);
});
