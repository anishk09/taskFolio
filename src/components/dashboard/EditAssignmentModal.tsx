"use client";

import { X } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { toLocalInputValue } from "@/lib/date";
import type { Assignment } from "@/types";

const inputCls =
  "w-full rounded-xl border border-black/10 bg-white/70 px-3.5 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 transition-all focus:border-[#8B7EC8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B7EC8]/20";

export function EditAssignmentModal({ assignment, onClose }: { assignment: Assignment; onClose: () => void }) {
  const courses = useTaskStore((s) => s.courses);
  const updateAssignment = useTaskStore((s) => s.updateAssignment);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const title = String(f.get("title") || "").trim();
          const weight = Number(f.get("weightPct"));
          if (!title) return;
          updateAssignment(assignment.id, {
            title,
            courseId: String(f.get("courseId")),
            dueDate: String(f.get("dueDate")),
            weightPct: Number.isFinite(weight) ? weight : assignment.weightPct,
          });
          onClose();
        }}
        className="rijks-card relative flex w-full max-w-sm flex-col gap-3 p-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1.5 text-zinc-500 hover:bg-black/5 hover:text-zinc-900"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="font-sans text-lg font-bold tracking-tight text-zinc-900">Edit Assignment</h2>

        <label className="flex flex-col gap-1 text-xs font-semibold text-zinc-600">
          Title
          <input name="title" required defaultValue={assignment.title} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-zinc-600">
          Course
          <select name="courseId" required defaultValue={assignment.courseId} className={inputCls}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.code}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-zinc-600">
          Due
          <input
            name="dueDate"
            type="datetime-local"
            required
            defaultValue={toLocalInputValue(assignment.dueDate)}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-zinc-600">
          % of grade
          <input
            name="weightPct"
            type="number"
            min={0}
            max={100}
            step={0.5}
            required
            defaultValue={assignment.weightPct}
            className={inputCls}
          />
        </label>

        <button className="mt-1 rounded-full bg-[#8B7EC8] px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(139,126,200,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#7A6CB8]">
          Save Changes
        </button>
      </form>
    </div>
  );
}
