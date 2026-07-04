/**
 * Mintova Chain Registry - V1 Testnet
 *
 * Bridge support status per chain:
 * - "verified":   Route confirmed working with installed SDK/config
 * - "unverified": Chain exists in SDK but bridge execution not yet validated end-to-end
 * - "disabled":   Chain not supported or not in SDK
 *
 * SAFETY: bridgeEnabled is false for all routes until UCW signing is wired
 * and each route is validated with a real testnet bridge transfer.
 */

export type BridgeStatus = "verified" | "unverified" | "disabled";

export type MintovaChain = {
  id: string;
  displayName: string;
  shortName: string;
  sdkName: string;
  ucwBlockchain: string;
  chainId: number;
  type: "evm" | "solana";
  environment: "testnet" | "mainnet";
  enabled: boolean;
  bridgeEnabled: boolean;
  bridgeStatus: BridgeStatus;
  swapEnabled: boolean;
  sendEnabled: boolean;
  explorerBaseUrl: string;
  nativeCurrency: {
    symbol: string;
    decimals: number;
  };
};

export const CHAINS: MintovaChain[] = [
  {
    id: "arc-testnet",
    displayName: "Arc Testnet",
    shortName: "Arc",
    sdkName: "Arc_Testnet",
    ucwBlockchain: "ARC-TESTNET",
    chainId: 5042002,
    type: "evm",
    environment: "testnet",
    enabled: true,
    bridgeEnabled: false,
    bridgeStatus: "unverified",
    swapEnabled: false,
    sendEnabled: true,
    explorerBaseUrl: "https://testnet.arcscan.app",
    nativeCurrency: { symbol: "USDC", decimals: 18 },
  },
  {
    id: "ethereum-sepolia",
    displayName: "Ethereum Sepolia",
    shortName: "Sepolia",
    sdkName: "Ethereum_Sepolia",
    ucwBlockchain: "ETH-SEPOLIA",
    chainId: 11155111,
    type: "evm",
    environment: "testnet",
    enabled: true,
    bridgeEnabled: false,
    bridgeStatus: "unverified",
    swapEnabled: false,
    sendEnabled: true,
    explorerBaseUrl: "https://sepolia.etherscan.io",
    nativeCurrency: { symbol: "ETH", decimals: 18 },
  },
  {
    id: "base-sepolia",
    displayName: "Base Sepolia",
    shortName: "Base",
    sdkName: "Base_Sepolia",
    ucwBlockchain: "BASE-SEPOLIA",
    chainId: 84532,
    type: "evm",
    environment: "testnet",
    enabled: true,
    bridgeEnabled: false,
    bridgeStatus: "unverified",
    swapEnabled: false,
    sendEnabled: true,
    explorerBaseUrl: "https://sepolia.basescan.org",
    nativeCurrency: { symbol: "ETH", decimals: 18 },
  },
  {
    id: "arbitrum-sepolia",
    displayName: "Arbitrum Sepolia",
    shortName: "Arbitrum",
    sdkName: "Arbitrum_Sepolia",
    ucwBlockchain: "ARB-SEPOLIA",
    chainId: 421614,
    type: "evm",
    environment: "testnet",
    enabled: true,
    bridgeEnabled: false,
    bridgeStatus: "unverified",
    swapEnabled: false,
    sendEnabled: true,
    explorerBaseUrl: "https://sepolia.arbiscan.io",
    nativeCurrency: { symbol: "ETH", decimals: 18 },
  },
  {
    id: "avalanche-fuji",
    displayName: "Avalanche Fuji",
    shortName: "Avalanche",
    sdkName: "Avalanche_Fuji",
    ucwBlockchain: "AVAX-FUJI",
    chainId: 43113,
    type: "evm",
    environment: "testnet",
    enabled: true,
    bridgeEnabled: false,
    bridgeStatus: "unverified",
    swapEnabled: false,
    sendEnabled: true,
    explorerBaseUrl: "https://testnet.snowtrace.io",
    nativeCurrency: { symbol: "AVAX", decimals: 18 },
  },
  {
    id: "optimism-sepolia",
    displayName: "OP Sepolia",
    shortName: "Optimism",
    sdkName: "Optimism_Sepolia",
    ucwBlockchain: "OP-SEPOLIA",
    chainId: 11155420,
    type: "evm",
    environment: "testnet",
    enabled: true,
    bridgeEnabled: false,
    bridgeStatus: "unverified",
    swapEnabled: false,
    sendEnabled: true,
    explorerBaseUrl: "https://sepolia-optimistic.etherscan.io",
    nativeCurrency: { symbol: "ETH", decimals: 18 },
  },
  {
    id: "polygon-amoy",
    displayName: "Polygon Amoy",
    shortName: "Polygon",
    sdkName: "Polygon_Amoy_Testnet",
    ucwBlockchain: "MATIC-AMOY",
    chainId: 80002,
    type: "evm",
    environment: "testnet",
    enabled: true,
    bridgeEnabled: false,
    bridgeStatus: "unverified",
    swapEnabled: false,
    sendEnabled: true,
    explorerBaseUrl: "https://amoy.polygonscan.com",
    nativeCurrency: { symbol: "POL", decimals: 18 },
  },
];

/** Get all chains with bridge enabled */
export function getEnabledBridgeChains(): MintovaChain[] {
  return CHAINS.filter((c) => c.enabled && c.bridgeEnabled);
}

/** Get chain by App Kit SDK name (e.g. "Ethereum_Sepolia") */
export function getChainBySdkName(sdkName: string): MintovaChain | undefined {
  return CHAINS.find((c) => c.sdkName === sdkName);
}

/** Get chain by UCW blockchain ID (e.g. "ETH-SEPOLIA") */
export function getChainByUcwId(ucwId: string): MintovaChain | undefined {
  return CHAINS.find((c) => c.ucwBlockchain === ucwId);
}

/** Get chain by chain ID */
export function getChainByChainId(chainId: number): MintovaChain | undefined {
  return CHAINS.find((c) => c.chainId === chainId);
}

/** Assert that a bridge route is supported and enabled */
export function assertSupportedRoute(source: string, destination: string): boolean {
  const src = getChainBySdkName(source);
  const dst = getChainBySdkName(destination);
  if (!src || !dst) return false;
  if (!src.enabled || !dst.enabled) return false;
  if (!src.bridgeEnabled || !dst.bridgeEnabled) return false;
  if (source === destination) return false;
  return true;
}

/** Check if both ends of a route are verified (not just "enabled") */
export function isRouteVerified(source: string, destination: string): boolean {
  const src = getChainBySdkName(source);
  const dst = getChainBySdkName(destination);
  if (!src || !dst) return false;
  return src.bridgeStatus === "verified" && dst.bridgeStatus === "verified";
}

/** Get all enabled chains for display */
export function getEnabledChains(): MintovaChain[] {
  return CHAINS.filter((c) => c.enabled);
}
