"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { CourseFilterBar } from "@/components/dashboard/CourseFilterBar";
import { QuickAdd } from "@/components/dashboard/QuickAdd";
import { PriorityQueue } from "@/components/dashboard/PriorityQueue";
import { ExamCountdowns } from "@/components/dashboard/ExamCountdownCard";
import { WeeklySchedule } from "@/components/dashboard/WeeklySchedule";
import { WorkloadRings } from "@/components/dashboard/WorkloadRing";

function Panel({
  title,
  index,
  children,
}: {
  title: string;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 90, damping: 15, delay: index * 0.07 }}
      className="rijks-card p-6"
    >
      <h2 className="mb-4 border-b border-black/10 pb-3 font-sans text-lg font-bold tracking-tight text-zinc-900">
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

export default function Home() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6">
      <nav className="rijks-card flex flex-wrap items-center gap-4 px-5 py-3">
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-sans text-xl font-extrabold tracking-tight text-zinc-900">
            taskFolio
            <span className="text-[#8B7EC8]">.</span>
          </span>
          <span className="rounded-full bg-[#8B7EC8]/15 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-[#5D4E9E]">
            Fall 2026
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <CourseFilterBar selectedCourseId={selectedCourseId} onSelectCourse={setSelectedCourseId} />
        </div>

        <button
          onClick={() => setQuickAddOpen((v) => !v)}
          className="flex shrink-0 items-center gap-2 rounded-full bg-[#8B7EC8] px-5 py-2 text-xs font-medium uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(139,126,200,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#7A6CB8]"
        >
          <Plus className="h-3.5 w-3.5" /> Add Item
        </button>
      </nav>

      <QuickAdd open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Panel title="Priority Queue" index={0}>
            <PriorityQueue filterCourseId={selectedCourseId} />
          </Panel>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <Panel title="Workload & Pacing" index={1}>
            <WorkloadRings />
          </Panel>
          <Panel title="Upcoming Exams" index={2}>
            <ExamCountdowns filterCourseId={selectedCourseId} />
          </Panel>
          <Panel title="Weekly Schedule" index={3}>
            <WeeklySchedule />
          </Panel>
        </div>
      </div>

      <footer className="rijks-card mt-6 flex flex-wrap items-center justify-between gap-2 px-5 py-3 font-sans text-xs text-zinc-600">
        <span>
          taskFolio<span className="text-[#8B7EC8]">.</span> Built by students, for students.
        </span>
        <span>Artwork: &quot;Water Lilies&quot; by Claude Monet</span>
      </footer>
    </div>
  );
}
