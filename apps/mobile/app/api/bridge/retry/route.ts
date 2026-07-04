import { NextRequest, NextResponse } from "next/server";

/**
 * Bridge retry endpoint — DISABLED
 *
 * Retry requires a saved SDK result object and a confirmed safe SDK
 * retry method from the installed package APIs. We do NOT re-run
 * kit.bridge() from scratch — that would be a new transfer, not a retry.
 *
 * Returns HTTP 501 until a safe retry mechanism is validated.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { activityId, sourceChain, destinationChain, amount, recipient } = body;

    if (!activityId) {
      return NextResponse.json(
        { error: "Missing required field: activityId" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // SAFETY: Do not re-run kit.bridge() from scratch.
  // CCTP retry is NOT confirmed idempotent without saved SDK result.
  return NextResponse.json(
    {
      error: "Bridge retry requires saved SDK result object",
      code: "BRIDGE_RETRY_NOT_READY",
      retryEnabled: false,
    },
    { status: 501 },
  );
}
