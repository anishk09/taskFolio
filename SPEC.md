# ultimateTaskManager — Spec

## 1. Objective

A single-page, university-focused task command center. One active semester's
courses, assignments, exams, and recurring study blocks live in a dark,
high-fidelity dashboard. Everything is client-side and offline-first (Zustand
+ localStorage) so it works with zero latency between classes, no backend, no
auth, no multi-user concerns.

Non-goals (explicitly out of scope for v1): multi-semester archiving,
accounts/sync, multi-page navigation, notifications/reminders, mobile app,
calendar-service integration.

## 2. Domain model

```ts
type Course = {
  id: string;
  code: string;        // "CS 3510"
  name: string;
  color: string;        // tailwind-safe hex, user-picked tag color
  professor: string;
  lectureSlots: { day: 0-6; start: "HH:MM"; end: "HH:MM"; location?: string }[];
};

type Assignment = {
  id: string;
  courseId: string;
  title: string;
  dueDate: string;       // ISO
  weightPct: number;     // 0-100, % of final grade
  status: "todo" | "in-progress" | "done";
  completedAt?: string;
};

type Exam = {
  id: string;
  courseId: string;
  title: string;
  date: string;          // ISO, includes time
};

type StudyBlock = {
  id: string;
  courseId: string;
  day: 0-6;
  start: "HH:MM";
  end: "HH:MM";
  recurring: true;       // v1 only supports weekly-recurring blocks
};
```

All four collections live in one Zustand store (`useTaskStore`), persisted
whole via the `persist` middleware to `localStorage` under one key. No
per-entity stores — one course/assignment/exam/study-block CRUD action set is
enough.

## 3. Priority scoring (weighted score, decided)

```
priorityScore = weightPct * urgencyMultiplier(daysRemaining)

urgencyMultiplier:
  daysRemaining < 0        -> 5    (overdue)
  0 <= daysRemaining <= 2  -> 4
  3 <= daysRemaining <= 7  -> 2.5
  8 <= daysRemaining <= 14 -> 1.5
  daysRemaining > 14       -> 1
```

Pure function in `src/lib/priority.ts`, no React/DOM dependency. This is a
naive tiered heuristic, not a real scheduling model — mark it with a
`ponytail:` comment noting the ceiling (doesn't account for estimated effort
or task dependencies) and the upgrade path if it's ever needed.

The dashboard's "priority matrix" widget is a sorted list/bar view driven by
this score (highest first), not a manual drag-drop quadrant.

## 4. Pages / navigation

Single route: `/` (the dashboard). No other routes. Sections on the page:

- Header: current date, semester label.
- Course strip: color-tagged course chips (code, professor, next lecture slot).
- Priority queue: assignments sorted by `priorityScore` desc, checkbox to
  mark done → triggers `canvas-confetti` burst + Framer Motion exit animation.
- Exam countdowns: live-updating countdown cards, one per upcoming exam.
- Weekly study schedule: recurring study blocks + lecture slots on a simple
  7-day grid.
- Workload rings: one ring per course = (done weightPct) / (total weightPct)
  for that course's assignments, animated with Framer Motion.

## 5. Visual/tech requirements (already decided, not open questions)

- Next.js App Router (already scaffolded), Tailwind CSS v4, Lucide icons.
- Framer Motion for layout/enter/exit animation (list reflow, ring fill).
- `canvas-confetti` fired once per assignment marked done (not on undo).
- Dark cyber/minimalist palette: near-black background, per-course accent
  colors, high-contrast text (WCAG AA minimum — verify with
  web-design-guidelines skill before merge).
- Zustand `persist` → localStorage, hydration-safe (guard SSR/client mismatch
  per Next 16's App Router rules — check `node_modules/next/dist/docs/` for
  current hydration guidance before writing store-consuming components, per
  AGENTS.md).

## 6. Project structure

```
src/
  app/
    layout.tsx
    page.tsx                 # dashboard, composes the sections below
    globals.css
  components/
    dashboard/
      CourseStrip.tsx
      PriorityQueue.tsx
      ExamCountdownCard.tsx
      WeeklySchedule.tsx
      WorkloadRing.tsx
    ui/                       # shared primitives only if >1 section needs them
  store/
    useTaskStore.ts            # zustand store: courses/assignments/exams/studyBlocks + actions, persisted
  lib/
    priority.ts                 # computePriorityScore, urgencyMultiplier
    date.ts                     # countdown formatting, daysRemaining
    confetti.ts                 # thin wrapper around canvas-confetti with fixed config
  types/
    index.ts                    # Course/Assignment/Exam/StudyBlock types above
```

No API routes, no server components beyond the default layout shell — this
is a fully client-rendered dashboard (`"use client"` at the page level).

## 7. Code style

- Follow existing repo conventions: TypeScript strict, Tailwind utility
  classes (no CSS modules), functional components, no class components.
- Pure logic (`lib/priority.ts`, `lib/date.ts`) stays framework-free — no
  React imports — so it stays trivially testable and reusable.
- No new state-management abstraction beyond the one Zustand store; no
  repository/service layer for a localStorage-only app.
- Reuse Tailwind's built-in dark mode / color utilities before hand-rolling
  a theme system.

## 8. Testing strategy

- `lib/priority.ts` and `lib/date.ts` are the only non-trivial logic (branches
  on time). Each gets one colocated self-check (`priority.test.ts`,
  `date.test.ts`) using Node's built-in `node:test` + `node:assert`.
- Node 20 has no native TS stripping, so running these needs a zero-config TS
  runner — add `tsx` as the one new devDependency
  (`npx tsx --test src/lib/*.test.ts`). This is the only new dependency this
  spec introduces; everything else is already installed.
- No component/e2e test framework for v1 — this is a personal-use tool, not
  a multi-team codebase; add Playwright/RTL later only if regressions show up.
- Manually verify in-browser: task completion → confetti + ring update,
  countdown accuracy, localStorage persistence across reload.

## 9. Boundaries

**Always do:**
- Keep everything client-side; never introduce a backend/API route/DB for
  this scope.
- Check `node_modules/next/dist/docs/` for current App Router / hydration
  patterns before writing Next-specific code (per AGENTS.md — this Next
  version has breaking changes vs. training data).
- Run `graphify update .` after code changes, since this project's CLAUDE.md
  wires up graphify.

**Ask first about:**
- Adding any dependency beyond `tsx` (the one test-runner addition above).
- Any change that would require a backend, auth, or multi-semester data
  model — that's a scope change, not an implementation detail.

**Never do:**
- Don't add multi-page routing, notifications, or accounts — explicitly out
  of scope per section 1.
- Don't build a drag-drop Eisenhower quadrant UI — priority is the computed
  score from section 3, decided over the manual-quadrant alternative.
- Don't add a testing framework (Vitest/Jest/Playwright) beyond `node:test` —
  not warranted at this scope.
