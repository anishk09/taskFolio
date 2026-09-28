import test from "node:test";
import assert from "node:assert/strict";
import { meetingsOnDay } from "./meetings";
import type { Meeting } from "@/types";

const m = (id: string, date: string, start: string, repeatsWeekly = false): Meeting => ({
  id,
  title: id,
  date,
  start,
  repeatsWeekly,
});

test("one-off meetings only match their exact date", () => {
  const list = [m("a", "2026-03-04", "09:00")];
  assert.equal(meetingsOnDay(list, new Date(2026, 2, 4)).length, 1);
  assert.equal(meetingsOnDay(list, new Date(2026, 2, 11)).length, 0);
});

test("weekly meetings match the same weekday on/after the start date, never before", () => {
  const list = [m("w", "2026-03-04", "09:00", true)]; // a Wednesday
  assert.equal(meetingsOnDay(list, new Date(2026, 2, 11)).length, 1); // next Wed
  assert.equal(meetingsOnDay(list, new Date(2026, 2, 5)).length, 0); // Thu
  assert.equal(meetingsOnDay(list, new Date(2026, 1, 25)).length, 0); // Wed before start
});

test("results are sorted by start time", () => {
  const list = [m("late", "2026-03-04", "15:00"), m("early", "2026-03-04", "08:30")];
  assert.deepEqual(meetingsOnDay(list, new Date(2026, 2, 4)).map((x) => x.id), ["early", "late"]);
});
