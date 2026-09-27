"use client";

import { Trash2 } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { DAY_LABELS } from "@/lib/date";

type Event = {
  key: string;
  courseId: string;
  start: string;
  end: string;
  kind: "lecture" | "study";
  studyBlockId?: string;
};

export function WeeklySchedule() {
  const courses = useTaskStore((s) => s.courses);
  const studyBlocks = useTaskStore((s) => s.studyBlocks);
  const removeStudyBlock = useTaskStore((s) => s.removeStudyBlock);

  const today = new Date().getDay();
  const events: Event[] = [];
  courses.forEach((course) => {
    course.lectureSlots
      .filter((slot) => slot.day === today)
      .forEach((slot, i) => {
        events.push({
          key: `${course.id}-lecture-${i}`,
          courseId: course.id,
          start: slot.start,
          end: slot.end,
          kind: "lecture",
        });
      });
  });
  studyBlocks
    .filter((b) => b.day === today)
    .forEach((block) => {
      events.push({
        key: block.id,
        courseId: block.courseId,
        start: block.start,
        end: block.end,
        kind: "study",
        studyBlockId: block.id,
      });
    });
  events.sort((a, b) => a.start.localeCompare(b.start));

  if (events.length === 0) {
    return <p className="text-sm text-zinc-600">Nothing scheduled for today ({DAY_LABELS[today]}).</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {events.map((event) => {
        const course = courses.find((c) => c.id === event.courseId);
        const accent = course?.color ?? "#5B4FA8";
        return (
          <li
            key={event.key}
            style={{ borderLeftColor: accent }}
            className="group relative flex items-center justify-between rounded-lg border-l-[3px] bg-white/60 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">{course?.code ?? "?"}</p>
              <p className="text-xs text-zinc-600">
                {event.start}–{event.end} · {event.kind === "study" ? "Study" : "Lecture"}
              </p>
            </div>
            {event.studyBlockId && (
              <button
                onClick={() => removeStudyBlock(event.studyBlockId!)}
                aria-label="Delete study block"
                className="shrink-0 rounded-full p-1 text-zinc-400 opacity-0 transition-opacity hover:text-[#DC2626] group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
