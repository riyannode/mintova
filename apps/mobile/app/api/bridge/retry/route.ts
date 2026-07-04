/**
 * Bridge retry endpoint — DISABLED
 *
 * Retry for manual CCTP V2 via UCW requires:
 *   - Saved CctpBridgePlan with challengeIds and tx hashes
 *   - Re-issuing challengeId for the failed step only
 *   - UCW sdk.execute() for the user to approve
 *
 * We do NOT re-run the full bridge from scratch — that would be
 * a new transfer, not a retry.
 *
 * Returns HTTP 501 until a safe retry mechanism is validated.
 *
 * Scaffold only. Execution disabled until route contracts, fees,
 * and UCW challenge flow are validated.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { activityId } = body;

    if (!activityId) {
      return NextResponse.json(
        { error: "Missing required field: activityId" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // SAFETY: Do not re-run bridge from scratch.
  // CCTP retry is NOT confirmed idempotent without saved plan state.
  return NextResponse.json(
    {
      error: "Bridge retry requires saved UCW challenge plan",
      code: "BRIDGE_RETRY_NOT_READY",
      retryEnabled: false,
    },
    { status: 501 },
  );
}
