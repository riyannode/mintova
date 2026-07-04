/**
 * Bridge service - CCTP V2 via Circle App Kit
 *
 * SAFETY: Bridge execution is disabled (501) until UCW user-signing
 * is wired. The backend will NOT execute transfers with entity secret.
 *
 * Quote is honest: no fake fee or estimated time until a real SDK
 * quote API is confirmed.
 */

import { assertSupportedRoute, getChainBySdkName, isRouteVerified } from "./chains";
import { isValidEvmAddress, isValidAmount } from "./validation";
import { MintovaError } from "./errors";
import type { BridgeStep } from "./activity-store";

export type BridgeQuote = {
  provider: string;
  estimatedTime: string | null;
  steps: string[];
  fee: string | null;
  sourceChain: string;
  destinationChain: string;
  amount: string;
  recipient: string;
  quoteAvailable: boolean;
  message?: string;
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
  errorCode?: string;
  executionEnabled?: boolean;
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
  const routeVerified = isRouteVerified(params.sourceChain, params.destinationChain);

  // Honest quote: no fake fee or time until SDK quote API is confirmed
  if (!routeVerified) {
    return {
      provider: "CCTP_V2_UNVERIFIED",
      estimatedTime: null,
      steps: ["approve", "burn", "fetchAttestation", "mint"],
      fee: null,
      sourceChain: srcChain?.displayName || params.sourceChain,
      destinationChain: dstChain?.displayName || params.destinationChain,
      amount: params.amount,
      recipient: params.recipient,
      quoteAvailable: false,
      message: "Quote unavailable until execution route is verified",
    };
  }

  return {
    provider: "CCTP_V2",
    estimatedTime: null,
    steps: ["approve", "burn", "fetchAttestation", "mint"],
    fee: null,
    sourceChain: srcChain?.displayName || params.sourceChain,
    destinationChain: dstChain?.displayName || params.destinationChain,
    amount: params.amount,
    recipient: params.recipient,
    quoteAvailable: false,
    message: "Quote unavailable until execution route is verified",
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

    // 501 = UCW signing not wired — safe block, not a transient error
    if (res.status === 501) {
      return {
        success: false,
        state: "blocked",
        steps: [],
        error: data.error || "Bridge execution is not enabled yet",
        errorCode: data.code || "UCW_BRIDGE_SIGNING_NOT_READY",
        executionEnabled: false,
      };
    }

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
      executionEnabled: true,
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

    // 501 = retry not safe without saved SDK result
    if (res.status === 501) {
      return {
        success: false,
        state: "blocked",
        steps: [],
        error: data.error || "Bridge retry is not available",
        errorCode: data.code || "BRIDGE_RETRY_NOT_READY",
        executionEnabled: false,
      };
    }

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

  const rows: [string, string][] = [
    ["From", srcChain?.displayName || params.sourceChain],
    ["To", dstChain?.displayName || params.destinationChain],
    ["Recipient", `${params.recipient.slice(0, 6)}...${params.recipient.slice(-4)}`],
    ["Route", quote.provider],
  ];

  // Only show fee/time if quote is available
  if (quote.quoteAvailable) {
    rows.push(["Est. time", quote.estimatedTime || "—"]);
    rows.push(["Fee", quote.fee || "—"]);
  } else {
    rows.push(["Est. time", "Pending verification"]);
    rows.push(["Fee", "Pending verification"]);
  }

  if (quote.message) {
    rows.push(["Note", quote.message]);
  }

  return {
    title: `Bridge ${params.amount} USDC`,
    rows,
  };
}
