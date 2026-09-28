"use client";

import type { ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { Reorder, useDragControls, type DragControls, type HTMLMotionProps } from "framer-motion";

// Drag is started only from the grip handle (dragListener off), so the row's
// own gestures — swipe-to-complete, checkbox, buttons — never fight with it.
export function DragHandle({ controls, label }: { controls: DragControls; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => controls.start(e)}
      style={{ touchAction: "none" }}
      className="shrink-0 cursor-grab rounded p-0.5 text-zinc-300 transition-colors hover:text-zinc-500 active:cursor-grabbing"
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}

export function ReorderableItem({
  value,
  index,
  motionProps,
  children,
}: {
  value: string;
  index: number;
  // Lets a list swap in its own entry/exit choreography (e.g. the to-do list's spring pop).
  motionProps?: Pick<HTMLMotionProps<"li">, "initial" | "animate" | "exit" | "transition">;
  children: (controls: DragControls) => ReactNode;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={value}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4, transition: { duration: 0.18, ease: "easeOut" } }}
      transition={{ duration: 0.18, delay: index * 0.03, ease: "easeOut" }}
      {...motionProps}
      className="list-none"
    >
      {children(controls)}
    </Reorder.Item>
  );
}
