import { NextRequest, NextResponse } from "next/server";
import { AppKit } from "@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

export async function POST(req: NextRequest) {
  try {
    const { sourceChain, destinationChain, amount, recipient } = await req.json();

    // Validate
    if (!sourceChain || !destinationChain || !amount || !recipient) {
      return NextResponse.json(
        { error: "Missing required fields: sourceChain, destinationChain, amount, recipient" },
        { status: 400 },
      );
    }

    // Server-side env vars
    const apiKey = process.env.CIRCLE_API_KEY;
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

    if (!apiKey || !entitySecret) {
      return NextResponse.json(
        { error: "Server not configured: CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET missing" },
        { status: 500 },
      );
    }

    // Create Circle Wallets adapter (server-side, no private key in APK)
    const adapter = createCircleWalletsAdapter({
      apiKey,
      entitySecret,
    });

    const kit = new AppKit();

    // Execute bridge via CCTP V2
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

    // Map result steps to our format
    const steps = (result.steps || []).map((step: any) => ({
      name: step.name as "approve" | "burn" | "fetchAttestation" | "mint",
      state: step.state as "pending" | "success" | "error",
      txHash: step.txHash,
      explorerUrl: step.explorerUrl,
      error: step.error,
    }));

    return NextResponse.json({
      state: result.state,
      steps,
      activityId: `bridge_${Date.now()}`,
      source: result.source,
      destination: result.destination,
    });
  } catch (error: any) {
    console.error("Bridge execution error:", error);

    // Check if it's a soft error (partial steps completed)
    const steps = error?.result?.steps?.map((step: any) => ({
      name: step.name,
      state: step.state,
      txHash: step.txHash,
      explorerUrl: step.explorerUrl,
      error: step.error,
    })) || [];

    return NextResponse.json(
      {
        error: error.message || "Bridge execution failed",
        state: "error",
        steps,
      },
      { status: 500 },
    );
  }
}
