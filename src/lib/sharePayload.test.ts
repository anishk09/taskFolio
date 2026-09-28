import test from "node:test";
import assert from "node:assert/strict";
import { decodeSharePayload, encodeSharePayload, type SharedCoursePayload } from "./sharePayload";

const SAMPLE: SharedCoursePayload = {
  course: { code: "CS 3510", name: "Intermediate Algorithms", color: "#1B3B6F" },
  assignments: [{ title: "Problem Set 1", dueDate: "2026-10-01T00:00:00.000Z", weightPct: 10 }],
  exams: [{ title: "Midterm", date: "2026-10-15T00:00:00.000Z" }],
};

test("encodeSharePayload/decodeSharePayload round-trips a course payload", () => {
  const encoded = encodeSharePayload(SAMPLE);
  assert.equal(typeof encoded, "string");
  assert.ok(!/[+/=]/.test(encoded), "must be URL-safe (no +, /, =)");
  const decoded = decodeSharePayload(encoded);
  assert.deepEqual(decoded, SAMPLE);
});

test("decodeSharePayload returns null for garbage input", () => {
  assert.equal(decodeSharePayload("not-a-valid-payload!!!"), null);
});
