"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTaskStore } from "@/store/useTaskStore";

const PETAL_COLORS = ["#D9B454", "#8B7EC8", "#C77D2E"];

function FallingPetals() {
  // Computed once via useState initializer (not per-render Math.random) so
  // each petal's path stays stable across re-renders instead of jittering.
  const [petals] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: 4 + ((i * 13) % 90),
      delay: (i % 4) * 0.7,
      duration: 3.4 + (i % 3) * 0.6,
      size: 14 + (i % 3) * 4,
      color: PETAL_COLORS[i % PETAL_COLORS.length],
      swing: i % 2 === 0 ? 18 : -18,
    }))
  );

  return (
    <div className="relative mx-auto h-28 w-full max-w-[240px] overflow-hidden" aria-hidden>
      {petals.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-0 rounded-[0%_100%_0%_100%]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.72,
            backgroundColor: p.color,
            boxShadow: `0 0 8px 1px ${p.color}99`,
          }}
          initial={{ y: -24, x: 0, opacity: 0, rotate: 0 }}
          animate={{ y: 130, x: [0, p.swing, 0, -p.swing, 0], opacity: [0, 1, 1, 1, 0], rotate: 220 }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function SyncPairingClient({ syncKey }: { syncKey: string }) {
  const router = useRouter();
  const hydrateFromRemote = useTaskStore((s) => s.hydrateFromRemote);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/sync/${syncKey}`);
        if (!res.ok) throw new Error(res.status === 404 ? "This sync link has expired or doesn't exist." : "Sync failed.");
        const data = await res.json();
        if (cancelled) return;
        hydrateFromRemote(data.payload, syncKey);
        router.push("/");
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Sync failed.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [syncKey, hydrateFromRemote, router]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <div className="rijks-card w-full p-10">
        {error ? (
          <>
            <h1 className="font-sans text-lg font-bold text-zinc-900">Couldn&apos;t connect</h1>
            <p className="mt-2 text-sm text-zinc-600">{error}</p>
          </>
        ) : (
          <>
            <FallingPetals />
            <p className="mt-3 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Connecting your personal canvas…
            </p>
          </>
        )}
      </div>
    </div>
  );
}
