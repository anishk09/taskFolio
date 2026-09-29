"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { getMonthGridDays, isSameCalendarDay } from "@/lib/date";
import { hexToRgba, PALETTE } from "@/lib/palette";

const DAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const CELL_TRANSITION = "transition-all duration-150 ease-[cubic-bezier(0.2,0,0,1)]";

type DayEvent = { title: string; color: string; kind: "assignment" | "exam" };

export function GalleryCalendar({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
}) {
  // Month is the default everywhere; the toggle to switch to week is hidden
  // on mobile (see below), where a 7-wide week row reads too cramped.
  const [viewMode, setViewMode] = useState<"week" | "month">("month");
  const [viewedMonth, setViewedMonth] = useState(() => new Date());
  const courses = useTaskStore((s) => s.courses);
  const assignments = useTaskStore((s) => s.assignments);
  const exams = useTaskStore((s) => s.exams);

  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
  const monthDays = getMonthGridDays(viewedMonth);

  function shiftMonth(delta: number) {
    setViewedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  function eventsFor(day: Date): DayEvent[] {
    const dueAssignments = assignments
      .filter((a) => a.status !== "done" && isSameCalendarDay(a.dueDate, day))
      .map((a) => ({ title: a.title, color: courses.find((c) => c.id === a.courseId)?.color ?? PALETTE.gold, kind: "assignment" as const }));
    const dueExams = exams
      .filter((e) => isSameCalendarDay(e.date, day))
      .map((e) => ({ title: e.title, color: courses.find((c) => c.id === e.courseId)?.color ?? PALETTE.gold, kind: "exam" as const }));
    return [...dueExams, ...dueAssignments];
  }

  function DayCell({ day, compact, dimmed }: { day: Date; compact: boolean; dimmed: boolean }) {
    const isToday = isSameCalendarDay(day, today);
    const isSelected = !!selectedDate && isSameCalendarDay(day, selectedDate);
    const events = eventsFor(day);
    const hasExam = events.some((e) => e.kind === "exam");
    const visibleEvents = events.slice(0, compact ? 1 : 2);
    const overflow = events.length - visibleEvents.length;

    return (
      <button
        type="button"
        onClick={() => onSelectDate(isSelected ? null : day)}
        className={`relative flex min-w-0 flex-col items-start gap-1 overflow-hidden rounded-xl border text-left ${CELL_TRANSITION} hover:-translate-y-0.5 ${
          compact ? "min-h-[64px] px-1 py-1.5 sm:px-2 sm:py-2" : "min-h-[104px] px-2 py-2"
        } ${dimmed ? "opacity-40" : ""} ${
          isSelected
            ? "border-[#8B7EC8]/50 bg-[#8B7EC8]/12"
            : isToday
              ? "border-[#D9B454]/60 bg-[#D9B454]/10"
              : "border-black/10 bg-white/50 hover:bg-white/80"
        }`}
      >
        {hasExam && <span className="pointer-events-none absolute inset-0 rounded-xl bg-rose-400/15 blur-md" aria-hidden />}
        <div className="relative flex w-full min-w-0 items-baseline justify-between">
          {/* Compact (month) cells skip the abbreviation — the grid already
              has a header row labeling each column, and there's no room for
              both the label and a legible date number in a 7-col mobile grid. */}
          {!compact && <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{DAY_ABBR[day.getDay()]}</span>}
          <span className={`font-extrabold tracking-tight text-zinc-900 ${compact ? "text-sm sm:text-base" : "text-lg"}`}>
            {day.getDate()}
          </span>
        </div>
        <div className="relative flex w-full min-w-0 flex-col gap-0.5">
          {visibleEvents.map((ev, i) => (
            <span
              key={i}
              className="w-full min-w-0 truncate rounded px-1 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: hexToRgba(ev.color, 0.16), color: PALETTE.ink }}
            >
              {ev.kind === "exam" ? "★ " : ""}
              {ev.title}
            </span>
          ))}
          {overflow > 0 && <span className="px-1 text-[10px] text-zinc-500">+{overflow} more</span>}
        </div>
      </button>
    );
  }

  return (
    <div className="rijks-card p-5">
      <div className="mb-4 flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
        <div className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-[#D9B454]/50 to-transparent sm:block" />
        <div className="flex shrink-0 items-center gap-1.5">
          {viewMode === "month" && (
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="rounded-full p-1 text-zinc-500 transition-colors duration-150 hover:bg-black/5 hover:text-zinc-900"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-700">
            {viewedMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </span>
          {viewMode === "month" && (
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="rounded-full p-1 text-zinc-500 transition-colors duration-150 hover:bg-black/5 hover:text-zinc-900"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="hidden h-px flex-1 bg-gradient-to-l from-transparent via-[#D9B454]/50 to-transparent sm:block" />

        <div className="hidden shrink-0 items-center gap-1 rounded-full border border-black/10 bg-white/50 p-0.5 text-xs sm:ml-2 sm:flex">
          {(["week", "month"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`rounded-full px-3 py-1 font-semibold capitalize transition-colors duration-150 ${
                viewMode === mode ? "bg-[#8B7EC8]/15 text-[#5D4E9E]" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: viewMode === "week" ? "1fr" : "0fr" }}
      >
        {/* pt-1 gives headroom for a hovered/selected cell's hover:-translate-y-0.5
            lift — without it, that 2px rise gets clipped by this wrapper's own
            top edge. Safe on the collapsed (0fr) side too: grid-template-rows:
            0fr forces the whole row (padding included) to zero height regardless
            of content, so this never affects the collapse animation. */}
        <div className="overflow-hidden pt-1">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <DayCell key={day.toISOString()} day={day} compact={false} dimmed={false} />
            ))}
          </div>
        </div>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: viewMode === "month" ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden pt-1">
          <div className="mb-1 grid grid-cols-7 gap-1 sm:gap-2">
            {DAY_ABBR.map((label) => (
              <span key={label} className="truncate text-center text-[9px] font-bold uppercase tracking-tight text-zinc-500 sm:text-[10px] sm:tracking-widest">
                {label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {monthDays.map((day) => (
              <DayCell
                key={day.toISOString()}
                day={day}
                compact
                dimmed={day.getMonth() !== viewedMonth.getMonth()}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3">
          <span className="text-xs text-zinc-600">
            Showing tasks for {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </span>
          <button
            type="button"
            onClick={() => onSelectDate(null)}
            className="text-xs font-semibold text-[#5D4E9E] hover:underline"
          >
            Show All Tasks
          </button>
        </div>
      )}
    </div>
  );
}
