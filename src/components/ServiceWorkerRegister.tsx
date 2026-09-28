"use client";

import { useEffect } from "react";

// Registered in production only — a service worker caching aggressively
// during local development makes hot-reloaded changes look stale/broken.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
