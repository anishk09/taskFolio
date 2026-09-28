"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";

export function TodoList() {
  const todos = useTaskStore((s) => s.todos);
  const toggleTodoDone = useTaskStore((s) => s.toggleTodoDone);
  const removeTodo = useTaskStore((s) => s.removeTodo);

  const pending = todos.filter((t) => !t.done);

  if (pending.length === 0) {
    return <p className="text-sm text-zinc-600">Nothing on your to-do list — add something non-school here.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {pending.map((t) => (
          <motion.li
            layout
            key={t.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.18, ease: "easeOut" } }}
            className="group flex items-center gap-3 rounded-xl border border-black/10 bg-white/70 px-3.5 py-2.5 backdrop-blur-xl transition-colors hover:border-[#8B7EC8]/40"
          >
            <input
              type="checkbox"
              aria-label={`Mark ${t.title} done`}
              checked={t.done}
              onChange={() => toggleTodoDone(t.id)}
              className="h-5 w-5 shrink-0 accent-[#8B7EC8]"
            />
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900">{t.title}</p>
            <button
              onClick={() => removeTodo(t.id)}
              aria-label={`Delete ${t.title}`}
              className="shrink-0 rounded-full p-1 text-zinc-400 opacity-100 transition-opacity hover:bg-black/5 hover:text-[#DC2626] sm:opacity-0 sm:group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
