/**
 * CCTP V2 Forwarding Service helpers
 *
 * Scaffold only. Execution disabled until route contracts, fees,
 * and UCW challenge flow are validated.
 *
 * The Forwarding Service hook is included in the depositForBurnWithHook
 * call data. When present, Circle's Iris service handles:
 *   - Attestation fetching
 *   - Destination chain mint transaction
 * No destination wallet or gas needed.
 */

/**
 * Forwarding Service hook data constant.
 * Encodes: magic bytes "cctp-forward" + version 0 + empty Circle hook data.
 * Reference: https://developers.circle.com/cctp/concepts/forwarding-service
 */
export const FORWARDING_SERVICE_HOOK_DATA =
  "0x636374702d666f72776172640000000000000000000000000000000000000000" as const;

/**
 * Convert a 20-byte EVM address to a 32-byte hex string (left-padded with zeros).
 * Required for the mintRecipient parameter in depositForBurnWithHook.
 *
 * @param evmAddress - 0x-prefixed 20-byte EVM address
 * @returns 0x-prefixed 64-char hex string (bytes32)
 */
export function buildRecipientBytes32(evmAddress: string): string {
  if (!evmAddress || !evmAddress.startsWith("0x") || evmAddress.length !== 42) {
    throw new Error(`Invalid EVM address for bytes32: ${evmAddress}`);
  }
  // Left-pad to 32 bytes (64 hex chars after 0x prefix)
  const stripped = evmAddress.slice(2).toLowerCase();
  return "0x" + stripped.padStart(64, "0");
}

/**
 * CCTP fee API base URLs.
 * Testnet uses sandbox. Mainnet only when explicitly enabled.
 */
export const CCTP_FEE_API = {
  testnet: "https://iris-api-sandbox.circle.com",
  mainnet: "https://iris-api.circle.com",
} as const;

/**
 * Build the Iris fee query URL for a forwarding transfer.
 *
 * @param sourceDomain - CCTP source domain ID
 * @param destinationDomain - CCTP destination domain ID
 * @param environment - "testnet" | "mainnet"
 * @returns Full URL for the fee API endpoint
 */
export function buildFeeQueryUrl(
  sourceDomain: number,
  destinationDomain: number,
  environment: "testnet" | "mainnet",
): string {
  const base = CCTP_FEE_API[environment];
  return `${base}/v2/burn/USDC/fees/${sourceDomain}/${destinationDomain}?forward=true`;
}

/**
 * Build the Iris messages query URL for tracking forwarding status.
 *
 * Uses the Circle Iris messages endpoint:
 *   /v2/messages/{sourceDomain}?transactionHash={transactionHash}
 *
 * @param sourceDomain - CCTP domain ID of the source chain (e.g. 0 for Ethereum)
 * @param transactionHash - The burn transaction hash on source chain
 * @param environment - "testnet" | "mainnet"
 * @returns Full URL for the messages API endpoint
 */
export function buildMessagesQueryUrl(
  sourceDomain: number,
  transactionHash: string,
  environment: "testnet" | "mainnet",
): string {
  const base = CCTP_FEE_API[environment];
  return `${base}/v2/messages/${sourceDomain}?transactionHash=${transactionHash}`;
}
