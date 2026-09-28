"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, ImageIcon, MoreVertical, Plus, QrCode, RotateCcw, Share2 } from "lucide-react";
import { CourseFilterBar } from "@/components/dashboard/CourseFilterBar";
import { QuickAdd } from "@/components/dashboard/QuickAdd";
import { PriorityQueue } from "@/components/dashboard/PriorityQueue";
import { TodoList } from "@/components/dashboard/TodoList";
import { ExamCountdowns } from "@/components/dashboard/ExamCountdownCard";
import { WeeklySchedule } from "@/components/dashboard/WeeklySchedule";
import { WorkloadRings } from "@/components/dashboard/WorkloadRing";
import { GalleryCalendar } from "@/components/dashboard/GalleryCalendar";
import { WallpaperBackground } from "@/components/WallpaperBackground";
import { FeedbackButton } from "@/components/FeedbackButton";
import { WelcomeVideoModal } from "@/components/onboarding/WelcomeVideoModal";
import { AddToHomeScreenPrompt } from "@/components/onboarding/AddToHomeScreenPrompt";
import { GpaForecasterModal } from "@/components/dashboard/GpaForecasterModal";
import { ExportCardModal } from "@/components/dashboard/ExportCardModal";
import { ClearedMilestoneCard } from "@/components/dashboard/ClearedMilestoneCard";
import { SemesterRoadmapCard } from "@/components/dashboard/CourseRoadmapCard";
import { SyncDeviceModal } from "@/components/dashboard/SyncDeviceModal";
import { useTaskStore } from "@/store/useTaskStore";
import { fileToWallpaperDataUrl } from "@/lib/wallpaper";
import { isAllTasksCleared } from "@/lib/milestone";

const INTRO_SEEN_KEY = "taskfolio_has_seen_intro";

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [wallpaperError, setWallpaperError] = useState<string | null>(null);
  const [introOpen, setIntroOpen] = useState(false);
  const [introClosedCount, setIntroClosedCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [forecasterOpen, setForecasterOpen] = useState(false);
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const syncKey = useTaskStore((s) => s.syncKey);
  const ensureSyncKey = useTaskStore((s) => s.ensureSyncKey);
  const wallpaperDataUrl = useTaskStore((s) => s.wallpaperDataUrl);
  const setWallpaper = useTaskStore((s) => s.setWallpaper);
  const clearWallpaper = useTaskStore((s) => s.clearWallpaper);
  const clearAllData = useTaskStore((s) => s.clearAllData);
  const courses = useTaskStore((s) => s.courses);
  const assignments = useTaskStore((s) => s.assignments);
  const exams = useTaskStore((s) => s.exams);
  const todos = useTaskStore((s) => s.todos);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const cleared = isAllTasksCleared(assignments);

  // When there's nothing left in the Priority Queue but general to-dos are
  // still pending, put the to-do list first so users aren't scrolling past
  // an empty queue to find their actual pending work.
  const pendingAssignmentsCount = assignments.filter((a) => a.status !== "done").length;
  const pendingTodosCount = todos.filter((t) => !t.done).length;
  const elevateTodos = pendingAssignmentsCount === 0 && pendingTodosCount > 0;

  useEffect(() => {
    // localStorage is a browser-only external system unavailable during SSR,
    // so syncing it into state after mount is the correct pattern here
    // despite the generic set-state-in-effect lint nudge.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!localStorage.getItem(INTRO_SEEN_KEY)) setIntroOpen(true);
    ensureSyncKey();

    // PWA manifest shortcuts ("Add Item" / "Grade Forecaster") land here
    // with ?action=... — open the matching panel once, then drop it from
    // the URL so a refresh doesn't reopen it.
    const action = new URLSearchParams(window.location.search).get("action");
    if (action === "add") setQuickAddOpen(true);
    if (action === "forecaster") setForecasterOpen(true);
    if (action) window.history.replaceState(null, "", window.location.pathname);
  }, [ensureSyncKey]);

  function closeIntro() {
    localStorage.setItem(INTRO_SEEN_KEY, "true");
    setIntroOpen(false);
    setIntroClosedCount((c) => c + 1);
  }

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

          <div className="no-scrollbar flex min-w-0 shrink items-center gap-1.5 overflow-x-auto sm:order-3 sm:shrink-0 sm:overflow-visible">
            {courses.length > 0 && (
              <button
                onClick={() => setRoadmapOpen(true)}
                title="Share Semester Roadmap"
                aria-label="Share Semester Roadmap"
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-white/50 px-3 py-2 text-xs font-medium text-zinc-700 transition-all hover:-translate-y-0.5 hover:bg-white/80"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
            )}
            {syncKey && (
              <button
                onClick={() => setSyncModalOpen(true)}
                title="Sync to Mobile"
                aria-label="Sync to Mobile"
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-white/50 px-3 py-2 text-xs font-medium text-zinc-700 transition-all hover:-translate-y-0.5 hover:bg-white/80"
              >
                <QrCode className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setForecasterOpen(true)}
              title="Grade Forecaster"
              aria-label="Grade Forecaster"
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-white/50 px-3 py-2 text-xs font-medium text-zinc-700 transition-all hover:-translate-y-0.5 hover:bg-white/80"
            >
              <Calculator className="h-3.5 w-3.5" />
            </button>
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
            <div className="relative">
              <button
                onClick={() => setSettingsOpen((v) => !v)}
                title="Settings"
                aria-label="Settings"
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-white/50 px-3 py-2 text-xs font-medium text-zinc-700 transition-all hover:-translate-y-0.5 hover:bg-white/80"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
              {settingsOpen && (
                <div
                  onMouseLeave={() => setSettingsOpen(false)}
                  className="rijks-card absolute right-0 top-full z-20 mt-1 w-40 p-1.5 text-xs"
                >
                  <button
                    onClick={() => {
                      setIntroOpen(true);
                      setSettingsOpen(false);
                    }}
                    className="w-full rounded-lg px-2.5 py-2 text-left font-medium text-zinc-700 hover:bg-black/5"
                  >
                    Replay Gallery Tour
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Clear all courses, tasks, to-dos, and settings? This can't be undone.")) {
                        clearAllData();
                      }
                      setSettingsOpen(false);
                    }}
                    className="w-full rounded-lg px-2.5 py-2 text-left font-medium text-[#DC2626] hover:bg-[#DC2626]/5"
                  >
                    Clear All Data
                  </button>
                </div>
              )}
            </div>
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
        <div className="flex flex-col gap-6 lg:col-span-8">
          <GalleryCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          {(elevateTodos
            ? [
                <Panel key="todo-list" title="To-Do List" index={0}>
                  <TodoList />
                </Panel>,
                <Panel key="priority-queue" title="Priority Queue" index={1}>
                  <PriorityQueue filterCourseId={selectedCourseId} filterDate={selectedDate} />
                </Panel>,
              ]
            : [
                <Panel key="priority-queue" title="Priority Queue" index={0}>
                  <PriorityQueue filterCourseId={selectedCourseId} filterDate={selectedDate} />
                </Panel>,
                <Panel key="todo-list" title="To-Do List" index={1}>
                  <TodoList />
                </Panel>,
              ])}
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

      {cleared && (
        <button
          onClick={() => setMilestoneOpen(true)}
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full border border-white/50 bg-white/80 px-5 py-2.5 text-xs font-semibold text-zinc-900 shadow-[0_12px_32px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all hover:-translate-y-0.5"
        >
          ✨ Every task cleared · Share Milestone
        </button>
      )}

      {milestoneOpen && (
        <ExportCardModal
          onClose={() => setMilestoneOpen(false)}
          filename="taskfolio-cleared"
          shimmer
          primaryAction="copy"
          copyLabel="Collect & Copy Story Card"
          downloadLabel="Download PNG"
          primaryClassName="w-full rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-700"
          secondaryClassName="text-xs font-semibold text-white/70 transition-colors hover:text-white hover:underline"
        >
          <ClearedMilestoneCard />
        </ExportCardModal>
      )}

      {forecasterOpen && <GpaForecasterModal onClose={() => setForecasterOpen(false)} />}

      {syncModalOpen && syncKey && (
        <SyncDeviceModal syncKey={syncKey} onClose={() => setSyncModalOpen(false)} />
      )}

      {roadmapOpen && (
        <ExportCardModal onClose={() => setRoadmapOpen(false)} filename="taskfolio-semester-roadmap">
          <SemesterRoadmapCard courses={courses} exams={exams} />
        </ExportCardModal>
      )}

      <WelcomeVideoModal open={introOpen} onClose={closeIntro} />
      <AddToHomeScreenPrompt trigger={introClosedCount} />
      <FeedbackButton />
    </div>
  );
}
