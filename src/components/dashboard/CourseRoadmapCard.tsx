import type { Assignment, Course, Exam } from "@/types";
import { hexToRgba, PALETTE } from "@/lib/palette";
import { getCountdown } from "@/lib/date";

type RoadmapItem = { id: string; title: string; when: string; kind: "exam" | "assignment"; weightPct?: number };

export function CourseRoadmapCard({
  course,
  assignments,
  exams,
  now = new Date(),
}: {
  course: Course;
  assignments: Assignment[];
  exams: Exam[];
  now?: Date;
}) {
  const items: RoadmapItem[] = [
    ...exams.map((e) => ({ id: e.id, title: e.title, when: e.date, kind: "exam" as const })),
    ...assignments
      .filter((a) => a.status !== "done")
      .map((a) => ({ id: a.id, title: a.title, when: a.dueDate, kind: "assignment" as const, weightPct: a.weightPct })),
  ]
    .filter((item) => new Date(item.when).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime());

  return (
    <div className="relative w-full overflow-hidden p-8" style={{ backgroundColor: "#12131a" }}>
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url(/art/monet-lilies.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#12131a]/60 via-[#12131a]/85 to-[#12131a]" />

      <div className="relative z-10 flex flex-col gap-6 text-[#F5F5F0]">
        <div className="flex items-center gap-2.5">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: course.color }} />
          <div className="min-w-0">
            <p className="truncate font-sans text-xl font-extrabold tracking-tight">{course.name || course.code}</p>
            <p className="text-xs uppercase tracking-widest text-white/60">{course.code}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {items.length === 0 && <p className="text-sm text-white/60">Nothing upcoming — you&apos;re all set.</p>}
          {items.slice(0, 6).map((item) => {
            const c = getCountdown(item.when, now);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-4 py-3"
                style={{ backgroundColor: hexToRgba(course.color, 0.16) }}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.title}</p>
                  <p className="text-[11px] uppercase tracking-wide text-white/50">
                    {item.kind === "exam" ? "Exam" : `${item.weightPct}% of grade`}
                  </p>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold"
                  style={{ backgroundColor: PALETTE.lavender, color: PALETTE.paper }}
                >
                  {c.days}D
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-[10px] uppercase tracking-widest text-white/40">
          <span>Generated with taskFol.io</span>
          <span>Fall 2026</span>
        </div>
      </div>
    </div>
  );
}
