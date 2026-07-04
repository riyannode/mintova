/**
 * Bridge execution endpoint — DISABLED
 *
 * UCW user-signing is not wired yet. We refuse to execute bridges
 * with a backend-controlled wallet (DCW/entity secret) because that
 * would move user funds without user signing authority.
 *
 * The correct path is manual CCTP V2 via UCW contract execution:
 *   1. approve(address,uint256) on USDC → challengeId → sdk.execute()
 *   2. depositForBurnWithHook on TokenMessengerV2 → challengeId → sdk.execute()
 *   3. Forwarding Service handles attestation + destination mint
 *
 * Returns HTTP 501 until UCW signing path is implemented and validated.
 *
 * Scaffold only. Execution disabled until route contracts, fees,
 * and UCW challenge flow are validated.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceChain, destinationChain, amount, recipient } = body;

    if (!sourceChain || !destinationChain || !amount || !recipient) {
      return NextResponse.json(
        { error: "Missing required fields: sourceChain, destinationChain, amount, recipient" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // SAFETY: Do not use CIRCLE_ENTITY_SECRET for user bridge execution.
  // UCW user-signing bridge execution is not wired yet.
  return NextResponse.json(
    {
      error: "UCW bridge signing is not wired yet",
      code: "UCW_BRIDGE_SIGNING_NOT_READY",
      executionEnabled: false,
    },
    { status: 501 },
  );
}
