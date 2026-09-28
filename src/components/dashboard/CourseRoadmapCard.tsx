import { Star } from "lucide-react";
import type { Course, Exam } from "@/types";
import { getCountdown } from "@/lib/date";
import { hexToRgba } from "@/lib/palette";

// Fixed positions (not randomized) for a small "constellation" scattered
// across the hero gradient — a designed motif standing in for a real image,
// so the card never depends on external art or a generation provider.
const CONSTELLATION_STARS = [
  { left: 12, top: 20, size: 10 },
  { left: 28, top: 62, size: 7 },
  { left: 48, top: 15, size: 8 },
  { left: 70, top: 30, size: 12 },
  { left: 85, top: 68, size: 8 },
  { left: 60, top: 78, size: 6 },
  { left: 18, top: 82, size: 6 },
  { left: 90, top: 15, size: 7 },
];

type RoadmapItem = { id: string; title: string; when: string; courseId: string };

const MAX_VISIBLE_ITEMS = 6;

// Exports the whole semester (every enrolled course + its upcoming exams)
// as one card, styled to match ClearedMilestoneCard's bright
// gamification-card aesthetic rather than the old per-course dark card.
// Assignments are deliberately left out — this is a courses/exams overview,
// not a task list (that's what the Priority Queue is for).
export function SemesterRoadmapCard({
  courses,
  exams,
  now = new Date(),
}: {
  courses: Course[];
  exams: Exam[];
  now?: Date;
}) {
  const items: RoadmapItem[] = exams
    .map((e) => ({ id: e.id, title: e.title, when: e.date, courseId: e.courseId }))
    .filter((item) => new Date(item.when).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime());

  const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS);
  const dateStr = now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-[32px] border border-amber-200/40 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
      <div className="relative flex flex-col items-center justify-center bg-gradient-to-b from-[#8B7EC8] via-[#8B7EC8]/40 to-white px-6 pb-4 pt-8">
        <span className="mb-2 text-sm font-extrabold tracking-tight text-white">
          taskFolio<span className="text-amber-200">.</span>
        </span>
        <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-white/90 bg-gradient-to-br from-[#5D4E9E] via-[#8B7EC8] to-[#D9B454] shadow-[0_12px_30px_rgba(217,119,6,0.35)]">
          {CONSTELLATION_STARS.map((s, i) => (
            <Star
              key={i}
              className="absolute text-white/40"
              style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
              fill="currentColor"
              strokeWidth={0}
            />
          ))}
          {/* The "." is drawn as a shape, not a text glyph — at this large a
              size, html-to-image's export renders the period character
              itself as a solid box instead of a dot, regardless of color
              syntax. A real shape sidesteps that font-rasterization bug. */}
          <span
            className="inline-flex select-none items-end font-sans text-6xl font-extrabold tracking-tight"
            style={{ color: "rgba(10,11,13,0.18)" }}
          >
            tF
            <span
              className="mb-2 ml-1 inline-block shrink-0 rounded-full"
              style={{ width: 14, height: 14, backgroundColor: "#D9B454" }}
            />
          </span>
          <span className="absolute right-2 top-2 rounded-full bg-black/30 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            📚 Semester Roadmap
          </span>
        </div>

        <div className="mt-4 flex w-full items-center justify-center gap-2">
          <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold text-[#5D4E9E]">
            {courses.length} Course{courses.length === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold text-[#5D4E9E]">
            {items.length} Upcoming
          </span>
        </div>

        <p className="mt-2 text-center text-[10px] font-medium text-[#5D4E9E]/80">
          Your whole semester, at a glance
        </p>
      </div>

      <div className="flex flex-col items-center bg-white px-7 py-6 text-center text-neutral-900">
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">Semester Roadmap</h2>
        <p className="mb-4 mt-1 text-xs font-medium text-neutral-500">{dateStr}</p>

        <div className="flex w-full flex-col gap-2">
          {items.length === 0 && (
            <div className="w-full rounded-xl bg-[#8B7EC8]/10 p-3 text-center text-xs text-neutral-600">
              Nothing upcoming — you&apos;re all set.
            </div>
          )}
          {visibleItems.map((item) => {
            const course = courses.find((c) => c.id === item.courseId);
            const c = getCountdown(item.when, now);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-[#8B7EC8]/10 px-3 py-2.5 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#5D4E9E]">{item.title}</p>
                  <p className="truncate text-[10px] uppercase tracking-wide text-neutral-500">
                    {course?.name || course?.code || "Unknown"} · Exam
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[#5D4E9E] px-2.5 py-1 text-[11px] font-bold text-white">
                  {c.days}D
                </span>
              </div>
            );
          })}
          {items.length > MAX_VISIBLE_ITEMS && (
            <p className="text-center text-[10px] font-medium text-neutral-500">
              +{items.length - MAX_VISIBLE_ITEMS} more
            </p>
          )}
        </div>

        {courses.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {courses.map((c) => (
              <span
                key={c.id}
                className="flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium text-neutral-800"
                style={{ borderColor: hexToRgba(c.color, 0.4), backgroundColor: hexToRgba(c.color, 0.12) }}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name || c.code}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
