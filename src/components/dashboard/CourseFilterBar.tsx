"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";

export function CourseFilterBar({
  selectedCourseId,
  onSelectCourse,
}: {
  selectedCourseId: string | null;
  onSelectCourse: (id: string | null) => void;
}) {
  const courses = useTaskStore((s) => s.courses);
  const removeCourse = useTaskStore((s) => s.removeCourse);

  if (courses.length === 0) {
    return <p className="text-xs text-zinc-600">No courses yet</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => onSelectCourse(null)}
        aria-pressed={selectedCourseId === null}
        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
          selectedCourseId === null
            ? "border-[#8B7EC8]/50 bg-[#8B7EC8]/15 text-[#5D4E9E]"
            : "border-black/10 bg-white/50 text-zinc-600 hover:bg-white/80"
        }`}
      >
        All
      </button>
      <AnimatePresence initial={false}>
        {courses.map((course) => {
          const active = selectedCourseId === course.id;
          return (
            <motion.div
              layout
              key={course.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ "--accent": course.color } as React.CSSProperties}
              className={`group/pill flex items-center gap-1 rounded-full border py-1 pl-1 pr-1 text-xs transition-colors ${
                active
                  ? "border-[color:var(--accent)]/50 bg-[color:var(--accent)]/15"
                  : "border-black/10 bg-white/50 hover:bg-white/80"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectCourse(active ? null : course.id)}
                aria-pressed={active}
                title={course.code}
                className="flex max-w-[180px] items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold text-zinc-800 md:max-w-[220px]"
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: course.color }} />
                <span className="truncate">{course.name || course.code}</span>
              </button>
              <button
                type="button"
                onClick={() => removeCourse(course.id)}
                aria-label={`Remove ${course.code}`}
                className="rounded-full p-1 text-zinc-400 opacity-0 transition-opacity hover:text-[#DC2626] group-hover/pill:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
