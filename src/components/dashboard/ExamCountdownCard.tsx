"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { getCountdown } from "@/lib/date";
import { getClientNow, getServerNow, subscribeToClock } from "@/lib/clock";
import { GlowRing } from "./GlowRing";
import { CourseShareButton } from "./CourseShareButton";

// ponytail: no "prep started" timestamp in the data model, so the ring
// assumes a fixed 21-day study horizon rather than tracking real effort.
// Upgrade: stamp exams with a prepStart date if this needs to be accurate.
const PREP_WINDOW_DAYS = 21;

export function ExamCountdowns({ filterCourseId = null }: { filterCourseId?: string | null }) {
  const exams = useTaskStore((s) => s.exams);
  const courses = useTaskStore((s) => s.courses);
  const removeExam = useTaskStore((s) => s.removeExam);

  // useSyncExternalStore reads the impure clock without violating render
  // purity, and resolves the SSR/client snapshot mismatch for free.
  const nowMs = useSyncExternalStore(subscribeToClock, getClientNow, getServerNow);
  const now = nowMs > 0 ? new Date(nowMs) : null;

  const upcoming = exams
    .filter((e) => !now || new Date(e.date).getTime() > now.getTime() - 24 * 60 * 60 * 1000)
    .filter((e) => !filterCourseId || e.courseId === filterCourseId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (upcoming.length === 0) {
    return <p className="text-sm text-zinc-600">No upcoming exams.</p>;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {upcoming.map((exam) => {
        const course = courses.find((c) => c.id === exam.courseId);
        const c = now ? getCountdown(exam.date, now) : null;
        const prepProgress = c ? Math.min(Math.max(1 - c.days / PREP_WINDOW_DAYS, 0), 1) : 0;
        return (
          <motion.div
            layout
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            key={exam.id}
            className="rijks-card group relative flex w-44 flex-col items-center gap-2 p-4"
          >
            <div className="flex w-full items-center justify-between">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: course?.color ?? "#5B4FA8" }}
              />
              {course && (
                <div className="absolute right-8 top-1.5">
                  <CourseShareButton courseId={course.id} />
                </div>
              )}
            </div>
            <p className="w-full truncate text-center text-sm font-semibold text-zinc-600">{course?.name || course?.code || "?"}</p>
            <p className="w-full truncate text-center text-base font-bold text-zinc-900">{exam.title}</p>

            {c && !c.isPast ? (
              <GlowRing pct={prepProgress} label={String(c.days)} sublabel="days" />
            ) : (
              <p className="py-6 text-lg font-bold text-[#DC2626]">{c ? "PAST" : "—"}</p>
            )}
            {c && !c.isPast && (
              <p className="font-mono text-xs text-zinc-600">
                {c.hours}h {c.minutes}m remaining
              </p>
            )}

            <button
              onClick={() => removeExam(exam.id)}
              aria-label={`Delete ${exam.title}`}
              className="absolute right-1.5 top-1.5 rounded-full p-1 text-zinc-400 opacity-100 transition-opacity hover:bg-black/5 hover:text-[#DC2626] sm:opacity-0 sm:group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
