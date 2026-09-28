import test from "node:test";
import assert from "node:assert/strict";
import { groupByCourse, ingestSelectedGroups, isExamTitle, isNoiseTitle, parseIcs } from "./canvasSync";
import { useTaskStore } from "@/store/useTaskStore";

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

test("parseIcs recognizes a Google Classroom-style leading [Course Name] tag", () => {
  const ics = vevent(["SUMMARY:[AP Biology] Lab Report 2", "DTSTART:20261005T235900Z"]);
  const [event] = parseIcs(ics);
  assert.equal(event.title, "Lab Report 2");
  assert.equal(event.courseCode, "AP Biology");
  assert.equal(event.courseName, "AP Biology");
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

test("ingestSelectedGroups is idempotent: re-importing never resurrects a finished assignment", () => {
  useTaskStore.setState({ courses: [], assignments: [], exams: [] });
  const group = {
    key: "42",
    code: "CS 101",
    name: "Intro",
    canvasCourseId: "42",
    events: [
      { title: "Homework 1", courseCode: "CS 101", courseName: "Intro", canvasCourseId: "42", dueDate: "2026-01-05T23:59:00.000Z" },
      { title: "Midterm", courseCode: "CS 101", courseName: "Intro", canvasCourseId: "42", dueDate: "2026-01-10T15:00:00.000Z" },
    ],
  };

  const first = ingestSelectedGroups([group]);
  assert.equal(first.imported, 2);

  const { assignments, toggleAssignmentDone } = useTaskStore.getState();
  toggleAssignmentDone(assignments[0].id);

  const second = ingestSelectedGroups([group]);
  assert.equal(second.imported, 0);
  assert.equal(second.skipped, 2);

  const after = useTaskStore.getState();
  assert.equal(after.assignments.length, 1);
  assert.equal(after.assignments[0].status, "done");
  assert.equal(after.exams.length, 1);
});

test("groupByCourse upgrades a code-only name when a later event carries the real course title", () => {
  const ev = (courseName: string) => ({
    title: "x",
    courseCode: "01:198:142",
    courseName,
    canvasCourseId: "7",
    dueDate: "2026-01-05T00:00:00.000Z",
  });
  // parseIcs falls back to the code when a tag has no title text
  const [group] = groupByCourse([ev("01:198:142"), ev("INTRO COMPUTER SCI")]);
  assert.equal(group.name, "INTRO COMPUTER SCI");
});

test("re-importing heals an existing course still named after its own code", () => {
  useTaskStore.setState({ courses: [], assignments: [], exams: [] });
  const mk = (name: string) => ({
    key: "9",
    code: "37:575:100",
    name,
    canvasCourseId: "9",
    events: [{ title: "Quiz 1", courseCode: "37:575:100", courseName: name, canvasCourseId: "9", dueDate: "2026-02-01T00:00:00.000Z" }],
  });
  ingestSelectedGroups([mk("37:575:100")]);
  assert.equal(useTaskStore.getState().courses[0].name, "37:575:100");
  ingestSelectedGroups([mk("LABOR & EMPLOYMENT")]);
  assert.equal(useTaskStore.getState().courses[0].name, "LABOR & EMPLOYMENT");
});
