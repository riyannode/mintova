import { assertSupportedRoute } from "./chains";
import { isValidEvmAddress, isValidAmount } from "./validation";
import { MintovaError } from "./errors";
import type { ActivityEntry, BridgeStep } from "./activity-store";

export type BridgeQuote = {
  provider: string;
  estimatedTime: string;
  steps: string[];
  fee?: string;
};

export type BridgeParams = {
  sourceChain: string;
  destinationChain: string;
  amount: string;
  recipient: string;
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
  // TODO: Integrate with App Kit / Bridge Kit for real quotes
  return {
    provider: "CCTP_V2",
    estimatedTime: "8-20 seconds",
    steps: ["approve", "burn", "fetchAttestation", "mint"],
  };
}

export async function executeBridge(
  _params: BridgeParams,
  _onStep?: (step: BridgeStep) => void,
): Promise<ActivityEntry> {
  // TODO: Integrate with App Kit / Bridge Kit after UCW wallet signing
  throw new MintovaError("ROUTE_UNAVAILABLE", "Bridge execution not yet connected");
}

export function buildBridgeConfirmation(params: BridgeParams, quote: BridgeQuote) {
  return {
    title: `Send ${params.amount} USDC to ${params.destinationChain}`,
    rows: [
      ["From", params.sourceChain],
      ["To", params.destinationChain],
      ["Recipient", params.recipient],
      ["Route", quote.provider],
      ["Est. time", quote.estimatedTime],
    ],
  };
}
