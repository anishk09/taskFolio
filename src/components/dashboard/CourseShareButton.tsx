"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { encodeSharePayload } from "@/lib/sharePayload";

export function CourseShareButton({ courseId }: { courseId: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const course = useTaskStore((s) => s.courses.find((c) => c.id === courseId));
  const allAssignments = useTaskStore((s) => s.assignments);
  const allExams = useTaskStore((s) => s.exams);
  const assignments = allAssignments.filter((a) => a.courseId === courseId);
  const exams = allExams.filter((e) => e.courseId === courseId);

  if (!course) return null;

  async function handleCopyLink() {
    const data = encodeSharePayload({
      course: { code: course!.code, name: course!.name, color: course!.color },
      assignments: assignments.map((a) => ({ title: a.title, dueDate: a.dueDate, weightPct: a.weightPct })),
      exams: exams.map((e) => ({ title: e.title, date: e.date })),
    });
    const url = `${window.location.origin}/join?data=${data}`;
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Join link copied!");
    } catch {
      setStatus(url);
    }
    setTimeout(() => setStatus(null), 3000);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleCopyLink}
        aria-label={`Copy join link for ${course.code}`}
        title="Copy Join Link"
        className="rounded-full p-1 text-zinc-400 opacity-100 transition-colors hover:bg-black/5 hover:text-[#5D4E9E] sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Link2 className="h-3 w-3" />
      </button>

      {status && (
        <p className="absolute right-0 top-full z-20 mt-1 max-w-[220px] break-all rounded-lg bg-black/80 px-2.5 py-1.5 text-[11px] text-white">
          {status}
        </p>
      )}
    </div>
  );
}
