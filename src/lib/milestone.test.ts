import test from "node:test";
import assert from "node:assert/strict";
import { isAllTasksCleared } from "./milestone";
import type { Assignment } from "@/types";

const NOW = new Date("2026-10-01T12:00:00.000Z");

function assignment(overrides: Partial<Assignment>): Assignment {
  return {
    id: "a",
    courseId: "c",
    title: "t",
    dueDate: NOW.toISOString(),
    weightPct: 10,
    status: "todo",
    ...overrides,
  };
}

test("isAllTasksCleared is false with no assignments at all (nothing to celebrate)", () => {
  assert.equal(isAllTasksCleared([], NOW), false);
});

test("isAllTasksCleared is false when nothing was completed today, even if all are done", () => {
  const items = [assignment({ status: "done", completedAt: new Date(NOW.getTime() - 30 * 86400000).toISOString() })];
  assert.equal(isAllTasksCleared(items, NOW), false);
});

test("isAllTasksCleared is false when any assignment is still pending, no matter how far out its due date is", () => {
  const items = [
    assignment({ status: "done", completedAt: NOW.toISOString() }),
    assignment({ id: "b", dueDate: new Date(NOW.getTime() + 1000 * 3600000).toISOString(), status: "todo" }),
  ];
  assert.equal(isAllTasksCleared(items, NOW), false);
});

test("isAllTasksCleared is true only when every assignment is done and one finished today", () => {
  const items = [
    assignment({ status: "done", completedAt: new Date(NOW.getTime() - 30 * 86400000).toISOString() }),
    assignment({ id: "b", status: "done", completedAt: NOW.toISOString() }),
  ];
  assert.equal(isAllTasksCleared(items, NOW), true);
});
