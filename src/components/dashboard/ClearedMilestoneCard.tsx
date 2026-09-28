"use client";

import { useEffect, useState } from "react";
import { Check, Crown } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { localDateKey } from "@/lib/date";
import { MASTERPIECE_PALETTES, pickRandomPaletteIndex } from "@/lib/masterpiecePalettes";
import { CELEBRATION_PHRASES, pickRandomCelebrationPhraseIndex } from "@/lib/celebrationPhrases";
import { playAchievementChime } from "@/lib/chime";

const STEPS = [1, 2, 3, 4, 5];

export function ClearedMilestoneCard() {
  const courses = useTaskStore((s) => s.courses);
  const assignments = useTaskStore((s) => s.assignments);
  const clears = useTaskStore((s) => s.milestoneClears);
  const recordMilestoneClear = useTaskStore((s) => s.recordMilestoneClear);

  const [acquisitionNo] = useState(() => String(100 + Math.floor(Math.random() * 900)));

  const now = new Date();
  const todayKey = localDateKey(now);
  const existingToday = clears.find((c) => c.date === todayKey);
  // Artwork AND the celebration phrase are both locked per calendar day: if
  // today's clear was already recorded (e.g. reopening the card, or
  // toggling a task on/off), reuse its stored indices. A new painting/phrase
  // only appears the first time a genuinely new day's full clear is
  // recorded — captured once so neither can reroll on re-renders, even
  // before the effect below commits.
  const [paletteIndexForToday] = useState(() => existingToday?.paletteIndex ?? pickRandomPaletteIndex());
  const [phraseIndexForToday] = useState(() => existingToday?.phraseIndex ?? pickRandomCelebrationPhraseIndex());
  const palette = MASTERPIECE_PALETTES[paletteIndexForToday];
  const celebrationPhrase = CELEBRATION_PHRASES[phraseIndexForToday];

  // Recording is idempotent per calendar day (existing entries keep their
  // original indices), so re-opening the card or toggling a task on/off
  // within the same day can never move the stepper or reroll the
  // artwork/phrase. Today's entry is included here even before the effect
  // commits, so the displayed step count is correct on the very first
  // render (no post-mount jump).
  const effectiveClears = existingToday
    ? clears
    : [...clears, { date: todayKey, paletteIndex: paletteIndexForToday, phraseIndex: phraseIndexForToday }];
  const totalClearDays = effectiveClears.length;
  const filledSteps = ((totalClearDays - 1) % 5) + 1;

  useEffect(() => {
    recordMilestoneClear(todayKey, paletteIndexForToday, phraseIndexForToday);
    playAchievementChime();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- record today's clear + play the chime once per card open, not on every store update.
  }, []);

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const completedTodayCourseIds = new Set(
    assignments
      .filter((a) => a.status === "done" && a.completedAt && new Date(a.completedAt).getTime() >= startOfToday)
      .map((a) => a.courseId)
  );
  const badgeCourses = courses.filter((c) => completedTodayCourseIds.has(c.id));
  const year = palette.era.match(/\d{4}/)?.[0] ?? palette.era;
  const dateStr = now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-[32px] border border-amber-200/40 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
      {/* header: warm radiant glow + artwork hero + streak stepper */}
      <div className="relative flex flex-col items-center justify-center bg-gradient-to-b from-[#8B7EC8] via-[#8B7EC8]/40 to-white px-6 pb-4 pt-8">
        <span className="mb-2 text-sm font-extrabold tracking-tight text-white">
          taskFolio<span className="text-amber-200">.</span>
        </span>
        <div className="relative h-48 w-full overflow-hidden rounded-2xl border-2 border-white/90 shadow-[0_12px_30px_rgba(217,119,6,0.35)]">
          {/* eslint-disable-next-line @next/next/no-img-element -- local static art asset, no next/image benefit for a captured card */}
          <img
            src={palette.image}
            alt={palette.title}
            crossOrigin="anonymous"
            className="h-full w-full object-cover"
          />
          <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-amber-100 backdrop-blur-sm">
            🏛️ Acquisition No. {acquisitionNo}
          </span>
        </div>

        <div className="mt-4 flex w-full items-center justify-center">
          {STEPS.map((n, i) => (
            <div key={n} className="flex items-center">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm ${
                  n <= filledSteps ? "bg-[#5D4E9E] text-white" : "bg-white/70 text-[#5D4E9E]"
                }`}
              >
                {n}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-1 w-4 ${n < filledSteps ? "bg-[#5D4E9E]" : "bg-white/60"}`} />
              )}
            </div>
          ))}
        </div>

        <p className="mt-2 text-center text-[10px] font-medium text-[#5D4E9E]/80">
          Finish more assignments to unlock more artwork
        </p>

        {filledSteps === 5 && (
          <div className="mt-3 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-900 shadow-[0_4px_14px_rgba(217,119,6,0.45)]">
            <Crown className="h-3.5 w-3.5" /> Museum Curator Award
          </div>
        )}
      </div>

      {/* body */}
      <div className="flex flex-col items-center bg-white px-7 py-6 text-center text-neutral-900">
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">{celebrationPhrase}</h2>
        <p className="mb-4 mt-1 text-xs font-medium text-neutral-500">Zero pending tasks · {dateStr}</p>

        <div className="w-full rounded-xl bg-[#8B7EC8]/10 p-3 text-left">
          <p className="text-xs font-semibold text-[#5D4E9E]">
            🎨 Masterpiece Unlocked: {palette.title} by {palette.artist} ({year})
          </p>
          <p className="mt-1 text-xs italic leading-relaxed text-neutral-600">{palette.funFact}</p>
        </div>

        {badgeCourses.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {badgeCourses.map((c) => (
              <span
                key={c.id}
                className="flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700"
              >
                <Check className="h-3 w-3" /> {c.name || c.code}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
