export type BridgeStep = {
  name: "approve" | "burn" | "fetchAttestation" | "mint";
  state: "pending" | "success" | "error";
  txHash?: string;
  explorerUrl?: string;
  error?: string;
};

export type ActivityEntry = {
  localId: string;
  createdAt: string;
  action: "bridge" | "send" | "swap";
  sourceChain: string;
  destinationChain: string;
  amount: string;
  recipient: string;
  status:
    | "pending"
    | "attesting"
    | "minting"
    | "complete"
    | "failed"
    | "approve_pending"
    | "approve_submitted"
    | "approve_confirmed";
  result?: unknown;
  /** Full SDK result object when real execution exists */
  sdkResult?: unknown;
  steps: BridgeStep[];
  explorerLinks: string[];
  error?: string;
  /** Error code for programmatic handling (e.g. "UCW_BRIDGE_SIGNING_NOT_READY") */
  errorCode?: string;
  retryable: boolean;

  // ── Phase 4.7: Approve-challenge specific fields ──
  /** Plan ID from /api/bridge/prepare */
  planId?: string;
  /** UCW challenge ID for the approve step */
  approveChallengeId?: string;
  /** Circle transaction ID returned by sdk.execute() */
  approveTransactionId?: string;
  /** On-chain tx hash for approve (if available after polling) */
  approveTxHash?: string;
};

const STORAGE_KEY = "mintova_activity";

export function getActivities(): ActivityEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveActivity(entry: ActivityEntry): void {
  const activities = getActivities();
  activities.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

export function updateActivity(localId: string, updates: Partial<ActivityEntry>): void {
  const activities = getActivities();
  const idx = activities.findIndex((a) => a.localId === localId);
  if (idx !== -1) {
    activities[idx] = { ...activities[idx], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }
}

export function generateLocalId(): string {
  return `mintova_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
