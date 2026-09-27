import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Assignment, Course, Exam, StudyBlock } from "@/types";

type TaskState = {
  courses: Course[];
  assignments: Assignment[];
  exams: Exam[];
  studyBlocks: StudyBlock[];
  hasHydrated: boolean;
  wallpaperDataUrl: string | null;

  addCourse: (course: Omit<Course, "id">) => void;
  removeCourse: (id: string) => void;

  addAssignment: (assignment: Omit<Assignment, "id" | "status">) => void;
  removeAssignment: (id: string) => void;
  toggleAssignmentDone: (id: string) => void;

  addExam: (exam: Omit<Exam, "id">) => void;
  removeExam: (id: string) => void;

  addStudyBlock: (block: Omit<StudyBlock, "id">) => void;
  removeStudyBlock: (id: string) => void;

  setHasHydrated: () => void;

  setWallpaper: (dataUrl: string) => void;
  clearWallpaper: () => void;
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      courses: [],
      assignments: [],
      exams: [],
      studyBlocks: [],
      hasHydrated: false,
      wallpaperDataUrl: null,

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

      setHasHydrated: () => set({ hasHydrated: true }),

      setWallpaper: (dataUrl) => set({ wallpaperDataUrl: dataUrl }),
      clearWallpaper: () => set({ wallpaperDataUrl: null }),
    }),
    {
      name: "ultimatetaskmanager-storage",
      partialize: (s) => ({
        courses: s.courses,
        assignments: s.assignments,
        exams: s.exams,
        studyBlocks: s.studyBlocks,
        wallpaperDataUrl: s.wallpaperDataUrl,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated();
      },
    }
  )
);
