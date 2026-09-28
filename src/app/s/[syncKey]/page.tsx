import { SyncPairingClient } from "./SyncPairingClient";

export default async function SyncPage({ params }: { params: Promise<{ syncKey: string }> }) {
  const { syncKey } = await params;
  return <SyncPairingClient syncKey={syncKey} />;
}
