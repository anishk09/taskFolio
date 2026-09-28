"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { playGlassChime } from "@/lib/chime";
import { getClientNow, getServerNow, subscribeToClock } from "@/lib/clock";
import { DragHandle, ReorderableItem } from "./ReorderableItem";

// How long a checked-off item lingers (strike-through + shimmer) before it
// actually leaves the pending list and plays its exit animation.
const COMPLETE_LINGER_MS = 400;

function dueDateTime(dueDate: string, dueTime?: string): Date {
  const [y, m, d] = dueDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (dueTime) {
    const [hh, mm] = dueTime.split(":").map(Number);
    date.setHours(hh, mm);
  } else {
    date.setHours(23, 59, 59);
  }
  return date;
}

function formatDueLabel(dueDate: string, dueTime: string | undefined, nowMs: number): string {
  const due = dueDateTime(dueDate, dueTime);
  const now = new Date(nowMs);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const dayDiff = Math.round((startOfDue.getTime() - startOfToday.getTime()) / 86_400_000);
  const dayLabel =
    dayDiff === 0
      ? "Today"
      : dayDiff === 1
        ? "Tomorrow"
        : dayDiff === -1
          ? "Yesterday"
          : due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const timeLabel = dueTime ? due.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "";
  return timeLabel ? `${dayLabel} ${timeLabel}` : dayLabel;
}

function RippleBurst() {
  return (
    <motion.span
      className="pointer-events-none absolute left-[44px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-[#D9B454]"
      initial={{ scale: 0.4, opacity: 0.8 }}
      animate={{ scale: 3.2, opacity: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    />
  );
}

export function TodoList() {
  const todos = useTaskStore((s) => s.todos);
  const toggleTodoDone = useTaskStore((s) => s.toggleTodoDone);
  const removeTodo = useTaskStore((s) => s.removeTodo);
  const reorderTodos = useTaskStore((s) => s.reorderTodos);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const nowMs = useSyncExternalStore(subscribeToClock, getClientNow, getServerNow);

  const pending = todos.filter((t) => !t.done);

  if (pending.length === 0) {
    return <p className="text-sm text-zinc-600">Nothing on your to-do list.</p>;
  }

  function complete(id: string) {
    setCompletingId(id);
    playGlassChime();
    setTimeout(() => {
      toggleTodoDone(id);
      setCompletingId((cur) => (cur === id ? null : cur));
    }, COMPLETE_LINGER_MS);
  }

  return (
    <Reorder.Group axis="y" values={pending.map((t) => t.id)} onReorder={reorderTodos} className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {pending.map((t) => {
          const completing = completingId === t.id;
          const overdue = !completing && !!t.dueDate && nowMs > 0 && dueDateTime(t.dueDate, t.dueTime).getTime() < nowMs;
          return (
            <ReorderableItem
              key={t.id}
              value={t.id}
              index={0}
              motionProps={{
                initial: { opacity: 0, y: -12, scale: 0.95 },
                animate: { opacity: 1, y: 0, scale: 1 },
                exit: { opacity: 0, x: 20, scale: 0.92, rotate: 5, transition: { duration: 0.22, ease: "easeIn" } },
                transition: { type: "spring", stiffness: 500, damping: 32 },
              }}
            >
              {(controls) => (
            <div
              className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border border-black/10 bg-white/70 px-3.5 py-2.5 backdrop-blur-xl transition-colors hover:border-[#8B7EC8]/40 ${
                completing ? "golden-wave-sweep" : ""
              }`}
            >
              <AnimatePresence>{completing && <RippleBurst />}</AnimatePresence>
              <DragHandle controls={controls} label={`Reorder ${t.title}`} />
              <input
                type="checkbox"
                aria-label={`Mark ${t.title} done`}
                checked={completing}
                onChange={() => complete(t.id)}
                className="h-5 w-5 shrink-0 accent-[#8B7EC8]"
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium transition-opacity duration-150 ${
                    completing ? "text-zinc-400 line-through opacity-60" : "text-zinc-900"
                  }`}
                >
                  {t.title}
                </p>
                {t.dueDate && (
                  <span
                    className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      overdue ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    📅 {formatDueLabel(t.dueDate, t.dueTime, nowMs)}
                  </span>
                )}
              </div>
              <button
                onClick={() => removeTodo(t.id)}
                aria-label={`Delete ${t.title}`}
                className="shrink-0 rounded-full p-1 text-zinc-400 opacity-100 transition-opacity hover:bg-black/5 hover:text-[#DC2626] sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
              )}
            </ReorderableItem>
          );
        })}
      </AnimatePresence>
    </Reorder.Group>
  );
}
