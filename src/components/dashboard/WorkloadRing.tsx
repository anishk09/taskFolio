"use client";

import { useTaskStore } from "@/store/useTaskStore";
import { PALETTE } from "@/lib/palette";

export function WorkloadRings() {
  const courses = useTaskStore((s) => s.courses);
  const assignments = useTaskStore((s) => s.assignments);

  const withWork = courses.filter((c) => assignments.some((a) => a.courseId === c.id));
  if (withWork.length === 0) {
    return <p className="text-sm text-zinc-600">No graded assignments yet.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {withWork.map((course) => {
        const courseAssignments = assignments.filter((a) => a.courseId === course.id);
        const totalWeight = courseAssignments.reduce((sum, a) => sum + a.weightPct, 0);
        const doneWeight = courseAssignments
          .filter((a) => a.status === "done")
          .reduce((sum, a) => sum + a.weightPct, 0);
        const pct = totalWeight > 0 ? doneWeight / totalWeight : 0;
        const donePct = Math.round(pct * 100);
        const doneCount = courseAssignments.filter((a) => a.status === "done").length;

        return (
          <div key={course.id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-zinc-900">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: course.color }} />
                <span className="truncate" title={course.name || course.code}>
                  {course.name || course.code}
                </span>
              </span>
              <span className="shrink-0 text-sm font-bold tabular-nums text-zinc-900">{donePct}%</span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/10" role="progressbar" aria-valuenow={donePct} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  width: `${donePct}%`,
                  background: `linear-gradient(90deg, ${PALETTE.lavender}, ${PALETTE.periwinkle})`,
                }}
              />
            </div>

            <span className="text-xs text-zinc-600">
              {doneCount} of {courseAssignments.length} graded {courseAssignments.length === 1 ? "item" : "items"} complete
            </span>
          </div>
        );
      })}
    </div>
  );
}
