import { Pool } from "pg";

// Exported so other server-only modules (e.g. rateLimit.ts) share this one
// pool instead of opening a second connection pool against the same DB.
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let schemaReady: Promise<void> | null = null;

// Runs once per server instance (not per request) — safe to call on every
// route hit since it's idempotent and cached behind the module-level promise.
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = pool
      .query(
        `CREATE TABLE IF NOT EXISTS user_vaults (
          sync_key VARCHAR(32) PRIMARY KEY,
          payload JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`
      )
      .then(() =>
        pool.query(`CREATE INDEX IF NOT EXISTS idx_user_vaults_updated ON user_vaults(updated_at)`)
      )
      .then(() => undefined);
  }
  return schemaReady;
}

export async function getVault(syncKey: string): Promise<{ payload: unknown; updatedAt: string } | null> {
  await ensureSchema();
  const { rows } = await pool.query(
    "SELECT payload, updated_at FROM user_vaults WHERE sync_key = $1",
    [syncKey]
  );
  if (rows.length === 0) return null;
  return { payload: rows[0].payload, updatedAt: rows[0].updated_at };
}

const MAX_VAULT_PAYLOAD_BYTES = 2_000_000; // 2MB — generous for real vault data, not for abuse

export async function putVault(syncKey: string, payload: unknown): Promise<void> {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new Error("Payload must be a plain object");
  }
  if (Buffer.byteLength(JSON.stringify(payload)) > MAX_VAULT_PAYLOAD_BYTES) {
    throw new Error("Payload too large");
  }
  await ensureSchema();
  await pool.query(
    `INSERT INTO user_vaults (sync_key, payload, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (sync_key)
     DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [syncKey, payload]
  );
}

// Lets a device kill a leaked/compromised sync key: once deleted, anyone
// still holding that key gets a 404 instead of continued read/write access.
export async function deleteVault(syncKey: string): Promise<void> {
  await ensureSchema();
  await pool.query("DELETE FROM user_vaults WHERE sync_key = $1", [syncKey]);
}
