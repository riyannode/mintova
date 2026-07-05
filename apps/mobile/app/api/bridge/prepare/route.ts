/**
 * UCW CCTP Prepare Endpoint — Phase 4.6
 *
 * Creates ONLY the approve(address,uint256) UCW challenge for the pilot
 * testnet route: Ethereum_Sepolia → Base_Sepolia.
 *
 * SAFETY:
 * - Does NOT create burn challenge
 * - Does NOT call sdk.execute() in backend
 * - Does NOT call kit.bridge()
 * - Does NOT use CIRCLE_ENTITY_SECRET for user funds
 * - Does NOT use raw private keys
 * - Does NOT submit any on-chain transaction
 * - Does NOT poll Iris messages
 * - Does NOT mark activity complete
 * - Does NOT fabricate fees or hashes
 * - Does NOT enable all routes (pilot-gated only)
 *
 * Flow:
 * 1. Validate all inputs
 * 2. Verify pilot route (Ethereum_Sepolia → Base_Sepolia only)
 * 3. Validate CCTP config exists on both chains
 * 4. Fetch live Iris sandbox forwarding fee quote
 * 5. Compute fee breakdown (transferAmountAtomic, protocolFeeAtomic, etc.)
 * 6. Build CctpBridgePlan
 * 7. Build approve execution payload
 * 8. Create UCW contract execution challenge for approve
 * 9. Return challengeId + plan data
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";
import { getChainBySdkName, isPilotCctpRoute } from "@/lib/chains";
import { isValidEvmAddress, isValidAmount, parseUsdcAmountToAtomic } from "@/lib/validation";
import { getCctpForwardingFeeQuote } from "@/lib/cctp/fees";
import { buildApproveExecution } from "@/lib/cctp/builders";
import { buildRecipientBytes32, FORWARDING_SERVICE_HOOK_DATA } from "@/lib/cctp/forwarding";
import { savePlan, generatePlanId } from "@/lib/cctp/plans";
import type { CctpBridgePlan } from "@/lib/cctp/types";

const circleClient = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { sourceChain, destinationChain, amount, recipient, userToken, walletId } = body as {
    sourceChain?: string;
    destinationChain?: string;
    amount?: string;
    recipient?: string;
    userToken?: string;
    walletId?: string;
  };

  // ── Step 1: Validate required fields ────────────────────────────────
  if (!sourceChain || !destinationChain || !amount || !recipient || !userToken || !walletId) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: sourceChain, destinationChain, amount, recipient, userToken, walletId",
      },
      { status: 400 },
    );
  }

  if (!isValidAmount(amount)) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  if (!isValidEvmAddress(recipient)) {
    return NextResponse.json({ error: "Invalid recipient address" }, { status: 400 });
  }

  // ── Step 2: Validate chain existence ────────────────────────────────
  const srcChain = getChainBySdkName(sourceChain);
  const dstChain = getChainBySdkName(destinationChain);

  if (!srcChain || !dstChain) {
    return NextResponse.json({ error: "Unknown chain" }, { status: 400 });
  }

  // ── Step 3: Pilot route gating ──────────────────────────────────────
  // Only Ethereum_Sepolia → Base_Sepolia is allowed.
  // All other routes are rejected regardless of bridgeEnabled/bridgeStatus.
  if (!isPilotCctpRoute(sourceChain, destinationChain)) {
    return NextResponse.json(
      {
        error: "Route not verified for UCW CCTP pilot",
        code: "unsupported_route",
      },
      { status: 400 },
    );
  }

  // ── Step 4: Validate CCTP config on both chains ─────────────────────
  if (srcChain.cctpDomain === null || dstChain.cctpDomain === null) {
    return NextResponse.json(
      { error: "CCTP domain not configured for one or both chains" },
      { status: 400 },
    );
  }
  if (!srcChain.usdcAddress || !dstChain.usdcAddress) {
    return NextResponse.json(
      { error: "USDC address not configured for one or both chains" },
      { status: 400 },
    );
  }
  if (!srcChain.tokenMessengerV2Address || !dstChain.tokenMessengerV2Address) {
    return NextResponse.json(
      { error: "TokenMessengerV2 address not configured for one or both chains" },
      { status: 400 },
    );
  }

  // ── Step 5: Compute atomic amounts ──────────────────────────────────
  // Exact string parser — no parseFloat, no floating-point rounding.
  let transferAmountAtomic: bigint;
  try {
    transferAmountAtomic = parseUsdcAmountToAtomic(amount);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid amount";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // ── Step 6: Fetch live Iris sandbox forwarding fee quote ─────────────
  const feeQuoteResult = await getCctpForwardingFeeQuote(
    srcChain.cctpDomain,
    dstChain.cctpDomain,
    "testnet",
    transferAmountAtomic,
  );

  if (!feeQuoteResult.ok) {
    return NextResponse.json(
      {
        error: `Failed to fetch fee quote: ${feeQuoteResult.error}`,
        code: feeQuoteResult.code,
      },
      { status: 502 },
    );
  }

  const feeQuote = feeQuoteResult.quote;

  // ── Step 7: Build CctpBridgePlan ────────────────────────────────────
  const recipientBytes32 = buildRecipientBytes32(recipient);

  const plan: CctpBridgePlan = {
    sourceChain: sourceChain,
    destinationChain: destinationChain,
    sourceDomain: srcChain.cctpDomain,
    destinationDomain: dstChain.cctpDomain,
    usdcAddress: srcChain.usdcAddress,
    tokenMessengerV2Address: srcChain.tokenMessengerV2Address,
    recipientAddress: recipient,
    recipientBytes32,
    transferAmountAtomic: transferAmountAtomic.toString(),
    maxFeeAtomic: feeQuote.maxFeeAtomic,
    burnAmountAtomic: feeQuote.burnAmountAtomic,
    minFinalityThreshold: feeQuote.finalityThreshold,
    hookData: FORWARDING_SERVICE_HOOK_DATA,
    feeQuote,
    // Step tracking — approve only, burn not created
    approveState: "pending",
    burnState: "pending",
    forwardState: "not_started",
  };

  // ── Step 8: Build approve execution payload ─────────────────────────
  const approvePayload = buildApproveExecution(plan);

  // ── Step 9: Create UCW contract execution challenge for approve ─────
  const idempotencyKey = randomUUID();

  let challengeId: string;
  try {
    const response = await circleClient.createUserTransactionContractExecutionChallenge({
      userToken,
      walletId,
      contractAddress: approvePayload.contractAddress,
      abiFunctionSignature: approvePayload.abiFunctionSignature,
      abiParameters: approvePayload.abiParameters,
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
      idempotencyKey,
    });

    challengeId = response.data?.challengeId ?? "";

    if (!challengeId) {
      return NextResponse.json(
        { error: "Circle API returned empty challengeId", code: "challenge_creation_failed" },
        { status: 502 },
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown Circle API error";
    console.error("UCW contract execution challenge failed:", message);
    return NextResponse.json(
      { error: `Challenge creation failed: ${message}`, code: "challenge_creation_failed" },
      { status: 502 },
    );
  }

  // ── Step 10: Persist plan and return ────────────────────────────────
  const planId = generatePlanId();
  plan.approveChallengeId = challengeId;
  plan.approveState = "challenge_created";
  savePlan(planId, plan, challengeId);

  return NextResponse.json({
    prepareEnabled: true,
    stage: "approve_challenge_created",
    challengeId,
    planId,
    sourceChain: sourceChain,
    destinationChain: destinationChain,
    transferAmountAtomic: plan.transferAmountAtomic,
    protocolFeeAtomic: feeQuote.protocolFeeAtomic,
    forwardFeeAtomic: feeQuote.forwardFeeAtomic,
    maxFeeAtomic: plan.maxFeeAtomic,
    burnAmountAtomic: plan.burnAmountAtomic,
    nextStep: "frontend_execute_approve_challenge",
    warning: "Burn step not created yet. Only approve challenge is ready.",
  });
}
