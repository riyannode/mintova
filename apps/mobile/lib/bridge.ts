/**
 * Bridge service - CCTP V2 via Circle App Kit
 *
 * Uses Circle Wallets adapter on backend (server-side).
 * Frontend handles validation, confirmation UI, and activity tracking.
 *
 * Bridge flow:
 * 1. Frontend validates params + shows confirmation
 * 2. User confirms → POST /api/bridge/execute
 * 3. Backend runs kit.bridge() with Circle Wallets adapter
 * 4. Backend returns result with steps
 * 5. Frontend updates activity store
 */

import { assertSupportedRoute, getChainBySdkName } from "./chains";
import { isValidEvmAddress, isValidAmount } from "./validation";
import { MintovaError } from "./errors";
import type { ActivityEntry, BridgeStep } from "./activity-store";

export type BridgeQuote = {
  provider: string;
  estimatedTime: string;
  steps: string[];
  fee?: string;
  sourceChain: string;
  destinationChain: string;
  amount: string;
  recipient: string;
};

export type BridgeParams = {
  sourceChain: string;
  destinationChain: string;
  amount: string;
  recipient: string;
};

export type BridgeExecuteResult = {
  success: boolean;
  activityId?: string;
  state: string;
  steps: BridgeStep[];
  error?: string;
};

export function validateBridgeParams(params: BridgeParams): void {
  if (!isValidAmount(params.amount)) {
    throw new MintovaError("INVALID_ADDRESS", "Invalid amount");
  }
  if (!isValidEvmAddress(params.recipient)) {
    throw new MintovaError("INVALID_ADDRESS", "Invalid recipient address");
  }
  if (!assertSupportedRoute(params.sourceChain, params.destinationChain)) {
    throw new MintovaError("UNSUPPORTED_ROUTE", "Unsupported route");
  }
}

export async function quoteBridge(params: BridgeParams): Promise<BridgeQuote> {
  validateBridgeParams(params);

  const srcChain = getChainBySdkName(params.sourceChain);
  const dstChain = getChainBySdkName(params.destinationChain);

  return {
    provider: "CCTP_V2",
    estimatedTime: "8-20 seconds",
    steps: ["approve", "burn", "fetchAttestation", "mint"],
    fee: "~0.001 USDC",
    sourceChain: srcChain?.displayName || params.sourceChain,
    destinationChain: dstChain?.displayName || params.destinationChain,
    amount: params.amount,
    recipient: params.recipient,
  };
}

export async function executeBridge(
  params: BridgeParams,
): Promise<BridgeExecuteResult> {
  validateBridgeParams(params);

  try {
    const res = await fetch("/api/bridge/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        state: "error",
        steps: data.steps || [],
        error: data.error || "Bridge execution failed",
      };
    }

    return {
      success: true,
      activityId: data.activityId,
      state: data.state || "success",
      steps: data.steps || [],
    };
  } catch (err: any) {
    return {
      success: false,
      state: "error",
      steps: [],
      error: err.message || "Network error",
    };
  }
}

export async function retryBridge(
  activityId: string,
): Promise<BridgeExecuteResult> {
  try {
    const res = await fetch("/api/bridge/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityId }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        state: "error",
        steps: data.steps || [],
        error: data.error || "Retry failed",
      };
    }

    return {
      success: true,
      activityId: data.activityId,
      state: data.state || "success",
      steps: data.steps || [],
    };
  } catch (err: any) {
    return {
      success: false,
      state: "error",
      steps: [],
      error: err.message || "Network error",
    };
  }
}

export function buildBridgeConfirmation(params: BridgeParams, quote: BridgeQuote) {
  const srcChain = getChainBySdkName(params.sourceChain);
  const dstChain = getChainBySdkName(params.destinationChain);

  return {
    title: `Bridge ${params.amount} USDC`,
    rows: [
      ["From", srcChain?.displayName || params.sourceChain],
      ["To", dstChain?.displayName || params.destinationChain],
      ["Recipient", `${params.recipient.slice(0, 6)}...${params.recipient.slice(-4)}`],
      ["Route", quote.provider],
      ["Est. time", quote.estimatedTime],
      ["Fee", quote.fee || "N/A"],
    ] as [string, string][],
  };
}
