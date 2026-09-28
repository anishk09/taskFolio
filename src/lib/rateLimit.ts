import type { NextRequest } from "next/server";
import { pool } from "./db";

let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = pool
      .query(
        `CREATE TABLE IF NOT EXISTS rate_limits (
          bucket_key VARCHAR(300) PRIMARY KEY,
          window_start TIMESTAMPTZ NOT NULL,
          count INT NOT NULL
        )`
      )
      .then(() => undefined);
  }
  return schemaReady;
}

export function getClientIp(request: NextRequest): string {
  // Vercel sets this on every request; falls back to a shared bucket if
  // it's ever missing (e.g. local dev), which just means local testing
  // shares one rate-limit bucket rather than being unlimited.
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

// Fixed-window counter backed by the existing Neon Postgres DB — no new
// external service needed just for rate limiting. The atomic upsert avoids
// race conditions between concurrent requests in the same window.
export async function checkRateLimit(identifier: string, limit: number, windowSeconds: number): Promise<boolean> {
  await ensureSchema();
  const windowStart = new Date(Math.floor(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000);
  const bucketKey = `${identifier}:${windowStart.getTime()}`;

  const { rows } = await pool.query(
    `INSERT INTO rate_limits (bucket_key, window_start, count)
     VALUES ($1, $2, 1)
     ON CONFLICT (bucket_key) DO UPDATE SET count = rate_limits.count + 1
     RETURNING count`,
    [bucketKey, windowStart]
  );

  // ponytail: opportunistic cleanup instead of a cron job — good enough at
  // this app's scale; revisit with a scheduled job if the table grows large.
  if (Math.random() < 0.01) {
    pool.query("DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 day'").catch(() => {});
  }

  return rows[0].count <= limit;
}
