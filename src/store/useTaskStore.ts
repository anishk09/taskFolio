import { create } from "zustand";
import { persist } from "zustand/middleware";
import { customAlphabet } from "nanoid";
import type { Assignment, Course, Exam, Meeting, StudyBlock, Todo } from "@/types";

const SYNC_KEY_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
const nanoid12 = customAlphabet(SYNC_KEY_ALPHABET, 12);

// Grouped like a license key (e.g. "v9k2-m4q8-p1z7") so it reads cleanly off
// a screen when a user types it by hand instead of scanning the QR code.
function generateSyncKey(): string {
  const raw = nanoid12();
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

export type MilestoneClear = { date: string; paletteIndex: number; phraseIndex: number };

export type VaultPayload = {
  courses?: Course[];
  assignments?: Assignment[];
  exams?: Exam[];
  studyBlocks?: StudyBlock[];
  todos?: Todo[];
  meetings?: Meeting[];
  milestoneClears?: MilestoneClear[];
  queueOrder?: string[] | null;
};

type TaskState = {
  courses: Course[];
  assignments: Assignment[];
  exams: Exam[];
  studyBlocks: StudyBlock[];
  todos: Todo[];
  meetings: Meeting[];
  hasHydrated: boolean;
  wallpaperDataUrl: string | null;
  // One entry per distinct "YYYY-MM-DD" day every task was cleared, each
  // locked to the masterpiece palette + celebration phrase shown that day.
  // Recording a date that's already present is a no-op (keeping its
  // original indices), so reopening the card or toggling a task on/off
  // within the same day can never inflate the streak or reroll the
  // artwork/phrase — both only change the next time a genuinely new day's
  // full clear is recorded.
  milestoneClears: MilestoneClear[];
  // This device's Magic Vault sync key — generated once on first load and
  // persisted, or replaced with another device's key after a QR pairing
  // hydration so both devices thereafter sync to the same cloud record.
  syncKey: string | null;
  // Manual Priority Queue ranking (assignment ids). null = auto priority sort.
  queueOrder: string[] | null;

  addCourse: (course: Omit<Course, "id">) => void;
  removeCourse: (id: string) => void;
  updateCourse: (id: string, patch: Partial<Pick<Course, "name" | "code" | "professor" | "color">>) => void;

  addAssignment: (assignment: Omit<Assignment, "id" | "status">) => void;
  removeAssignment: (id: string) => void;
  toggleAssignmentDone: (id: string) => void;
  updateAssignment: (
    id: string,
    patch: Partial<Pick<Assignment, "title" | "courseId" | "dueDate" | "weightPct">>
  ) => void;

  addExam: (exam: Omit<Exam, "id">) => void;
  removeExam: (id: string) => void;

  addStudyBlock: (block: Omit<StudyBlock, "id">) => void;
  removeStudyBlock: (id: string) => void;

  addMeeting: (meeting: Omit<Meeting, "id">) => void;
  removeMeeting: (id: string) => void;

  setQueueOrder: (ids: string[]) => void;
  resetQueueOrder: () => void;

  addTodo: (title: string, dueDate?: string, dueTime?: string) => void;
  removeTodo: (id: string) => void;
  toggleTodoDone: (id: string) => void;
  reorderTodos: (pendingIds: string[]) => void;

  setHasHydrated: () => void;

  setWallpaper: (dataUrl: string) => void;
  clearWallpaper: () => void;

  recordMilestoneClear: (dateKey: string, paletteIndex: number, phraseIndex: number) => void;

  hydrateFromRemote: (payload: VaultPayload, syncKey: string) => void;
  ensureSyncKey: () => void;

  clearAllData: () => void;
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      courses: [],
      assignments: [],
      exams: [],
      studyBlocks: [],
      todos: [],
      meetings: [],
      hasHydrated: false,
      wallpaperDataUrl: null,
      milestoneClears: [],
      syncKey: null,
      queueOrder: null,

      addCourse: (course) =>
        set((s) => ({ courses: [...s.courses, { ...course, id: crypto.randomUUID() }] })),
      updateCourse: (id, patch) =>
        set((s) => ({ courses: s.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
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

      updateAssignment: (id, patch) =>
        set((s) => ({ assignments: s.assignments.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),

      addExam: (exam) =>
        set((s) => ({ exams: [...s.exams, { ...exam, id: crypto.randomUUID() }] })),
      removeExam: (id) => set((s) => ({ exams: s.exams.filter((e) => e.id !== id) })),

      addStudyBlock: (block) =>
        set((s) => ({
          studyBlocks: [...s.studyBlocks, { ...block, id: crypto.randomUUID() }],
        })),
      removeStudyBlock: (id) =>
        set((s) => ({ studyBlocks: s.studyBlocks.filter((b) => b.id !== id) })),

      addMeeting: (meeting) =>
        set((s) => ({ meetings: [...s.meetings, { ...meeting, id: crypto.randomUUID() }] })),
      removeMeeting: (id) => set((s) => ({ meetings: s.meetings.filter((m) => m.id !== id) })),

      setQueueOrder: (ids) => set({ queueOrder: ids }),
      resetQueueOrder: () => set({ queueOrder: null }),

      addTodo: (title, dueDate, dueTime) =>
        set((s) => ({
          todos: [
            ...s.todos,
            { id: crypto.randomUUID(), title, done: false, createdAt: new Date().toISOString(), dueDate, dueTime },
          ],
        })),
      removeTodo: (id) => set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),
      toggleTodoDone: (id) =>
        set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
      // Only pending todos are visible/draggable, so the new pending order is
      // laid down first and completed (hidden) ones ride behind it.
      reorderTodos: (pendingIds) =>
        set((s) => {
          const byId = new Map(s.todos.map((t) => [t.id, t]));
          const ordered = pendingIds.map((id) => byId.get(id)).filter((t): t is Todo => !!t);
          const rest = s.todos.filter((t) => !pendingIds.includes(t.id));
          return { todos: [...ordered, ...rest] };
        }),

      setHasHydrated: () => set({ hasHydrated: true }),

      setWallpaper: (dataUrl) => set({ wallpaperDataUrl: dataUrl }),
      clearWallpaper: () => set({ wallpaperDataUrl: null }),

      recordMilestoneClear: (dateKey, paletteIndex, phraseIndex) =>
        set((s) =>
          s.milestoneClears.some((c) => c.date === dateKey)
            ? s
            : { milestoneClears: [...s.milestoneClears, { date: dateKey, paletteIndex, phraseIndex }] }
        ),

      hydrateFromRemote: (payload, syncKey) =>
        set(() => ({
          courses: payload.courses ?? [],
          assignments: payload.assignments ?? [],
          exams: payload.exams ?? [],
          studyBlocks: payload.studyBlocks ?? [],
          todos: payload.todos ?? [],
          meetings: payload.meetings ?? [],
          milestoneClears: payload.milestoneClears ?? [],
          queueOrder: payload.queueOrder ?? null,
          syncKey,
        })),

      // Idempotent: a no-op once a key exists, so it's safe to call
      // unconditionally from a mount effect regardless of render timing.
      ensureSyncKey: () => set((s) => (s.syncKey ? s : { syncKey: generateSyncKey() })),

      // Full reset. Keeps the device's syncKey so the (now-empty) state
      // still syncs to the same cloud record instead of orphaning it.
      clearAllData: () =>
        set({
          courses: [],
          assignments: [],
          exams: [],
          studyBlocks: [],
          todos: [],
          meetings: [],
          milestoneClears: [],
          queueOrder: null,
          wallpaperDataUrl: null,
        }),
    }),
    {
      name: "ultimatetaskmanager-storage",
      partialize: (s) => ({
        courses: s.courses,
        assignments: s.assignments,
        exams: s.exams,
        studyBlocks: s.studyBlocks,
        todos: s.todos,
        meetings: s.meetings,
        wallpaperDataUrl: s.wallpaperDataUrl,
        milestoneClears: s.milestoneClears,
        syncKey: s.syncKey,
        queueOrder: s.queueOrder,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated();
      },
    }
  )
);

// Pushes the current vault-relevant state to the cloud immediately (no
// debounce). Exported so call sites that need the record to exist right
// away — e.g. opening the QR pairing modal — don't have to wait on a state
// change to trigger the subscribe-based debounce below, which otherwise
// never fires for a brand-new device that hasn't mutated anything yet.
export function pushVaultToCloud(): Promise<void> {
  const s = useTaskStore.getState();
  if (!s.syncKey) return Promise.resolve();
  const payload: VaultPayload = {
    courses: s.courses,
    assignments: s.assignments,
    exams: s.exams,
    studyBlocks: s.studyBlocks,
    todos: s.todos,
    meetings: s.meetings,
    milestoneClears: s.milestoneClears,
    queueOrder: s.queueOrder,
  };
  return fetch(`/api/sync/${s.syncKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload }),
  })
    .then(() => undefined)
    .catch(() => undefined);
}

// Lets a device cut off a leaked/compromised sync key: the old key's cloud
// record is deleted (so anyone still holding it gets a 404), a fresh key is
// generated and adopted immediately, and the current state is pushed to it
// right away so the new key is usable without waiting on the next mutation.
export async function regenerateSyncKey(): Promise<void> {
  const oldKey = useTaskStore.getState().syncKey;
  useTaskStore.setState({ syncKey: generateSyncKey() });
  if (oldKey) {
    fetch(`/api/sync/${oldKey}`, { method: "DELETE" }).catch(() => {});
  }
  await pushVaultToCloud();
}

// Auto-sync: any change to the vault-relevant slices gets pushed to the
// cloud after a 1.5s debounce so rapid edits (e.g. checking off several
// items) collapse into one request instead of one per mutation.
if (typeof window !== "undefined") {
  let syncTimer: ReturnType<typeof setTimeout> | null = null;
  useTaskStore.subscribe((state, prev) => {
    if (!state.hasHydrated || !state.syncKey) return;
    const changed =
      state.courses !== prev.courses ||
      state.assignments !== prev.assignments ||
      state.exams !== prev.exams ||
      state.studyBlocks !== prev.studyBlocks ||
      state.todos !== prev.todos ||
      state.meetings !== prev.meetings ||
      state.milestoneClears !== prev.milestoneClears ||
      state.queueOrder !== prev.queueOrder;
    if (!changed) return;

    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(pushVaultToCloud, 1500);
  });
}
