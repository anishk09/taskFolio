"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { decodeSharePayload } from "@/lib/sharePayload";
import { useTaskStore } from "@/store/useTaskStore";
import { getCountdown } from "@/lib/date";

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = searchParams.get("data");
  const payload = useMemo(() => (data ? decodeSharePayload(data) : null), [data]);
  const [added, setAdded] = useState(false);

  const courses = useTaskStore((s) => s.courses);
  const addCourse = useTaskStore((s) => s.addCourse);
  const addAssignment = useTaskStore((s) => s.addAssignment);
  const addExam = useTaskStore((s) => s.addExam);

  if (!payload) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <div className="rijks-card w-full p-8">
          <h1 className="font-sans text-lg font-bold text-zinc-900">Link not recognized</h1>
          <p className="mt-2 text-sm text-zinc-600">
            This share link looks broken or incomplete. Ask your classmate to send it again.
          </p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const upcomingExams = payload.exams
    .filter((e) => new Date(e.date).getTime() > now.getTime())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  function handleAdd() {
    if (!payload) return;
    let course = courses.find((c) => c.code.toUpperCase() === payload.course.code.toUpperCase());
    if (!course) {
      addCourse({ code: payload.course.code, name: payload.course.name, color: payload.course.color, professor: "", lectureSlots: [] });
      course = useTaskStore.getState().courses.find((c) => c.code.toUpperCase() === payload.course.code.toUpperCase());
    }
    if (!course) return;
    for (const a of payload.assignments) {
      addAssignment({ courseId: course.id, title: a.title, dueDate: a.dueDate, weightPct: a.weightPct });
    }
    for (const e of payload.exams) {
      addExam({ courseId: course.id, title: e.title, date: e.date });
    }
    setAdded(true);
    setTimeout(() => router.push("/"), 900);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="rijks-card p-6">
        <div className="flex items-center gap-2.5">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: payload.course.color }} />
          <div className="min-w-0">
            <p className="truncate font-sans text-lg font-bold tracking-tight text-zinc-900">{payload.course.name || payload.course.code}</p>
            <p className="text-xs uppercase tracking-widest text-zinc-500">{payload.course.code}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-4 text-sm text-zinc-700">
          <span>
            <span className="font-bold text-zinc-900">{payload.assignments.length}</span> assignment
            {payload.assignments.length === 1 ? "" : "s"}
          </span>
          <span>
            <span className="font-bold text-zinc-900">{upcomingExams.length}</span> upcoming exam
            {upcomingExams.length === 1 ? "" : "s"}
          </span>
        </div>

        {upcomingExams.length > 0 && (
          <ul className="mt-4 flex flex-col gap-1.5">
            {upcomingExams.slice(0, 4).map((e, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2 text-sm">
                <span className="truncate text-zinc-800">{e.title}</span>
                <span className="shrink-0 text-xs font-semibold text-zinc-500">{getCountdown(e.date, now).days}D</span>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={handleAdd}
          disabled={added}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#8B7EC8] px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(139,126,200,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#7A6CB8] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {added ? "Added — redirecting…" : "Add to my taskFolio"}
        </button>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center text-sm text-zinc-600">Loading…</div>}>
      <JoinContent />
    </Suspense>
  );
}
