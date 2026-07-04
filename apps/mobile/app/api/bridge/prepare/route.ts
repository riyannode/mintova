/**
 * Bridge prepare endpoint — SCAFFOLD ONLY
 *
 * Validates input and route. Returns 501 until UCW CCTP challenge
 * flow is fully wired and verified.
 *
 * Scaffold only. Execution disabled until route contracts, fees,
 * and UCW challenge flow are validated.
 */

import { NextRequest, NextResponse } from "next/server";
import { getChainBySdkName, isRouteVerified } from "@/lib/chains";
import { isValidEvmAddress, isValidAmount } from "@/lib/validation";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { sourceChain, destinationChain, amount, recipient } = body as {
    sourceChain?: string;
    destinationChain?: string;
    amount?: string;
    recipient?: string;
  };

  // Validate required fields
  if (!sourceChain || !destinationChain || !amount || !recipient) {
    return NextResponse.json(
      { error: "Missing required fields: sourceChain, destinationChain, amount, recipient" },
      { status: 400 },
    );
  }

  // Validate format
  if (!isValidAmount(amount)) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (!isValidEvmAddress(recipient)) {
    return NextResponse.json({ error: "Invalid recipient address" }, { status: 400 });
  }

  // Validate chain existence
  const srcChain = getChainBySdkName(sourceChain);
  const dstChain = getChainBySdkName(destinationChain);
  if (!srcChain || !dstChain) {
    return NextResponse.json({ error: "Unknown chain" }, { status: 400 });
  }

  // Validate route is verified
  if (!isRouteVerified(sourceChain, destinationChain)) {
    return NextResponse.json(
      {
        error: "Route not verified for bridge execution",
        code: "unsupported_route",
        sourceChain,
        destinationChain,
      },
      { status: 400 },
    );
  }

  // SAFETY: UCW CCTP prepare is not wired yet.
  // Do not create challengeId until contract addresses and fee quote are verified.
  return NextResponse.json(
    {
      error: "UCW CCTP prepare is not wired yet",
      code: "UCW_CCTP_PREPARE_NOT_READY",
      prepareEnabled: false,
    },
    { status: 501 },
  );
}
