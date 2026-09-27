# Brag Plan: taskFolio

## What is this app?
taskFolio is an offline-first, university task command center — courses, weighted assignments, exams, and study blocks, auto-sorted into one priority queue — styled like a museum wall label and rendered over a real Claude Monet "Water Lilies" backdrop.

## The angle
The joke is the mismatch played completely straight: a to-do app for problem sets and midterms, art-directed like it belongs in the Rijksmuseum. Frosted-glass "gallery placard" cards float over an actual Monet painting; a due-date badge sits where a wall-label date would go. It's earnest utility with museum-plaque swagger — the video should catalogue the product the way a museum catalogues a painting, then reveal it's just (extremely well-dressed) homework software.

## Hook (first 2-3 seconds)
Full-bleed Monet Water Lilies canvas fills the frame, exactly as it renders as the site's background. A small museum-plaque rectangle fades in center-frame, serif-adjacent label style: **"Water Lilies, 1906 — Claude Monet."** Beat. Then the plaque re-labels itself (same rectangle, text swap) to: **"Water Lilies, 2026 — Your Homework."** That swap is the hook.

## Key moments (the middle)
- The real dashboard chrome materializes over the painting: the "taskFolio." wordmark + "Fall 2026" badge slide into the nav, then course pills (colored dot + truncated course name, e.g. "Intermediate Macro…") pop in one by one.
- Priority Queue: three assignment rows glide in (course pill, colored dot, "% of grade," and a due badge — one reading "OVERDUE" in a warm gold chip). A cursor checks one off — crisp checkbox tick, a gold-leaf bloom flecks outward from the row, the title strikes through, then the row glides away.
- Workload rings: two lavender→periwinkle gradient arcs sweep from empty to filled (stroke-dashoffset style animation, not a jump), with the percentage counting up inside each ring, labeled with the real course names.

## Outro / punchline
Cut back to the full Water Lilies canvas. The "taskFolio." wordmark settles center-frame with its lavender period. Beneath it, in the app's own real footer copy: **"Built by students, for students."** Hold, then a small final line in plaque style: **"Artwork: 'Water Lilies' by Claude Monet."** — the video ends by literally giving the credit the app itself gives on-screen, closing the joke.

## User flow worth showing
Entry → key action → result: a pending assignment sits in the Priority Queue with a live urgency badge → checking it off fires the gold-leaf bloom + strike-through → the Workload ring for that course arcs upward to reflect the newly completed weight. This is the app's real completion loop (PriorityQueue.tsx + GlowRing.tsx), and it's the centerpiece of the middle scenes.

## Tone
- Preset: `default`
- Creative direction: museum-wall-label voice cataloguing a task manager like a masterpiece
- Interpretation: playful but not silly — pacing stays comfortable (4-5 scenes, room to read each plaque line), typography leans on the app's own real display font and lavender accent rather than an invented "museum" font, and the joke is delivered completely deadpan through the label-swap device rather than through mugging or exaggerated motion.

## Format: landscape — 1920x1080
## Duration: 18s target (range 17.5-19s)

## Visual identity (from the project)
- Background: `#12131a` base under the real Monet "Water Lilies" image (`public/art/monet-lilies.jpg`), with a `rgba(18,20,28,0.25→0.45)` dark gradient overlay exactly as the live site applies it.
- Accent: `#8B7EC8` (lavender, primary — buttons/active states/glow), gradient partner `#6C86D6` (periwinkle, rings/glows)
- Text: `#1a1b22` / near-black ink on the frosted glass cards; `#5D4E9E` deep-lavender for small label text; secondary muted `zinc-600`-equivalent gray for captions
- Display font: Plus Jakarta Sans (bold, tight tracking — matches the real nav wordmark treatment)
- Body font: Plus Jakarta Sans (regular)
- Strongest visual element: the frosted "rijks-card" glass panels (`rgba(255,255,255,0.72)` + heavy blur/saturate backdrop-filter, soft shadow, rounded corners) floating directly over the real painting — that glass-on-canvas contrast is the whole visual identity and should appear in every scene.

## Share copy (draft)
We put your syllabus in a museum. taskFolio turns due dates into a Monet-backed dashboard — weighted priority queue, Canvas sync, workload rings that actually feel good to fill in. Built by students, for students.

## Audio direction
- Role: warm, light bed — playful and clean, never aggressive
- Music: `happy-beats-business-moves-vol-1-by-ende-dot-app.mp3` (~120 BPM, bundled preset available)
- Music treatment: fade in under the hook's plaque swap, sit at a comfortable mid volume through the reveal and highlights, duck slightly under the outro's spoken-feeling lines, then a clean fade-out on the final plaque credit — no hard stop.
- Music cue guidance: preset read (`happy-beats-business-moves-vol-1…music-cues.json`). Usable beat grid inside our ~18s runtime: 3.02, 3.52, 4.02, 4.53, 5.03, 5.53, 6.03, 6.52, 7.02, 7.52, 8.02, 8.52, 9.02, 9.52, 10.02, 10.52, 11.02, 11.52, 12.02, 12.52, 13.01, 13.51, 14.02, 14.52, 15.02, 15.52, 16.02, 16.52, 17.02, 17.52. Target the Scene 1→2 cut near 3.02s, the three sequential course-pill/row reveals in Scenes 2-3 near 6.52/7.02/7.52 and 9.02/9.52/10.02, the ring-arc highlight starting near 11.02, and the outro cut near 14.02-14.52 — treat all as soft snap targets, not hard requirements.
- Audio-reactive treatment: subtle — the GlowRing's soft outer glow blur and the gold-leaf bloom's brightness may breathe slightly with music energy; never add waveform bars or literal visualizer elements.
- SFX posture: moderate, motion-matched, restrained (default tone, not chaotic)
- Audio-coupled moments: one soft "tick" per course-pill/queue-row as each glides in; a bright chime on the checkbox-check + gold-leaf bloom; a gentle rising whoosh under each workload ring's arc fill, resolving to a soft ding when it settles.
- Restraint rule: no stock "success fanfare," no dense drops — every hit sits under the music bed and matches something actually moving on screen; the museum mood should read as calm confidence, not a jingle.

## Storyboard

### Scene 1 — Museum plaque hook — 3s
Full-bleed real Monet "Water Lilies" image fills frame (no UI chrome yet). A small plaque rectangle fades in, center-low, in the app's frosted-glass card style: "Water Lilies, 1906 — Claude Monet." Hold 1.2s, then the same plaque relabels in place to "Water Lilies, 2026 — Your Homework."
Sequential/interaction: yes — the plaque text swap is a single beat, not a list; treat as one clean relabel, not multiple reveals.
Audio intent: quiet, curious open; the label swap should land as the "gotcha" beat.
Audio-coupled idea: a soft, dry "page turn" or label-swap tick exactly on the relabel.
Music: bed fades in under the painting.
Transition mood: clean crossfade → Scene 2

### Scene 2 — Dashboard reveal — 3s
The real UI chrome materializes over the same painting: the "taskFolio." wordmark (with its lavender period) and "Fall 2026" badge slide into a frosted nav bar, then 2-3 course pills (colored dot + truncated real course name, e.g. "Intermediate Macro…") pop in one by one beside it.
Sequential/interaction: yes — course pills arrive one at a time, left to right.
Audio intent: bright, assembling — the app "waking up" on top of the painting.
Audio-coupled idea: one soft tick per pill arrival.
Transition mood: soft wipe → Scene 3

### Scene 3 — Priority Queue + completion — 5s
Three frosted assignment rows glide up into a Priority Queue panel (course pill + colored dot, "% of grade," and a due badge — one shows "OVERDUE" in a warm gold chip). A cursor checks the top row: crisp checkbox tick, a gold-leaf bloom flecks outward from the row, the title gets a quick strike-through fade, then the row glides out of the list.
Sequential/interaction: yes — 3 rows stagger in, then the checked row plays its own distinct check → bloom → strike-through → exit sequence.
Audio intent: busy-but-controlled, building toward a small payoff at the check.
Audio-coupled idea: tick per row arrival, then a brighter chime timed to the checkbox tick + bloom.
Transition mood: clean cut → Scene 4

### Scene 4 — Workload rings — 3.5s
Two lavender→periwinkle gradient rings (matching GlowRing's real look) sweep smoothly from empty to filled — a native arc-fill motion, not a snap — with the percentage counting up inside each, labeled with real course names beneath (truncating, "Intermediate Macro…" style).
Sequential/interaction: yes — the two rings fill in a quick stagger, left then right.
Audio intent: satisfying, rounding out the completion loop from Scene 3.
Audio-coupled idea: rising whoosh under each arc fill, resolving to a soft ding as each ring settles.
Transition mood: soft crossfade → Scene 5

### Scene 5 — Outro plaque — 3.5s
Cut back to the full-bleed Water Lilies painting alone. The "taskFolio." wordmark (lavender period) settles center-frame. Beneath it: "Built by students, for students." Hold, then a smaller plaque-style final line: "Artwork: 'Water Lilies' by Claude Monet."
Sequential/interaction: none — one settle, one line reveal, one credit line; each gets its full read-hold, no stagger.
Audio intent: warm settle, quiet confidence — the museum joke closing itself out.
Audio-coupled idea: none beyond the music's natural fade.
Music: bed ducks slightly under the wordmark, fades out fully by the end of the credit line.
Transition mood: soft fade → end

**Music mood for this video:** upbeat (light, clean, playful — not chaotic or dense)
**Audio summary:** A warm, light business-pop bed carries the whole video at a comfortable volume, with soft ticks marking each sequential UI reveal, a brighter chime at the task-completion payoff, a rising whoosh-to-ding under the workload rings, and a gentle fade-out under the closing museum-credit line.
