import { useTaskStore } from "@/store/useTaskStore";
import { ACCENT_PRESETS } from "@/lib/palette";

export type ParsedCanvasEvent = {
  title: string;
  courseCode: string | null;
  courseName: string | null;
  canvasCourseId: string | null;
  dueDate: string; // ISO
};

export type DetectedCourseGroup = {
  key: string; // canvasCourseId when present, else courseCode
  code: string;
  name: string;
  canvasCourseId: string | null;
  events: ParsedCanvasEvent[];
};

// Canvas is institution-hosted (rutgers.instructure.com, canvas.<school>.edu,
// etc.) but the feed format itself — VEVENT/SUMMARY/trailing "[...]" context
// tag, "course_<id>" in the URL — is the same product across every
// Instructure customer. Nothing here is Rutgers-specific; the fetch route
// accepts any http(s)/webcal URL, and these tag patterns are generic
// university numbering conventions, not one school's scheme.
//
// Confirmed against a real feed: every VEVENT's URL carries "course_<numeric
// id>", Canvas's own stable course identifier — exact and safe to match
// re-syncs against, unlike any text tag.
const CANVAS_COURSE_ID_RE = /course_(\d+)/;

// Three tag shapes, tried in order of specificity. Anything that matches
// none of them (a bare word like "FALL" or "DO", a slash-heavy term label)
// is discarded as administrative noise rather than becoming a fake course.
// Every digit run has a trailing (?!\d) so a longer number can't get
// silently truncated to a matching prefix — without it, "[FALL 2026 - ...]"
// matches DEPT_CODE_TAG_RE as code "FALL 202" (the first 3 digits of
// "2026"), which is exactly the administrative-fragment false-positive
// this whole feature exists to avoid.

// "dept:subject:course(:section)" numeric codes — used across many public
// university systems (e.g. "01:220:321:05"), not just one school.
const DEPT_SUBJ_COURSE_TAG_RE = /\[(\d{2}(?!\d):\d{3}(?!\d):\d{3}(?!\d)(?::\d{2}(?!\d))?)\s*([^\]]*)\]/;
// "LETTERS DIGITS" codes — the most common convention overall (e.g. "CS
// 211", "ECON 321").
const LETTER_CODE_TAG_RE = /\[([A-Z]{2,4}\s*\d{3}(?!\d))\s*([^\]]*)\]/;
// Anything else that still looks like a course reference rather than a bare
// term/section label — requires a number that isn't a plain calendar year
// and isn't attached to a season word, so institutions with less common
// tag formats aren't forced through the two structured patterns above.
const LOOSE_TAG_RE = /\[([A-Za-z0-9][A-Za-z0-9\s:&/.,'-]*)\]/;
const TERM_LABEL_RE = /\b(fall|spring|summer|winter)\b|\b(19|20)\d{2}\b/i;

// Google Classroom / Google Calendar ICS exports lead each event with the
// class name in brackets — "[AP Biology] Lab Report 2" — rather than
// Canvas's trailing "[...]" context tag. Anchored to the very start of the
// string so it can never collide with a Canvas-style suffix tag (whose
// assignment title always comes first). No digit requirement: class names
// are often plain text with no course number at all.
const GOOGLE_CLASSROOM_LEADING_TAG_RE = /^\[([^\]]+)\]/;

function extractCourseTag(summary: string): { code: string; title: string; matchedText: string } | null {
  let m = summary.match(GOOGLE_CLASSROOM_LEADING_TAG_RE);
  if (m) {
    const name = m[1].trim();
    return { code: name, title: name, matchedText: m[0] };
  }

  m = summary.match(DEPT_SUBJ_COURSE_TAG_RE);
  if (m) return { code: m[1], title: m[2].trim(), matchedText: m[0] };

  m = summary.match(LETTER_CODE_TAG_RE);
  if (m) return { code: m[1].replace(/\s+/g, " ").trim(), title: m[2].trim(), matchedText: m[0] };

  m = summary.match(LOOSE_TAG_RE);
  if (m && /\d/.test(m[1]) && !TERM_LABEL_RE.test(m[1])) {
    return { code: m[1].trim(), title: "", matchedText: m[0] };
  }

  return null;
}

const EXAM_TITLE_RE = /\b(exam|midterm|final|quiz)\b/i;
export function isExamTitle(title: string): boolean {
  return EXAM_TITLE_RE.test(title);
}

// Routine recurring events that would otherwise flood the Priority Queue
// without representing real graded work.
const NOISE_TITLE_RE = /\b(office hour|ta hour|advising|drop-in)\b/i;
export function isNoiseTitle(title: string): boolean {
  return NOISE_TITLE_RE.test(title);
}

function unfold(ics: string): string[] {
  const rawLines = ics.split(/\r\n|\n|\r/);
  const lines: string[] = [];
  for (const line of rawLines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }
  return lines;
}

function getField(block: string[], name: string): string | null {
  for (const line of block) {
    if (line.startsWith(`${name}:`)) return line.slice(name.length + 1).trim();
    if (line.startsWith(`${name};`)) {
      const idx = line.indexOf(":");
      if (idx !== -1) return line.slice(idx + 1).trim();
    }
  }
  return null;
}

function parseIcsDate(value: string): string | null {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h = "00", mi = "00", s = "00"] = m;
  const iso = `${y}-${mo}-${d}T${h}:${mi}:${s}${value.endsWith("Z") ? "Z" : ""}`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function parseIcs(icsText: string): ParsedCanvasEvent[] {
  const lines = unfold(icsText);
  const events: ParsedCanvasEvent[] = [];
  let block: string[] | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      block = [];
      continue;
    }
    if (line === "END:VEVENT") {
      if (block) {
        const summary = getField(block, "SUMMARY");
        const dueRaw = getField(block, "DTEND") ?? getField(block, "DTSTART");
        const dueDate = dueRaw ? parseIcsDate(dueRaw) : null;
        if (summary && dueDate) {
          const tag = extractCourseTag(summary);
          const title = tag ? summary.replace(tag.matchedText, "").trim() : summary.trim();
          if (title && !isNoiseTitle(title)) {
            const url = getField(block, "URL");
            const idMatch = url?.match(CANVAS_COURSE_ID_RE);
            events.push({
              title,
              courseCode: tag?.code ?? null,
              courseName: tag ? tag.title || tag.code : null,
              canvasCourseId: idMatch ? idMatch[1] : null,
              dueDate,
            });
          }
        }
      }
      block = null;
      continue;
    }
    if (block) block.push(line);
  }

  return events;
}

// Groups parsed events by detected course (keyed on Canvas's numeric id
// when available, else the extracted code) so the import modal can show
// one row per real course with an item count, instead of a flat list.
// Events with no recognizable course tag are left out — there's nothing
// sensible to file them under.
export function groupByCourse(events: ParsedCanvasEvent[]): DetectedCourseGroup[] {
  const groups = new Map<string, DetectedCourseGroup>();
  for (const event of events) {
    if (!event.courseCode) continue;
    const key = event.canvasCourseId ?? event.courseCode;
    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        code: event.courseCode,
        name: event.courseName ?? event.courseCode,
        canvasCourseId: event.canvasCourseId,
        events: [],
      };
      groups.set(key, group);
    }
    group.events.push(event);
  }
  return [...groups.values()].sort((a, b) => a.code.localeCompare(b.code));
}

export async function fetchAndParseCanvasFeed(url: string): Promise<ParsedCanvasEvent[]> {
  const res = await fetch(`/api/sync-canvas?url=${encodeURIComponent(url)}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Import failed (${res.status})`);
  }
  const text = await res.text();
  return parseIcs(text);
}

// Ingests only the given groups (the ones the student checked in the import
// modal) — resolving each to an existing course by Canvas id/code or
// creating one with a random accent, then routing every event to an Exam
// or a flat-5%-weight Assignment per isExamTitle.
export function ingestSelectedGroups(groups: DetectedCourseGroup[]): { imported: number; skipped: number } {
  const { addCourse, addAssignment, addExam } = useTaskStore.getState();
  let imported = 0;
  let skipped = 0;

  for (const group of groups) {
    let courses = useTaskStore.getState().courses;
    let course =
      (group.canvasCourseId && courses.find((c) => c.canvasCourseId === group.canvasCourseId)) ||
      courses.find((c) => c.code.toUpperCase() === group.code.toUpperCase());

    if (!course) {
      const hex = ACCENT_PRESETS[Math.floor(Math.random() * ACCENT_PRESETS.length)].hex;
      addCourse({
        code: group.code,
        name: group.name,
        professor: "",
        color: hex,
        lectureSlots: [],
        canvasCourseId: group.canvasCourseId ?? undefined,
      });
      courses = useTaskStore.getState().courses;
      course =
        (group.canvasCourseId && courses.find((c) => c.canvasCourseId === group.canvasCourseId)) ||
        courses.find((c) => c.code.toUpperCase() === group.code.toUpperCase());
    }

    if (!course) {
      skipped += group.events.length;
      continue;
    }
    for (const event of group.events) {
      if (isExamTitle(event.title)) {
        addExam({ courseId: course.id, title: event.title, date: event.dueDate });
      } else {
        addAssignment({ courseId: course.id, title: event.title, dueDate: event.dueDate, weightPct: 5 });
      }
      imported++;
    }
  }

  return { imported, skipped };
}

// Removes every course that was created by a Canvas sync (identified by
// having a canvasCourseId) along with its assignments/exams/study blocks —
// removeCourse already cascades those — leaving manually-entered courses
// untouched.
export function clearImportedCanvasData(): { removed: number } {
  const { courses, removeCourse } = useTaskStore.getState();
  const imported = courses.filter((c) => c.canvasCourseId);
  imported.forEach((c) => removeCourse(c.id));
  return { removed: imported.length };
}

// Removes every course — manual or synced — along with its cascaded
// assignments/exams/study blocks. A full reset, not scoped to Canvas.
export function clearAllCourses(): { removed: number } {
  const { courses, removeCourse } = useTaskStore.getState();
  const all = [...courses];
  all.forEach((c) => removeCourse(c.id));
  return { removed: all.length };
}
