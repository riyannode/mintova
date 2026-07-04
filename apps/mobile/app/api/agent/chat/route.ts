import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const MintovaIntentSchema = z.object({
  action: z.enum(["bridge", "send", "swap", "crosschain_swap"]),
  amount: z.string(),
  fromToken: z.string().default("USDC"),
  toToken: z.string().nullable(),
  sourceChain: z.string().nullable(),
  destinationChain: z.string().nullable(),
  recipient: z.string().nullable(),
  slippageBps: z.number().nullable(),
  confidence: z.number().min(0).max(1),
  missingFields: z.array(z.string()),
});

export type MintovaIntent = z.infer<typeof MintovaIntentSchema>;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, walletAddress, currentChain, sessionId } = body;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // TODO: Integrate LangChain with tools:
    // - getSupportedChains
    // - getWalletBalances
    // - validateRecipientAddress
    // - quoteBridge
    // - buildConfirmation

    // Stub response for now
    return NextResponse.json({
      type: "need_clarification",
      message: "Agent not yet connected. LangChain integration pending.",
      intent: null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
