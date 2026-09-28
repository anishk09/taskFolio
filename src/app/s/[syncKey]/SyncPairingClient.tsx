"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore } from "@/store/useTaskStore";

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
            <div
              className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#D9B454]/25 border-t-[#D9B454]"
              style={{ boxShadow: "0 0 24px -4px rgba(217,180,84,0.5)" }}
              aria-hidden
            />
            <p className="mt-5 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Connecting your personal canvas…
            </p>
          </>
        )}
      </div>
    </div>
  );
}
