"use client";

import { useTaskStore } from "@/store/useTaskStore";
import { GlowRing } from "./GlowRing";

export function WorkloadRings() {
  const courses = useTaskStore((s) => s.courses);
  const assignments = useTaskStore((s) => s.assignments);

  const withWork = courses.filter((c) => assignments.some((a) => a.courseId === c.id));
  if (withWork.length === 0) {
    return <p className="text-sm text-zinc-600">No graded assignments yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-6">
      {withWork.map((course) => {
        const courseAssignments = assignments.filter((a) => a.courseId === course.id);
        const total = courseAssignments.reduce((sum, a) => sum + a.weightPct, 0);
        const done = courseAssignments
          .filter((a) => a.status === "done")
          .reduce((sum, a) => sum + a.weightPct, 0);
        const pct = total > 0 ? done / total : 0;
        return (
          <div key={course.id} className="flex flex-col items-center gap-2">
            <GlowRing pct={pct} />
            <p className="max-w-[120px] truncate text-xs font-medium uppercase tracking-wide text-zinc-600" title={course.code}>
              {course.name || course.code}
            </p>
          </div>
        );
      })}
    </div>
  );
}
