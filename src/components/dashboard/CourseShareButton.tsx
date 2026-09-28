"use client";

import { useState } from "react";
import { Image as ImageIcon, Link2, Share2 } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { encodeSharePayload } from "@/lib/sharePayload";
import { ExportCardModal } from "./ExportCardModal";
import { CourseRoadmapCard } from "./CourseRoadmapCard";

export function CourseShareButton({ courseId }: { courseId: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [roadmapOpen, setRoadmapOpen] = useState(false);
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
    setMenuOpen(false);
    setTimeout(() => setStatus(null), 3000);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={`Share ${course.code}`}
        className="rounded-full p-1 text-zinc-400 opacity-100 transition-colors hover:bg-black/5 hover:text-[#5D4E9E] sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Share2 className="h-3 w-3" />
      </button>

      {menuOpen && (
        <div
          onMouseLeave={() => setMenuOpen(false)}
          className="rijks-card absolute right-0 top-full z-20 mt-1 flex w-48 flex-col gap-1 p-1.5 text-xs"
        >
          <button
            onClick={() => {
              setRoadmapOpen(true);
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-zinc-700 hover:bg-black/5"
          >
            <ImageIcon className="h-3.5 w-3.5" /> Share Schedule
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-zinc-700 hover:bg-black/5"
          >
            <Link2 className="h-3.5 w-3.5" /> Copy Join Link
          </button>
        </div>
      )}

      {status && (
        <p className="absolute right-0 top-full z-20 mt-1 max-w-[220px] break-all rounded-lg bg-black/80 px-2.5 py-1.5 text-[11px] text-white">
          {status}
        </p>
      )}

      {roadmapOpen && (
        <ExportCardModal onClose={() => setRoadmapOpen(false)} filename={`${course.code}-schedule`}>
          <CourseRoadmapCard course={course} assignments={assignments} exams={exams} />
        </ExportCardModal>
      )}
    </div>
  );
}
