export type LectureSlot = {
  day: number; // 0-6, Sunday-Saturday
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  location?: string;
};

export type Course = {
  id: string;
  code: string;
  name: string;
  color: string; // hex
  professor: string;
  lectureSlots: LectureSlot[];
  canvasCourseId?: string; // Canvas's own numeric course id, for idempotent re-sync matching
};

export type AssignmentStatus = "todo" | "in-progress" | "done";

export type Assignment = {
  id: string;
  courseId: string;
  title: string;
  dueDate: string; // ISO
  weightPct: number; // 0-100
  status: AssignmentStatus;
  completedAt?: string;
};

export type Exam = {
  id: string;
  courseId: string;
  title: string;
  date: string; // ISO, includes time
};

export type StudyBlock = {
  id: string;
  courseId: string;
  day: number; // 0-6
  start: string; // "HH:MM"
  end: string; // "HH:MM"
};

// General to-do items unrelated to coursework (errands, chores, etc.) —
// no course, weighting, or grade tie-in.
export type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string; // ISO
};
