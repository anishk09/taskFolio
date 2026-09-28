"use client";

import { useRef, useState } from "react";
import { BookOpen, CalendarClock, CheckSquare, ClipboardList, RefreshCw, Timer, X } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { DAY_LABELS } from "@/lib/date";
import { ACCENT_PRESETS, PALETTE } from "@/lib/palette";
import {
  clearAllCourses,
  clearImportedCanvasData,
  fetchAndParseCanvasFeed,
  groupByCourse,
  ingestSelectedGroups,
  type DetectedCourseGroup,
} from "@/lib/canvasSync";
import { CanvasImportModal } from "./CanvasImportModal";

type Kind = "course" | "assignment" | "exam" | "studyBlock" | "todo" | "canvasSync";

const KIND_TABS: { kind: Kind; label: string; icon: typeof BookOpen }[] = [
  { kind: "course", label: "Course", icon: BookOpen },
  { kind: "assignment", label: "Assignment", icon: ClipboardList },
  { kind: "exam", label: "Exam", icon: CalendarClock },
  { kind: "studyBlock", label: "Study block", icon: Timer },
  { kind: "todo", label: "To-Do Item", icon: CheckSquare },
  { kind: "canvasSync", label: "Sync Institution", icon: RefreshCw },
];

const DEFAULT_ASSIGNMENT_WEIGHT = 5;

function randomAccent(): string {
  return ACCENT_PRESETS[Math.floor(Math.random() * ACCENT_PRESETS.length)].hex;
}

export function QuickAdd({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [kind, setKind] = useState<Kind>("course");
  const colorInputRef = useRef<HTMLInputElement>(null);
  const courses = useTaskStore((s) => s.courses);
  const addCourse = useTaskStore((s) => s.addCourse);
  const addAssignment = useTaskStore((s) => s.addAssignment);
  const addExam = useTaskStore((s) => s.addExam);
  const addStudyBlock = useTaskStore((s) => s.addStudyBlock);
  const addTodo = useTaskStore((s) => s.addTodo);

  const [syncPlatform, setSyncPlatform] = useState<"canvas" | "classroom">("canvas");
  const [syncUrl, setSyncUrl] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [pendingGroups, setPendingGroups] = useState<DetectedCourseGroup[] | null>(null);

  async function handleSync(e: React.FormEvent) {
    e.preventDefault();
    const url = syncUrl.trim();
    if (!url) return;
    setSyncing(true);
    setSyncStatus(null);
    try {
      const events = await fetchAndParseCanvasFeed(url);
      const groups = groupByCourse(events);
      if (groups.length === 0) {
        setSyncStatus("No recognizable courses found in that feed.");
      } else {
        setPendingGroups(groups);
      }
    } catch (err) {
      setSyncStatus(err instanceof Error ? err.message : "Import failed");
    } finally {
      setSyncing(false);
    }
  }

  function handleConfirmImport(selected: DetectedCourseGroup[]) {
    const { imported, skipped } = ingestSelectedGroups(selected);
    setSyncStatus(`Imported ${imported} item${imported === 1 ? "" : "s"}` + (skipped > 0 ? `, skipped ${skipped}` : ""));
    setPendingGroups(null);
    setSyncUrl("");
  }

  function handleClearImported() {
    const { removed } = clearImportedCanvasData();
    setSyncStatus(
      removed > 0 ? `Cleared ${removed} imported course${removed === 1 ? "" : "s"}.` : "No imported courses to clear."
    );
  }

  function handleClearAllCourses() {
    if (!window.confirm("Delete ALL courses and their assignments/exams/study blocks? This can't be undone.")) {
      return;
    }
    const { removed } = clearAllCourses();
    setSyncStatus(removed > 0 ? `Cleared all ${removed} course${removed === 1 ? "" : "s"}.` : "No courses to clear.");
  }

  return (
    <>
      <div
        className="grid transition-[grid-template-rows] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden" aria-hidden={!open}>
          <div className="rijks-card mt-3 w-full p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-black/10 pb-3">
              <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
                {KIND_TABS.map(({ kind: k, label, icon: Icon }) => (
                  <button
                    key={k}
                    onClick={() => setKind(k)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs uppercase tracking-wide transition-colors ${
                      kind === k
                        ? "border-[#8B7EC8]/35 bg-[#8B7EC8]/15 font-semibold text-[#5D4E9E]"
                        : "border-transparent text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </button>
                ))}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-1.5 text-zinc-600 hover:bg-black/5 hover:text-zinc-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {kind === "course" && (
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  const code = String(f.get("code"));
                  const name = String(f.get("name") || "").trim();
                  const rawColor = String(f.get("color") || "");
                  addCourse({
                    code,
                    name: name || code,
                    professor: String(f.get("professor")),
                    color: !rawColor || rawColor === "#000000" ? randomAccent() : rawColor,
                    lectureSlots: f.get("day")
                      ? [
                          {
                            day: Number(f.get("day")),
                            start: String(f.get("start")),
                            end: String(f.get("end")),
                          },
                        ]
                      : [],
                  });
                  e.currentTarget.reset();
                  onClose();
                }}
              >
                <div className="flex flex-wrap gap-3">
                  <input name="code" required placeholder="Code (CS 3510)" className={`${inputCls} w-36`} />
                  <input name="name" placeholder="Course name (optional)" className={`${inputCls} w-48`} />
                  <input name="professor" placeholder="Professor" className={`${inputCls} w-44`} />
                  <select name="day" defaultValue="" className={`${inputCls} w-36`}>
                    <option value="">No lecture slot</option>
                    {DAY_LABELS.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <input name="start" type="time" className={`${inputCls} w-28`} />
                  <input name="end" type="time" className={`${inputCls} w-28`} />
                  <div className="flex items-center gap-2">
                    <input
                      ref={colorInputRef}
                      name="color"
                      type="color"
                      className="h-9 w-10 shrink-0 rounded-lg border border-white/80 bg-transparent"
                      title="Leave unset for a random accent"
                    />
                    <div className="flex gap-1.5">
                      {ACCENT_PRESETS.map((p) => (
                        <button
                          key={p.hex}
                          type="button"
                          title={p.name}
                          onClick={() => {
                            if (colorInputRef.current) colorInputRef.current.value = p.hex;
                          }}
                          style={{ backgroundColor: p.hex, boxShadow: `0 0 0 1px ${PALETTE.ink}` }}
                          className="h-6 w-6 rounded-full transition-transform hover:scale-110"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className={pillButtonCls}>Add Course</button>
                </div>
              </form>
            )}

            {kind === "assignment" && (
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  const rawWeight = String(f.get("weightPct") || "").trim();
                  const weightPct = rawWeight ? Number(rawWeight) : DEFAULT_ASSIGNMENT_WEIGHT;
                  addAssignment({
                    courseId: String(f.get("courseId")),
                    title: String(f.get("title")),
                    dueDate: String(f.get("dueDate")),
                    weightPct: Number.isFinite(weightPct) ? weightPct : DEFAULT_ASSIGNMENT_WEIGHT,
                  });
                  e.currentTarget.reset();
                  onClose();
                }}
              >
                <div className="flex flex-wrap gap-3">
                  <CourseSelect courses={courses} />
                  <input name="title" required placeholder="Title" className={`${inputCls} w-48`} />
                  <input name="dueDate" type="datetime-local" required className={`${inputCls} w-52`} />
                  <input
                    name="weightPct"
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    placeholder={`% of grade (default ${DEFAULT_ASSIGNMENT_WEIGHT}%)`}
                    className={`${inputCls} w-48`}
                  />
                </div>
                <div className="flex justify-end">
                  <button className={pillButtonCls} disabled={courses.length === 0}>
                    Add Assignment
                  </button>
                </div>
              </form>
            )}

            {kind === "exam" && (
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  addExam({
                    courseId: String(f.get("courseId")),
                    title: String(f.get("title")),
                    date: String(f.get("date")),
                  });
                  e.currentTarget.reset();
                  onClose();
                }}
              >
                <div className="flex flex-wrap gap-3">
                  <CourseSelect courses={courses} />
                  <input name="title" required placeholder="Exam title" className={`${inputCls} w-48`} />
                  <input name="date" type="datetime-local" required className={`${inputCls} w-52`} />
                </div>
                <div className="flex justify-end">
                  <button className={pillButtonCls} disabled={courses.length === 0}>
                    Add Exam
                  </button>
                </div>
              </form>
            )}

            {kind === "studyBlock" && (
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  addStudyBlock({
                    courseId: String(f.get("courseId")),
                    day: Number(f.get("day")),
                    start: String(f.get("start")),
                    end: String(f.get("end")),
                  });
                  e.currentTarget.reset();
                  onClose();
                }}
              >
                <div className="flex flex-wrap gap-3">
                  <CourseSelect courses={courses} />
                  <select name="day" required defaultValue="" className={`${inputCls} w-36`}>
                    <option value="" disabled>
                      Day
                    </option>
                    {DAY_LABELS.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <input name="start" type="time" required className={`${inputCls} w-28`} />
                  <input name="end" type="time" required className={`${inputCls} w-28`} />
                </div>
                <div className="flex justify-end">
                  <button className={pillButtonCls} disabled={courses.length === 0}>
                    Add Study Block
                  </button>
                </div>
              </form>
            )}

            {kind === "todo" && (
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  const title = String(f.get("title") || "").trim();
                  if (!title) return;
                  addTodo(title);
                  e.currentTarget.reset();
                  onClose();
                }}
              >
                <div className="flex flex-wrap gap-3">
                  <input name="title" required placeholder="e.g. Renew gym membership" className={`${inputCls} w-64`} />
                </div>
                <div className="flex justify-end">
                  <button className={pillButtonCls}>Add To-Do</button>
                </div>
              </form>
            )}

            {kind === "canvasSync" && (
              <form className="flex flex-col gap-4" onSubmit={handleSync}>
                <div className="flex gap-1.5">
                  {(["canvas", "classroom"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSyncPlatform(p)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        syncPlatform === p
                          ? "border-[#8B7EC8]/35 bg-[#8B7EC8]/15 text-[#5D4E9E]"
                          : "border-transparent text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      {p === "canvas" ? "Canvas LMS" : "Google Classroom"}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    name="icsUrl"
                    type="url"
                    required
                    value={syncUrl}
                    onChange={(e) => setSyncUrl(e.target.value)}
                    placeholder={
                      syncPlatform === "canvas"
                        ? "webcal://canvas.example.edu/feeds/calendars/....ics"
                        : "https://calendar.google.com/calendar/ical/.../public/basic.ics"
                    }
                    className={`${inputCls} w-96 max-w-full`}
                  />
                  <button className={pillButtonCls} disabled={syncing}>
                    {syncing ? "Fetching…" : "Fetch Courses"}
                  </button>
                </div>
                {syncStatus && <p className="text-xs text-zinc-600">{syncStatus}</p>}
                {syncPlatform === "canvas" ? (
                  <p className="text-xs text-zinc-500">
                    Paste your Canvas calendar feed URL (Account → Settings → Calendar Feed). You&apos;ll get a
                    checklist of detected courses before anything is imported. Office hours and similar recurring
                    noise are filtered out automatically; imported assignments land at a flat{" "}
                    {DEFAULT_ASSIGNMENT_WEIGHT}% weight — edit them afterward if you know the real grade weighting.
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500">
                    In Google Calendar: Settings → Settings for my calendars → pick your Classroom calendar →
                    Integrate calendar → copy the Public or Secret address in iCal format. You&apos;ll get the same
                    checklist before anything is imported; imported assignments land at a flat{" "}
                    {DEFAULT_ASSIGNMENT_WEIGHT}% weight.
                  </p>
                )}
                <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-black/10 pt-3">
                  <div>
                    <button
                      type="button"
                      onClick={handleClearImported}
                      className="text-xs font-semibold text-zinc-500 hover:text-[#DC2626]"
                    >
                      Clear Imported Data
                    </button>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      Removes courses (and their assignments/exams) that came from a Canvas sync. Manually added
                      courses are left untouched.
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleClearAllCourses}
                      className="text-xs font-semibold text-[#DC2626] hover:underline"
                    >
                      Clear All Courses
                    </button>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      Deletes every course — manual or synced — and everything attached to it. Asks to confirm
                      first.
                    </p>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      {pendingGroups && (
        <CanvasImportModal
          groups={pendingGroups}
          onConfirm={handleConfirmImport}
          onCancel={() => setPendingGroups(null)}
        />
      )}
    </>
  );
}

function CourseSelect({ courses }: { courses: { id: string; code: string }[] }) {
  return (
    <select name="courseId" required defaultValue="" className={`${inputCls} w-36`}>
      <option value="" disabled>
        Course
      </option>
      {courses.map((c) => (
        <option key={c.id} value={c.id}>
          {c.code}
        </option>
      ))}
    </select>
  );
}

const inputCls =
  "rounded-xl border border-white/80 bg-white/50 px-3.5 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 transition-all focus:border-[#8B7EC8] focus:bg-white/85 focus:outline-none focus:ring-2 focus:ring-[#8B7EC8]/20";
const pillButtonCls =
  "flex items-center gap-2 rounded-full bg-[#8B7EC8] px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(139,126,200,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#7A6CB8] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";
