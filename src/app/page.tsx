"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Plus, RotateCcw } from "lucide-react";
import { CourseFilterBar } from "@/components/dashboard/CourseFilterBar";
import { QuickAdd } from "@/components/dashboard/QuickAdd";
import { PriorityQueue } from "@/components/dashboard/PriorityQueue";
import { ExamCountdowns } from "@/components/dashboard/ExamCountdownCard";
import { WeeklySchedule } from "@/components/dashboard/WeeklySchedule";
import { WorkloadRings } from "@/components/dashboard/WorkloadRing";
import { WallpaperBackground } from "@/components/WallpaperBackground";
import { useTaskStore } from "@/store/useTaskStore";
import { fileToWallpaperDataUrl } from "@/lib/wallpaper";

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
  const [wallpaperError, setWallpaperError] = useState<string | null>(null);
  const wallpaperDataUrl = useTaskStore((s) => s.wallpaperDataUrl);
  const setWallpaper = useTaskStore((s) => s.setWallpaper);
  const clearWallpaper = useTaskStore((s) => s.clearWallpaper);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);

  async function handleWallpaperFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setWallpaperError(null);
    try {
      const dataUrl = await fileToWallpaperDataUrl(file);
      setWallpaper(dataUrl);
    } catch {
      setWallpaperError("Couldn't set that image as your wallpaper — try a smaller file.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6">
      <WallpaperBackground />
      <input
        ref={wallpaperInputRef}
        type="file"
        accept="image/*"
        onChange={handleWallpaperFile}
        className="hidden"
      />

      <nav className="rijks-card flex flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:px-5">
        <div className="flex items-center justify-between gap-2 sm:contents">
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-sans text-lg font-extrabold tracking-tight text-zinc-900 sm:text-xl">
              taskFolio
              <span className="text-[#8B7EC8]">.</span>
            </span>
            <span className="rounded-full bg-[#8B7EC8]/15 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-[#5D4E9E]">
              Fall 2026
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:order-3">
            <button
              onClick={() => wallpaperInputRef.current?.click()}
              title="Set custom wallpaper"
              aria-label="Set custom wallpaper"
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-white/50 px-3 py-2 text-xs font-medium text-zinc-700 transition-all hover:-translate-y-0.5 hover:bg-white/80"
            >
              <ImageIcon className="h-3.5 w-3.5" />
            </button>
            {wallpaperDataUrl && (
              <button
                onClick={() => clearWallpaper()}
                title="Reset to default wallpaper"
                aria-label="Reset to default wallpaper"
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-white/50 px-3 py-2 text-xs font-medium text-zinc-700 transition-all hover:-translate-y-0.5 hover:bg-white/80"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="min-w-0 sm:order-2 sm:flex-1">
          <CourseFilterBar selectedCourseId={selectedCourseId} onSelectCourse={setSelectedCourseId} />
        </div>

        <button
          onClick={() => setQuickAddOpen((v) => !v)}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#8B7EC8] px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(139,126,200,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#7A6CB8] sm:order-4 sm:w-auto sm:py-2"
        >
          <Plus className="h-3.5 w-3.5" /> Add Item
        </button>
      </nav>

      {wallpaperError && <p className="mt-2 text-xs font-medium text-[#DC2626]">{wallpaperError}</p>}

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
