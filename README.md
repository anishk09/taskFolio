# taskFolio

> **Academic Portfolio & Task Archive** — An intentional, museum-grade academic task manager built to balance university coursework, exams, and career priorities without administrative clutter.

Live deployment: [taskfol.io](https://www.taskfol.io/)

---

## Key Features

### 1. Zero-Friction Feed Ingestion
- **Universal Institutional Feeds:** Ingest `.ics` subscription calendar links directly from Canvas LMS and Google Classroom.
- **Automated Metadata Parsing:** Automatically strips course index junk, normalizes course codes, and surfaces recurring class meeting times.
- **Client-First Persistence:** Runs out of `localStorage` with zero mandatory account sign-ups or OAuth friction.

### 2. Weighted Academic Triage
- **Algorithmic Priority Queue:** Ranks deliverables using proximity and syllabus percentage weights rather than plain chronological order.
- **Workload & Pacing Engine:** Real-time visual progress bars tracking completion percentages across enrolled subjects.
- **Upcoming Exam Horizon:** Dedicated exam countdown counters highlighting preparation status and days remaining.
- **What-If Grade & GPA Forecaster:** Target final exam calculator and live semester GPA dial.

### 3. Museum-Grade Design & Atmosphere
- **Classical Canvas Backdrop:** Glassmorphism components (`backdrop-blur-md`) set against Claude Monet's *Water Lilies*.
- **Fine-Art Calendar Frieze:** 7-day rolling horizon strip featuring oil-pigment workload dots and interactive date-filtering.
- **Collectible Milestone Cards:** High-contrast 9:16 achievement cards pairing completed queues with public-domain masterpieces, curator facts, and instant clipboard export.

---

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (`localStorage` persistence)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev)
- **Visual Export:** `html-to-image` (2x retina canvas capture)
- **Payload Compression:** `pako` (zlib/base64url state serialization)

---

## License

MIT License. Built for students, by students.
