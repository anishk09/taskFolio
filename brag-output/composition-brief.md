# Hyperframes Composition Brief: taskFolio

## Objective
Create a short launch-style brag video for taskFolio, a university task manager styled as a museum-wall-label dashboard over a real Claude Monet "Water Lilies" painting.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 18s (acceptable range 17.5-19s)

## Source Material
- Project root: `/Users/anishkothapalli/ultimatetaskmanager`
- Primary files read: `src/app/page.tsx`, `src/app/globals.css`, `src/app/layout.tsx`, `src/components/dashboard/PriorityQueue.tsx`, `src/components/dashboard/WorkloadRing.tsx`, `src/components/dashboard/GlowRing.tsx`, `src/components/dashboard/CourseFilterBar.tsx`, `src/lib/palette.ts`, `package.json`, `SPEC.md`, `public/art/monet-lilies.jpg`
- Product name: taskFolio
- Tagline / strongest claim: "Built by students, for students." (real footer copy) paired with the real background-art credit, "Artwork: 'Water Lilies' by Claude Monet"
- Key UI or visual moment to recreate: the frosted "rijks-card" glass panel (translucent white, heavy blur/saturate, soft shadow, rounded corners) floating directly over the real Monet Water Lilies painting — every scene with UI should keep this glass-on-canvas layering visible
- Copy that must appear verbatim:
  - "taskFolio." (wordmark, with the period rendered in accent lavender `#8B7EC8`)
  - "Fall 2026" (nav badge)
  - "Built by students, for students."
  - "Artwork: 'Water Lilies' by Claude Monet"
  - The invented museum-plaque hook lines are original to this video, not app copy: "Water Lilies, 1906 — Claude Monet." → "Water Lilies, 2026 — Your Homework."

## Creative Direction
- Tone preset: `default`
- Creative direction: museum-wall-label voice cataloguing a task manager like a masterpiece
- Interpretation: playful but not silly. Comfortable pacing (5 scenes, each line gets a full read-hold). Typography uses the app's own real display font and lavender accent — do not invent a separate "museum serif." The joke lands entirely through the plaque-relabel device in Scene 1 and the closing credit-line callback in Scene 5, delivered deadpan rather than mugged.
- Angle: The joke is played completely straight — a to-do app for problem sets and midterms, art-directed like it belongs in the Rijksmuseum. Frosted-glass cards float over an actual Monet painting; a due-date badge sits where a wall-label date would go. The video catalogues the product the way a museum catalogues a painting, then reveals it's (extremely well-dressed) homework software.
- Hook: Full-bleed real Monet Water Lilies painting. A museum plaque reads "Water Lilies, 1906 — Claude Monet," holds, then relabels in place to "Water Lilies, 2026 — Your Homework."
- Outro / punchline: Back to the full painting alone. "taskFolio." wordmark settles center-frame, "Built by students, for students." beneath it, then the smaller closing line "Artwork: 'Water Lilies' by Claude Monet" — the video literally pays the credit the app itself gives.
- Avoid:
  - Generic SaaS language ("streamline your workflow," etc.)
  - Abstract filler visuals — every scene shows real app chrome, real copy, or the real painting
  - Any visual redesign of the product — recreate what's actually on screen (colors, fonts, card treatment, wordmark) rather than inventing a new look

## Visual Identity
- Background: `#12131a` base, with the real painting `public/art/monet-lilies.jpg` full-bleed under a `rgba(18,20,28,0.25) → rgba(18,20,28,0.45)` top-to-bottom dark gradient overlay, exactly as the live site composites it
- Text: `#1a1b22` near-black ink on the frosted glass cards; `#5D4E9E` deep-lavender for small accent labels; muted gray (zinc-600-equivalent, roughly `#52525b`) for secondary captions
- Accent: `#8B7EC8` lavender (primary — wordmark period, buttons, active pill state, ring glow), gradient partner `#6C86D6` periwinkle (ring/glow gradient end), warm gold `#D9B454` / `#E8C468` for the "OVERDUE"/due-soon badge and the gold-leaf completion bloom
- Display font: Plus Jakarta Sans, bold, tight tracking (matches the real nav wordmark)
- Body font: Plus Jakarta Sans, regular
- Visual references from the project:
  - `.rijks-card`: `rgba(255,255,255,0.72)` fill, `blur(24px) saturate(180%)` backdrop-filter, `1px solid rgba(255,255,255,0.85)` border, soft dual box-shadow, `1.25rem` radius
  - Nav wordmark: "taskFolio" in bold dark ink + a lavender "." + a small pill badge "Fall 2026" in lavender-tinted background/text
  - Course pill: small colored dot + truncated course name in a rounded pill, active state gets a tinted lavender/accent border+fill
  - Priority Queue row: colored course dot + pill, "% of grade" caption, right-aligned rounded due-badge (gold for overdue/soon, green for safe)
  - GlowRing: two concentric SVG rings — a soft blurred glow duplicate behind a crisp lavender→periwinkle gradient arc, percentage number centered, small caption label beneath

## Storyboard
Use the full storyboard in `brag-output/brag-plan.md` as the creative contract. Scene summary:

1. Museum plaque hook — 3s — full-bleed real Water Lilies painting; plaque reads "Water Lilies, 1906 — Claude Monet," holds, relabels to "Water Lilies, 2026 — Your Homework."
2. Dashboard reveal — 3s — same painting; frosted nav bar materializes with "taskFolio." wordmark + "Fall 2026" badge, then 2-3 course pills pop in one by one (colored dot + truncated real course name).
3. Priority Queue + completion — 5s — 3 frosted assignment rows stagger in (course pill, % of grade, due badge incl. one "OVERDUE" gold chip); cursor checks the top row → checkbox tick → gold-leaf bloom flecks outward → title strike-through fade → row glides out.
4. Workload rings — 3.5s — two lavender→periwinkle gradient rings arc-fill smoothly from empty (native stroke-dashoffset-style motion, no snap), percentage counting up inside each, real course names truncating beneath.
5. Outro plaque — 3.5s — cut back to the full painting alone; "taskFolio." wordmark settles center, "Built by students, for students." beneath, then smaller closing line "Artwork: 'Water Lilies' by Claude Monet."

## Audio
- Audio role: warm, light bed — playful and clean, never aggressive (`default` tone, moderate SFX energy)
- Audio arc: fades in under the Scene 1 plaque swap, sits at a comfortable mid volume through the reveal and highlights, ducks slightly under the Scene 5 wordmark/tagline, clean fade-out under the final credit line — no hard stop
- Music: `assets/music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3` (already copied into `composition/assets/music/`)
- Music treatment: volume ~0.3-0.4 through Scenes 1-4, easing down under Scene 5's dialogue-like lines, full fade-out by the end of the closing credit line
- Music cue guidance: bundled preset at `<skill-dir>/assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.json` (also summarized in the matching `.md`). Tempo ~120 BPM. Usable beat grid inside our ~18s runtime: 3.02, 3.52, 4.02, 4.53, 5.03, 5.53, 6.03, 6.52, 7.02, 7.52, 8.02, 8.52, 9.02, 9.52, 10.02, 10.52, 11.02, 11.52, 12.02, 12.52, 13.01, 13.51, 14.02, 14.52, 15.02, 15.52, 16.02, 16.52, 17.02, 17.52. Suggested (optional, ±0.15s for majors / ±0.10s for small entrances): Scene1→2 cut near 3.02s; Scene2 pill reveals near 4.53/5.03/5.53; Scene3 row-stagger near 6.52/7.02/7.52 and the checkbox-check payoff near 9.02-9.52; Scene3→4 cut near 10.52; ring arc-fills spanning ~11.02-13.51; Scene4→5 cut near 14.02-14.52. Use at most 1-3 strong-cue locks (the checkbox-check payoff is the best candidate); everything else is a soft snap target only — ignore any of these that hurt readability or pacing.
- Audio-reactive treatment: subtle — the GlowRing's soft outer glow/blur layer and the gold-leaf bloom's brightness may breathe slightly with music RMS/energy. No waveform bars, no equalizer graphics, no strobing.
- Audio-coupled moments:
  - Scene 2 — course pill pop-ins — soft tick per pill arrival
  - Scene 3 — row stagger-in — soft tick per row; brighter chime exactly on the checkbox-check + gold-leaf bloom (this is the video's one clear "success" beat)
  - Scene 4 — ring arc-fills — rising whoosh under each fill, resolving to a soft ding as each ring settles
  - Scene 5 — no coupled SFX; let the music's natural fade carry the close
- SFX selection guidance: keep it to a coherent, restrained palette (`default` tone = moderate, 3-5 SFX total). Card/pop-in family (e.g. `interface/drop_*` or `casino/card-place-*`) for pill/row arrivals, one clear success cue (e.g. `impact/impactBell_heavy_000` or `casino/chips-collide-*`) for the checkbox-check/bloom payoff, a soft whoosh-to-ding pairing for the ring fills. Match sounds to the gesture shown, not just the tone table.
- SFX analysis guidance: read `<skill-dir>/assets/sfx/sfx-analysis.md` / `.json`; prefer low/medium high-frequency-risk files since several moments (pill pop-ins, row stagger) repeat multiple times in a short window.
- Exact SFX choice: Hyperframes should choose exact filenames, timestamps, density, and volume once the animation timing is implemented.
- Audio files: music already copied to `brag-output/composition/assets/music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3`. Copy any selected SFX into `brag-output/composition/assets/sfx/<family>/` before referencing them.

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core` (composition contract + `data-*` timing), `hyperframes-animation` (motion), `hyperframes-creative` (design spec, beats, audio-reactive), `hyperframes-keyframes` (seek-safe keyframes), and `hyperframes-cli` (lint/check/render). `/brag` is its own workflow: do not enter the `hyperframes` entry-point intent interview and do not route into its generic promo / launch-video workflow. Prefer native Hyperframes conventions over anything in `/brag`.

Requirements:
- Show at least one real UI, copy, or visual element from the source project (the frosted-glass dashboard chrome over the real painting, the Priority Queue row, and the GlowRing all qualify — use more than one).
- Keep all text readable in the final render — hold every readable line for its full floor (short label ~0.8s settled, sentence ~0.3s/word) before it starts exiting.
- Keep the video within 15-25 seconds (target 18s).
- Include the planned music/SFX layer — audio was not disabled and silence is not the creative choice here.
- Treat the `/brag` audio notes above as guidance, not a fixed cue sheet — choose exact SFX after the visual animation exists.
- Treat music cue metadata as optional timing hints; ignore any cue that hurts readability, scene pacing, or the product story. Use only 1-3 strong-cue locks in this 18s video.
- Use SFX to support motion and interaction: pop/drop sounds for pill and row reveals, one clear success cue for the checkbox-check + bloom, restrained whoosh/ding for the ring fills.
- Honor the planned music treatment: fade-in under Scene 1, steady mid-volume through Scenes 2-4, duck under Scene 5, full fade-out by the end.
- Consider the Hyperframes audio-reactive workflow for the GlowRing glow and the gold-leaf bloom brightness, staying subtle — no waveform/equalizer visuals, no strobing.
- Use local assets for audio (already staged in `composition/assets/music/`) and any required runtime/media dependencies.
- Run `hyperframes check` before render — it is brag's single gate.
