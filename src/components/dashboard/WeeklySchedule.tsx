"use client";

import { Trash2 } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { DAY_LABELS } from "@/lib/date";
import { meetingsOnDay } from "@/lib/meetings";
import { PALETTE } from "@/lib/palette";

type Event = {
  key: string;
  title: string;
  accent: string;
  start: string;
  end?: string;
  detail: string;
  onDelete?: () => void;
  deleteLabel?: string;
};

const timeRange = (start: string, end?: string) => (end ? `${start}–${end}` : start);

export function WeeklySchedule() {
  const courses = useTaskStore((s) => s.courses);
  const studyBlocks = useTaskStore((s) => s.studyBlocks);
  const meetings = useTaskStore((s) => s.meetings);
  const removeStudyBlock = useTaskStore((s) => s.removeStudyBlock);
  const removeMeeting = useTaskStore((s) => s.removeMeeting);

  const now = new Date();
  const today = now.getDay();
  const courseLabel = (courseId: string) => {
    const c = courses.find((x) => x.id === courseId);
    return c ? c.name || c.code : "?";
  };
  const courseAccent = (courseId: string) => courses.find((c) => c.id === courseId)?.color ?? "#5B4FA8";

  const events: Event[] = [];
  courses.forEach((course) => {
    course.lectureSlots
      .filter((slot) => slot.day === today)
      .forEach((slot, i) => {
        events.push({
          key: `${course.id}-lecture-${i}`,
          title: course.name || course.code,
          accent: course.color,
          start: slot.start,
          end: slot.end,
          detail: "Lecture",
        });
      });
  });
  studyBlocks
    .filter((b) => b.day === today)
    .forEach((block) => {
      events.push({
        key: block.id,
        title: courseLabel(block.courseId),
        accent: courseAccent(block.courseId),
        start: block.start,
        end: block.end,
        detail: "Study",
        onDelete: () => removeStudyBlock(block.id),
        deleteLabel: "Delete study block",
      });
    });
  meetingsOnDay(meetings, now).forEach((m) => {
    events.push({
      key: `meeting-${m.id}`,
      title: m.title,
      accent: PALETTE.gold,
      start: m.start,
      end: m.end,
      detail: m.location ? `Meeting · ${m.location}` : "Meeting",
      onDelete: () => removeMeeting(m.id),
      deleteLabel: `Delete ${m.title}`,
    });
  });
  events.sort((a, b) => a.start.localeCompare(b.start));

  // Meetings only — lectures/study blocks already repeat by weekday, so the
  // rest of the week is only interesting for things that were scheduled.
  const later = Array.from({ length: 6 }, (_, i) => {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i + 1);
    return { day, items: meetingsOnDay(meetings, day) };
  }).filter((d) => d.items.length > 0);

  if (events.length === 0 && later.length === 0) {
    return <p className="text-sm text-zinc-600">Nothing scheduled for today ({DAY_LABELS[today]}).</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {events.length === 0 ? (
        <p className="text-sm text-zinc-600">Nothing scheduled for today ({DAY_LABELS[today]}).</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {events.map((event) => (
            <li
              key={event.key}
              style={{ borderLeftColor: event.accent }}
              className="group relative flex items-center justify-between rounded-lg border-l-[3px] bg-white/60 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">{event.title}</p>
                <p className="truncate text-xs text-zinc-600">
                  {timeRange(event.start, event.end)} · {event.detail}
                </p>
              </div>
              {event.onDelete && (
                <button
                  onClick={event.onDelete}
                  aria-label={event.deleteLabel}
                  className="shrink-0 rounded-full p-1 text-zinc-400 opacity-100 transition-opacity hover:text-[#DC2626] sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {later.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Later this week</p>
          <ul className="flex flex-col gap-2">
            {later.flatMap(({ day, items }) =>
              items.map((m) => (
                <li
                  key={`${day.getTime()}-${m.id}`}
                  style={{ borderLeftColor: PALETTE.gold }}
                  className="group relative flex items-center justify-between rounded-lg border-l-[3px] bg-white/60 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">{m.title}</p>
                    <p className="truncate text-xs text-zinc-600">
                      {DAY_LABELS[day.getDay()]} {timeRange(m.start, m.end)}
                      {m.location ? ` · ${m.location}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => removeMeeting(m.id)}
                    aria-label={`Delete ${m.title}`}
                    className="shrink-0 rounded-full p-1 text-zinc-400 opacity-100 transition-opacity hover:text-[#DC2626] sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
