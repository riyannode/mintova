import { NextRequest, NextResponse } from "next/server";
import { AppKit } from "@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

export async function POST(req: NextRequest) {
  try {
    const { activityId, sourceChain, destinationChain, amount, recipient } = await req.json();

    if (!sourceChain || !destinationChain || !amount || !recipient) {
      return NextResponse.json(
        { error: "Missing required fields for retry" },
        { status: 400 },
      );
    }

    const apiKey = process.env.CIRCLE_API_KEY;
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

    if (!apiKey || !entitySecret) {
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 },
      );
    }

    const adapter = createCircleWalletsAdapter({ apiKey, entitySecret });
    const kit = new AppKit();

    // Re-execute bridge (CCTP is idempotent for failed mid-transfer)
    const result = await kit.bridge({
      from: { adapter, chain: sourceChain },
      to: {
        adapter,
        chain: destinationChain,
        recipientAddress: recipient,
        useForwarder: true,
      },
      amount,
    });

    const steps = (result.steps || []).map((step: any) => ({
      name: step.name,
      state: step.state,
      txHash: step.txHash,
      explorerUrl: step.explorerUrl,
      error: step.error,
    }));

    return NextResponse.json({
      state: result.state,
      steps,
      activityId,
    });
  } catch (error: any) {
    console.error("Bridge retry error:", error);
    return NextResponse.json(
      { error: error.message || "Retry failed", state: "error" },
      { status: 500 },
    );
  }
}
