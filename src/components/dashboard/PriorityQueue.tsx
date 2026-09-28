"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { daysRemaining, priorityScore } from "@/lib/priority";
import { hexToRgba, PALETTE, urgencyZone, ZONE_STYLE } from "@/lib/palette";
import { isSameCalendarDay } from "@/lib/date";

// How long a checked-off item lingers (showing the strike-through) before it
// actually leaves the pending list and the row plays its exit animation.
const COMPLETE_LINGER_MS = 350;

function UrgentPulse() {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full"
        style={{ backgroundColor: PALETTE.lavenderText }}
        animate={{ scale: [1, 2.4, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
      />
      <span
        className="relative inline-flex h-2.5 w-2.5 rounded-full"
        style={{
          backgroundColor: PALETTE.lavenderText,
          boxShadow: `0 0 8px 1px ${hexToRgba(PALETTE.lavenderText, 0.7)}`,
        }}
      />
    </span>
  );
}

function GoldLeafBloom() {
  const flecks = 10;
  return (
    <motion.div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
      <motion.span
        className="absolute rounded-full"
        style={{ left: "6%", top: "50%", backgroundColor: hexToRgba(PALETTE.goldBright, 0.5), filter: "blur(8px)" }}
        initial={{ width: 8, height: 8, opacity: 0.6, x: 0, y: "-50%" }}
        animate={{ width: 220, height: 220, opacity: 0, x: -30, y: "-50%" }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
      {Array.from({ length: flecks }, (_, i) => {
        const angle = (i / flecks) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-sm"
            style={{ left: "6%", top: "50%", backgroundColor: PALETTE.goldBright }}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
            animate={{ opacity: 0, x: Math.cos(angle) * 80, y: Math.sin(angle) * 80 - 16, rotate: 180 }}
            transition={{ duration: 0.8, delay: 0.05 + i * 0.02, ease: "easeOut" }}
          />
        );
      })}
    </motion.div>
  );
}

export function PriorityQueue({
  filterCourseId = null,
  filterDate = null,
}: {
  filterCourseId?: string | null;
  filterDate?: Date | null;
}) {
  const assignments = useTaskStore((s) => s.assignments);
  const courses = useTaskStore((s) => s.courses);
  const toggleDone = useTaskStore((s) => s.toggleAssignmentDone);
  const removeAssignment = useTaskStore((s) => s.removeAssignment);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const now = new Date();
  const pending = assignments
    .filter((a) => a.status !== "done")
    .filter((a) => !filterCourseId || a.courseId === filterCourseId)
    .filter((a) => !filterDate || isSameCalendarDay(a.dueDate, filterDate))
    .map((a) => ({ a, course: courses.find((c) => c.id === a.courseId), days: daysRemaining(a.dueDate, now) }))
    .sort((x, y) => priorityScore(y.a, now) - priorityScore(x.a, now));

  if (pending.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        {filterDate
          ? "Nothing due on this day."
          : "Nothing pending — add an assignment to see it prioritized here."}
      </p>
    );
  }

  function complete(id: string) {
    setCompletingId(id);
    setTimeout(() => {
      toggleDone(id);
      setCompletingId((cur) => (cur === id ? null : cur));
    }, COMPLETE_LINGER_MS);
  }

  return (
    <ul className="flex flex-col gap-2.5">
      <AnimatePresence initial={false}>
        {pending.map(({ a, course, days }, i) => {
          const zone = urgencyZone(days);
          const style = ZONE_STYLE[zone];
          const accent = course?.color ?? PALETTE.gold;
          const completing = completingId === a.id;
          return (
            <motion.li
              layout
              key={a.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.18, ease: "easeOut" } }}
              transition={{ duration: 0.18, delay: i * 0.03, ease: "easeOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={(_, info) => {
                if (info.offset.x > 120) complete(a.id);
              }}
              style={{ "--accent": accent } as React.CSSProperties}
              className="group relative flex cursor-grab flex-col gap-2 rounded-xl border border-black/10 bg-white/70 px-4 py-3.5 backdrop-blur-xl transition-[box-shadow,border-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:border-[color:var(--accent)]/40 hover:shadow-[0_0_28px_-10px_var(--accent)] active:cursor-grabbing"
            >
              <AnimatePresence>{completing && <GoldLeafBloom />}</AnimatePresence>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  aria-label={`Mark ${a.title} done`}
                  checked={completing}
                  onChange={() => complete(a.id)}
                  className="h-5 w-5 shrink-0 accent-[#3FAE73]"
                />
                {zone === "urgent" && !completing && <UrgentPulse />}
                <p
                  className={`min-w-0 flex-1 truncate text-base font-semibold text-zinc-900 transition-opacity duration-150 ${
                    completing ? "opacity-40 line-through" : "opacity-100"
                  }`}
                >
                  {a.title}
                </p>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold"
                  style={{ backgroundColor: style.bg, color: style.fg }}
                >
                  {days < 0 ? "OVERDUE" : `${Math.ceil(days)}D`}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pl-8">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span
                    className="inline-flex shrink-0 items-center gap-1 truncate rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ backgroundColor: hexToRgba(accent, 0.14), color: PALETTE.ink }}
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                    {course?.code ?? "Unknown"}
                  </span>
                  <span className="shrink-0 whitespace-nowrap text-xs text-zinc-600">{a.weightPct}% of grade</span>
                </div>

                <button
                  onClick={() => removeAssignment(a.id)}
                  aria-label={`Delete ${a.title}`}
                  className="shrink-0 rounded-full p-1 text-zinc-400 opacity-100 transition-opacity hover:bg-black/5 hover:text-[#DC2626] sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
