import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { MINTOVA_SYSTEM_PROMPT } from "@/lib/agent-prompt";
import {
  getSupportedChains,
  getBridgeChains,
  validateRecipientAddress,
  checkRoute,
  getChainByInput,
} from "@/lib/agent-tools";

// Zod schema for structured intent
const MintovaIntentSchema = z.object({
  action: z.enum(["bridge", "send", "swap", "crosschain_swap"]),
  amount: z.string().nullable(),
  fromToken: z.string().default("USDC"),
  toToken: z.string().nullable(),
  sourceChain: z.string().nullable(),
  destinationChain: z.string().nullable(),
  recipient: z.string().nullable(),
  slippageBps: z.number().nullable(),
  confidence: z.number().min(0).max(1),
  missingFields: z.array(z.string()),
});

type MintovaIntent = z.infer<typeof MintovaIntentSchema>;

// Simple intent parser (rule-based for V1, LangChain for V2)
function parseIntent(message: string): { type: string; intent?: MintovaIntent; message?: string } {
  const lower = message.toLowerCase().trim();

  // Extract amount
  const amountMatch = lower.match(/(\d+\.?\d*)\s*(usdc|dollar)/);
  const amount = amountMatch ? amountMatch[1] : null;

  // Extract chains
  const chainKeywords = [
    "arc", "sepolia", "ethereum", "base", "arbitrum", "arb",
    "avalanche", "fuji", "optimism", "op", "polygon", "amoy",
  ];

  const foundChains: string[] = [];
  for (const kw of chainKeywords) {
    if (lower.includes(kw)) {
      const chain = getChainByInput(kw);
      if (chain && !foundChains.includes(chain.sdkName)) {
        foundChains.push(chain.sdkName);
      }
    }
  }

  // Extract address
  const addrMatch = lower.match(/0x[a-fA-F0-9]{40}/);
  const recipient = addrMatch ? addrMatch[0] : null;

  // Detect action
  let action: "bridge" | "send" | "swap" = "bridge";
  if (lower.includes("send") || lower.includes("kirim") || lower.includes("transfer")) {
    action = "send";
  }
  if (lower.includes("swap") || lower.includes("tukar")) {
    action = "swap";
  }

  // Build intent
  const missingFields: string[] = [];
  if (!amount) missingFields.push("amount");
  if (!recipient) missingFields.push("recipient");
  if (foundChains.length < 2 && action === "bridge") {
    if (foundChains.length === 0) {
      missingFields.push("sourceChain", "destinationChain");
    } else {
      missingFields.push("destinationChain");
    }
  }

  const sourceChain = foundChains[0] || null;
  const destinationChain = foundChains[1] || null;

  // Validate if we have enough info
  if (recipient) {
    const addrCheck = validateRecipientAddress(recipient);
    if (!addrCheck.valid) {
      return { type: "invalid_address", message: "Invalid recipient address format" };
    }
  }

  if (sourceChain && destinationChain) {
    const routeCheck = checkRoute(sourceChain, destinationChain);
    if (!routeCheck.supported) {
      return { type: "unsupported_route", message: "This route is not supported yet" };
    }
  }

  const confidence = 1 - missingFields.length * 0.2;

  const intent: MintovaIntent = {
    action,
    amount,
    fromToken: "USDC",
    toToken: null,
    sourceChain,
    destinationChain,
    recipient,
    slippageBps: null,
    confidence: Math.max(0.1, confidence),
    missingFields,
  };

  if (missingFields.length > 0) {
    const questions: string[] = [];
    if (missingFields.includes("amount")) questions.push("How much USDC?");
    if (missingFields.includes("recipient")) questions.push("What is the recipient address?");
    if (missingFields.includes("sourceChain")) questions.push("Which chain to send from?");
    if (missingFields.includes("destinationChain")) questions.push("Which chain to send to?");

    return {
      type: "need_clarification",
      message: questions.join(" "),
      intent,
    };
  }

  return { type: "intent_ready", intent };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const result = parseIntent(message);

    // Build confirmation if intent is ready
    let confirmation = null;
    if (result.type === "intent_ready" && result.intent) {
      const srcName = result.intent.sourceChain?.replace(/_/g, " ") || "";
      const dstName = result.intent.destinationChain?.replace(/_/g, " ") || "";

      confirmation = {
        title: `${result.intent.action === "bridge" ? "Bridge" : "Send"} ${result.intent.amount} USDC`,
        rows: [
          ["From", srcName],
          ["To", dstName],
          ["Recipient", result.intent.recipient ? `${result.intent.recipient.slice(0, 6)}...${result.intent.recipient.slice(-4)}` : ""],
          ["Route", "CCTP V2 (unverified)"],
          ["Est. time", "Pending verification"],
        ],
      };
    }

    return NextResponse.json({
      type: result.type,
      intent: result.intent || null,
      message: result.message || null,
      confirmation,
    });
  } catch (error: any) {
    console.error("Agent error:", error);
    return NextResponse.json(
      { error: error.message || "Agent error" },
      { status: 500 },
    );
  }
}
