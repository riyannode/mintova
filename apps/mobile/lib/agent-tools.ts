/**
 * Mintova Agent Tools - for LangChain integration
 * These tools are called by the AI agent to gather information.
 * They do NOT execute transactions.
 */

import { CHAINS, getEnabledBridgeChains, assertSupportedRoute } from "./chains";
import { isValidEvmAddress } from "./validation";

export function getSupportedChains() {
  return CHAINS.filter((c) => c.enabled).map((c) => ({
    id: c.id,
    displayName: c.displayName,
    sdkName: c.sdkName,
    bridgeEnabled: c.bridgeEnabled,
    swapEnabled: c.swapEnabled,
    environment: c.environment,
  }));
}

export function getBridgeChains() {
  return getEnabledBridgeChains().map((c) => ({
    displayName: c.displayName,
    sdkName: c.sdkName,
  }));
}

export function validateRecipientAddress(address: string): {
  valid: boolean;
  error?: string;
} {
  if (!address || typeof address !== "string") {
    return { valid: false, error: "Address is required" };
  }
  if (!isValidEvmAddress(address)) {
    return { valid: false, error: "Invalid EVM address format" };
  }
  return { valid: true };
}

export function checkRoute(source: string, destination: string): {
  supported: boolean;
  error?: string;
} {
  if (!assertSupportedRoute(source, destination)) {
    return { supported: false, error: "Unsupported route" };
  }
  return { supported: true };
}

export function getChainByInput(input: string): { sdkName: string; displayName: string } | null {
  const lower = input.toLowerCase().trim();

  // Match by display name, short name, or SDK name
  const chain = CHAINS.find((c) => {
    const matchNames = [
      c.displayName.toLowerCase(),
      c.shortName.toLowerCase(),
      c.sdkName.toLowerCase(),
      c.id.toLowerCase(),
    ];
    return matchNames.some((n) => n.includes(lower) || lower.includes(n));
  });

  if (chain) {
    return { sdkName: chain.sdkName, displayName: chain.displayName };
  }
  return null;
}
