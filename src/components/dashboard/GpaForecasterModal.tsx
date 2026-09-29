"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { currentWeightedAverage, letterGradeMinPct, LETTER_GRADES, neededScoreForTarget, pctToGpaPoints, type LetterGrade } from "@/lib/gpa";
import { GlowRing } from "./GlowRing";

const DEFAULT_EXAM_WEIGHT = 20;

type GradableItem = { id: string; title: string; weightPct: number };

export function GpaForecasterModal({ onClose }: { onClose: () => void }) {
  const courses = useTaskStore((s) => s.courses);
  const assignments = useTaskStore((s) => s.assignments);
  const exams = useTaskStore((s) => s.exams);

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(courses[0]?.id ?? null);
  const [target, setTarget] = useState<LetterGrade>("A");
  const [scores, setScores] = useState<Record<string, number | "">>({});
  const [examWeights, setExamWeights] = useState<Record<string, number>>({});

  const courseItems = useMemo((): GradableItem[] => {
    if (!selectedCourseId) return [];
    const a: GradableItem[] = assignments
      .filter((x) => x.courseId === selectedCourseId)
      .map((x) => ({ id: x.id, title: x.title, weightPct: x.weightPct }));
    const e: GradableItem[] = exams
      .filter((x) => x.courseId === selectedCourseId)
      .map((x) => ({ id: x.id, title: x.title, weightPct: examWeights[x.id] ?? DEFAULT_EXAM_WEIGHT }));
    return [...a, ...e];
  }, [assignments, exams, selectedCourseId, examWeights]);

  const weightedItems = courseItems.map((item) => ({
    weightPct: item.weightPct,
    scorePct: scores[item.id] === "" || scores[item.id] === undefined ? null : Number(scores[item.id]),
  }));

  const currentAvg = currentWeightedAverage(weightedItems);
  const needed = neededScoreForTarget(weightedItems, letterGradeMinPct(target));

  // Semester GPA: average the current weighted % across every course that has at least one graded item this session.
  const semesterGpa = useMemo(() => {
    const perCourse: number[] = [];
    for (const course of courses) {
      const items: { weightPct: number; scorePct: number | null }[] = [
        ...assignments
          .filter((x) => x.courseId === course.id)
          .map((x) => ({ weightPct: x.weightPct, scorePct: scores[x.id] === "" || scores[x.id] === undefined ? null : Number(scores[x.id]) })),
        ...exams
          .filter((x) => x.courseId === course.id)
          .map((x) => ({
            weightPct: examWeights[x.id] ?? DEFAULT_EXAM_WEIGHT,
            scorePct: scores[x.id] === "" || scores[x.id] === undefined ? null : Number(scores[x.id]),
          })),
      ];
      const avg = currentWeightedAverage(items);
      if (avg !== null) perCourse.push(pctToGpaPoints(avg));
    }
    if (perCourse.length === 0) return null;
    return perCourse.reduce((s, v) => s + v, 0) / perCourse.length;
  }, [courses, assignments, exams, scores, examWeights]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="rijks-card flex max-h-[90vh] w-full max-w-2xl flex-col gap-5 overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <h3 className="font-sans text-lg font-bold tracking-tight text-zinc-900">What-If Grade Forecaster</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-zinc-600 hover:bg-black/5 hover:text-zinc-900">
            <X className="h-4 w-4" />
          </button>
        </div>

        {courses.length === 0 ? (
          <p className="text-sm text-zinc-600">Add a course first to forecast its grade.</p>
        ) : (
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedCourseId ?? ""}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className={inputCls}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.code}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-xs text-zinc-600">
                  Target grade
                  <select value={target} onChange={(e) => setTarget(e.target.value as LetterGrade)} className={inputCls}>
                    {LETTER_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <ul className="flex flex-col gap-2">
                {courseItems.length === 0 && <p className="text-sm text-zinc-600">No assignments or exams for this course yet.</p>}
                {courseItems.map((item) => {
                  const isExam = exams.some((e) => e.id === item.id);
                  return (
                    <li key={item.id} className="flex items-center gap-2 rounded-lg border border-black/10 bg-white/60 px-3 py-2">
                      <span className="min-w-0 flex-1 truncate text-sm text-zinc-800">{item.title}</span>
                      {isExam ? (
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={examWeights[item.id] ?? DEFAULT_EXAM_WEIGHT}
                          onChange={(e) => setExamWeights((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
                          title="Weight % of final grade"
                          className={`${inputCls} w-16 text-center`}
                        />
                      ) : (
                        <span className="w-16 shrink-0 text-center text-xs text-zinc-500">{item.weightPct}%</span>
                      )}
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="score"
                        value={scores[item.id] ?? ""}
                        onChange={(e) =>
                          setScores((prev) => ({ ...prev, [item.id]: e.target.value === "" ? "" : Number(e.target.value) }))
                        }
                        className={`${inputCls} w-20 text-center`}
                      />
                    </li>
                  );
                })}
              </ul>

              <div className="rounded-lg border border-black/10 bg-white/60 px-3 py-2.5 text-sm text-zinc-700">
                <p>
                  Current average:{" "}
                  <span className="font-bold text-zinc-900">{currentAvg === null ? "—" : `${currentAvg.toFixed(1)}%`}</span>
                </p>
                <p>
                  Needed on remaining work for {target}:{" "}
                  <span className="font-bold text-zinc-900">
                    {needed === null ? "everything already graded" : `${needed.toFixed(1)}%`}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-2 sm:w-40">
              <GlowRing pct={(semesterGpa ?? 0) / 4} label={semesterGpa === null ? "—" : semesterGpa.toFixed(2)} sublabel="Semester GPA" />
              <p className="text-center text-[11px] text-zinc-500">Based on scores entered this session, across every course.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "rounded-lg border border-white/80 bg-white/50 px-2.5 py-1.5 text-xs text-zinc-800 focus:border-[#8B7EC8] focus:outline-none focus:ring-2 focus:ring-[#8B7EC8]/20";
