import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Assignment, Course, Exam, StudyBlock, Todo } from "@/types";

type TaskState = {
  courses: Course[];
  assignments: Assignment[];
  exams: Exam[];
  studyBlocks: StudyBlock[];
  todos: Todo[];
  hasHydrated: boolean;
  wallpaperDataUrl: string | null;
  // One entry per distinct "YYYY-MM-DD" day every task was cleared, each
  // locked to the masterpiece palette + celebration phrase shown that day.
  // Recording a date that's already present is a no-op (keeping its
  // original indices), so reopening the card or toggling a task on/off
  // within the same day can never inflate the streak or reroll the
  // artwork/phrase — both only change the next time a genuinely new day's
  // full clear is recorded.
  milestoneClears: { date: string; paletteIndex: number; phraseIndex: number }[];

  addCourse: (course: Omit<Course, "id">) => void;
  removeCourse: (id: string) => void;

  addAssignment: (assignment: Omit<Assignment, "id" | "status">) => void;
  removeAssignment: (id: string) => void;
  toggleAssignmentDone: (id: string) => void;

  addExam: (exam: Omit<Exam, "id">) => void;
  removeExam: (id: string) => void;

  addStudyBlock: (block: Omit<StudyBlock, "id">) => void;
  removeStudyBlock: (id: string) => void;

  addTodo: (title: string) => void;
  removeTodo: (id: string) => void;
  toggleTodoDone: (id: string) => void;

  setHasHydrated: () => void;

  setWallpaper: (dataUrl: string) => void;
  clearWallpaper: () => void;

  recordMilestoneClear: (dateKey: string, paletteIndex: number, phraseIndex: number) => void;
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      courses: [],
      assignments: [],
      exams: [],
      studyBlocks: [],
      todos: [],
      hasHydrated: false,
      wallpaperDataUrl: null,
      milestoneClears: [],

      addCourse: (course) =>
        set((s) => ({ courses: [...s.courses, { ...course, id: crypto.randomUUID() }] })),
      removeCourse: (id) =>
        set((s) => ({
          courses: s.courses.filter((c) => c.id !== id),
          assignments: s.assignments.filter((a) => a.courseId !== id),
          exams: s.exams.filter((e) => e.courseId !== id),
          studyBlocks: s.studyBlocks.filter((b) => b.courseId !== id),
        })),

      addAssignment: (assignment) =>
        set((s) => ({
          assignments: [
            ...s.assignments,
            { ...assignment, id: crypto.randomUUID(), status: "todo" },
          ],
        })),
      removeAssignment: (id) =>
        set((s) => ({ assignments: s.assignments.filter((a) => a.id !== id) })),
      toggleAssignmentDone: (id) =>
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === id
              ? a.status === "done"
                ? { ...a, status: "todo", completedAt: undefined }
                : { ...a, status: "done", completedAt: new Date().toISOString() }
              : a
          ),
        })),

      addExam: (exam) =>
        set((s) => ({ exams: [...s.exams, { ...exam, id: crypto.randomUUID() }] })),
      removeExam: (id) => set((s) => ({ exams: s.exams.filter((e) => e.id !== id) })),

      addStudyBlock: (block) =>
        set((s) => ({
          studyBlocks: [...s.studyBlocks, { ...block, id: crypto.randomUUID() }],
        })),
      removeStudyBlock: (id) =>
        set((s) => ({ studyBlocks: s.studyBlocks.filter((b) => b.id !== id) })),

      addTodo: (title) =>
        set((s) => ({
          todos: [...s.todos, { id: crypto.randomUUID(), title, done: false, createdAt: new Date().toISOString() }],
        })),
      removeTodo: (id) => set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),
      toggleTodoDone: (id) =>
        set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),

      setHasHydrated: () => set({ hasHydrated: true }),

      setWallpaper: (dataUrl) => set({ wallpaperDataUrl: dataUrl }),
      clearWallpaper: () => set({ wallpaperDataUrl: null }),

      recordMilestoneClear: (dateKey, paletteIndex, phraseIndex) =>
        set((s) =>
          s.milestoneClears.some((c) => c.date === dateKey)
            ? s
            : { milestoneClears: [...s.milestoneClears, { date: dateKey, paletteIndex, phraseIndex }] }
        ),
    }),
    {
      name: "ultimatetaskmanager-storage",
      partialize: (s) => ({
        courses: s.courses,
        assignments: s.assignments,
        exams: s.exams,
        studyBlocks: s.studyBlocks,
        todos: s.todos,
        wallpaperDataUrl: s.wallpaperDataUrl,
        milestoneClears: s.milestoneClears,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated();
      },
    }
  )
);
