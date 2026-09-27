// useSyncExternalStore requires getSnapshot to return a value that stays
// stable between calls until the store actually notifies a change. Reading
// Date.now() directly as the snapshot breaks that (every call differs by a
// few ms), which makes React think the store keeps changing mid-render and
// loops until it throws "Maximum update depth exceeded".
let cachedNow = Date.now();
const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;

function tick() {
  cachedNow = Date.now();
  listeners.forEach((listener) => listener());
}

export function subscribeToClock(callback: () => void) {
  listeners.add(callback);
  intervalId ??= setInterval(tick, 60_000);
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

export const getClientNow = () => cachedNow;
export const getServerNow = () => 0;
