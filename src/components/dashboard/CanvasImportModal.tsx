"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { DetectedCourseGroup } from "@/lib/canvasSync";

export function CanvasImportModal({
  groups,
  onConfirm,
  onCancel,
}: {
  groups: DetectedCourseGroup[];
  onConfirm: (selected: DetectedCourseGroup[]) => void;
  onCancel: () => void;
}) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set(groups.map((g) => g.key)));

  const selectedGroups = groups.filter((g) => selectedKeys.has(g.key));
  const selectedItemCount = selectedGroups.reduce((sum, g) => sum + g.events.length, 0);

  function toggle(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="rijks-card flex max-h-[80vh] w-full max-w-lg flex-col p-6"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-sans text-lg font-bold tracking-tight text-zinc-900">Confirm Courses to Import</h3>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="rounded-full p-1.5 text-zinc-600 hover:bg-black/5 hover:text-zinc-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setSelectedKeys(new Set(groups.map((g) => g.key)))}
            className="font-semibold text-[#5D4E9E] hover:underline"
          >
            Select All
          </button>
          <span className="text-zinc-400">·</span>
          <button
            type="button"
            onClick={() => setSelectedKeys(new Set())}
            className="font-semibold text-[#5D4E9E] hover:underline"
          >
            Deselect All
          </button>
        </div>

        <ul className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
          {groups.map((group) => {
            const checked = selectedKeys.has(group.key);
            return (
              <li key={group.key}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-black/10 bg-white/60 px-3 py-2.5 transition-colors hover:bg-white/80">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(group.key)}
                    className="h-4 w-4 shrink-0 accent-[#8B7EC8]"
                  />
                  <span className="shrink-0 rounded-full bg-[#8B7EC8]/15 px-2 py-0.5 text-[11px] font-bold text-[#5D4E9E]">
                    {group.code}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-zinc-800">{group.name}</span>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {group.events.length} item{group.events.length === 1 ? "" : "s"}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex justify-end gap-3 border-t border-black/10 pt-4">
          <button
            onClick={onCancel}
            className="rounded-full px-5 py-2 text-xs font-medium uppercase tracking-wider text-zinc-600 hover:bg-black/5 hover:text-zinc-900"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedGroups)}
            disabled={selectedGroups.length === 0}
            className="flex items-center gap-2 rounded-full bg-[#8B7EC8] px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(139,126,200,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#7A6CB8] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            Confirm &amp; Import Selected ({selectedItemCount} items)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
