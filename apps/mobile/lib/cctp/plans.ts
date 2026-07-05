/**
 * In-memory CctpBridgePlan store for backend.
 *
 * Stores plans created during /api/bridge/prepare so that
 * /api/bridge/execute can retrieve them by planId.
 *
 * SAFETY: This is a testnet pilot store. Plans expire after 30 minutes.
 * Production would use a persistent store (database, Redis, etc.).
 *
 * Plans are keyed by planId (UUID).
 */

import type { CctpBridgePlan } from "./types";

type StoredPlan = {
  plan: CctpBridgePlan;
  createdAt: number;
  /** UCW challenge ID for the approve step */
  approveChallengeId: string;
};

const PLAN_STORE = new Map<string, StoredPlan>();

/** TTL: 30 minutes */
const PLAN_TTL_MS = 30 * 60 * 1000;

/**
 * Save a bridge plan with its approve challenge ID.
 */
export function savePlan(planId: string, plan: CctpBridgePlan, approveChallengeId: string): void {
  PLAN_STORE.set(planId, {
    plan,
    createdAt: Date.now(),
    approveChallengeId,
  });
}

/**
 * Retrieve a plan by ID. Returns null if not found or expired.
 */
export function getPlan(planId: string): StoredPlan | null {
  const entry = PLAN_STORE.get(planId);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > PLAN_TTL_MS) {
    PLAN_STORE.delete(planId);
    return null;
  }
  return entry;
}

/**
 * Generate a plan ID. Uses crypto.randomUUID if available, falls back to
 * timestamp + random suffix.
 */
export function generatePlanId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `plan_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

/**
 * Clean up expired plans. Call periodically if needed.
 */
export function cleanupExpiredPlans(): number {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, entry] of PLAN_STORE.entries()) {
    if (now - entry.createdAt > PLAN_TTL_MS) {
      PLAN_STORE.delete(key);
      cleaned++;
    }
  }
  return cleaned;
}
