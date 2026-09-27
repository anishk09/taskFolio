import test from "node:test";
import assert from "node:assert/strict";
import { groupByCourse, isExamTitle, isNoiseTitle, parseIcs } from "./canvasSync";

function vevent(lines: string[]): string {
  return ["BEGIN:VEVENT", ...lines, "END:VEVENT"].join("\r\n");
}

test("parseIcs recognizes a Rutgers-style [dept:subj:course:section] tag", () => {
  const ics = vevent([
    "SUMMARY:Problem Set 3 [01:220:321:05 INTERMED MACRO ANALS]",
    "DTSTART:20261005T235900Z",
    "URL;VALUE=URI:https://school.instructure.com/calendar?include_contexts=course_405600#a",
  ]);
  const [event] = parseIcs(ics);
  assert.equal(event.title, "Problem Set 3");
  assert.equal(event.courseCode, "01:220:321:05");
  assert.equal(event.courseName, "INTERMED MACRO ANALS");
  assert.equal(event.canvasCourseId, "405600");
});

test("parseIcs recognizes a standard [LETTERS DIGITS] tag", () => {
  const ics = vevent(["SUMMARY:Reading Response [ECON 321 Intermediate Macro]", "DTSTART:20261005T235900Z"]);
  const [event] = parseIcs(ics);
  assert.equal(event.title, "Reading Response");
  assert.equal(event.courseCode, "ECON 321");
  assert.equal(event.courseName, "Intermediate Macro");
});

test("parseIcs discards administrative fragments lacking course numbering", () => {
  const ics = [
    vevent(["SUMMARY:Acknowledge compliance module [DO]", "DTSTART:20261005T235900Z"]),
    vevent(["SUMMARY:Term overview [FALL 2026 - GRAPH DESIGN 90/91/92/93]", "DTSTART:20261005T235900Z"]),
  ].join("\r\n");
  const events = parseIcs(ics);
  assert.equal(events.length, 2);
  assert.ok(events.every((e) => e.courseCode === null));
});

test("parseIcs falls back to a loose tag for non-standard institution formats", () => {
  const ics = vevent(["SUMMARY:Reading 4 [CS Fundamentals II - Section 4]", "DTSTART:20261005T235900Z"]);
  const [event] = parseIcs(ics);
  assert.equal(event.title, "Reading 4");
  assert.equal(event.courseCode, "CS Fundamentals II - Section 4");
});

test("parseIcs still rejects a term/year label even through the broadened loose tag", () => {
  const ics = vevent(["SUMMARY:Syllabus [Spring 2027]", "DTSTART:20261005T235900Z"]);
  const [event] = parseIcs(ics);
  assert.equal(event.courseCode, null);
});

test("parseIcs drops office-hour style noise events entirely", () => {
  const ics = vevent(["SUMMARY:TA Office Hour [01:220:321:05 INTERMED MACRO ANALS]", "DTSTART:20261005T235900Z"]);
  assert.equal(parseIcs(ics).length, 0);
});

test("groupByCourse buckets events by canvas id and counts them", () => {
  const ics = [
    vevent([
      "SUMMARY:Problem Set 1 [01:220:321:05 INTERMED MACRO ANALS]",
      "DTSTART:20261005T235900Z",
      "URL;VALUE=URI:https://x/calendar?include_contexts=course_405600",
    ]),
    vevent([
      "SUMMARY:Problem Set 2 [01:220:321:05 INTERMED MACRO ANALS]",
      "DTSTART:20261012T235900Z",
      "URL;VALUE=URI:https://x/calendar?include_contexts=course_405600",
    ]),
    vevent(["SUMMARY:Reading Response [ECON 321 Intermediate Macro]", "DTSTART:20261005T235900Z"]),
  ].join("\r\n");
  const groups = groupByCourse(parseIcs(ics));
  assert.equal(groups.length, 2);
  const rutgers = groups.find((g) => g.key === "405600");
  assert.equal(rutgers?.events.length, 2);
  const econ = groups.find((g) => g.code === "ECON 321");
  assert.equal(econ?.events.length, 1);
});

test("isExamTitle matches exam/midterm/final/quiz as whole words, case-insensitively", () => {
  assert.equal(isExamTitle("Midterm Exam"), true);
  assert.equal(isExamTitle("Quiz > Unit 0: Getting Started"), true);
  assert.equal(isExamTitle("Problem Set 3"), false);
  assert.equal(isExamTitle("Examine the source code"), false);
});

test("isNoiseTitle matches office-hour style recurring events", () => {
  assert.equal(isNoiseTitle("TA Office Hour"), true);
  assert.equal(isNoiseTitle("Drop-in advising"), true);
  assert.equal(isNoiseTitle("Problem Set 3"), false);
});
