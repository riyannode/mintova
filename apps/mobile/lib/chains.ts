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
  /** CCTP V2 domain ID (e.g. 0 for Ethereum Sepolia). null if chain has no CCTP support. */
  cctpDomain: number | null;
  /** USDC contract address on this chain. null if no USDC deployment. */
  usdcAddress: string | null;
  /** TokenMessengerV2 contract address. null if no CCTP support. */
  tokenMessengerV2Address: string | null;
};

/** TokenMessengerV2 — same address on all CCTP V2 testnet chains */
const TMV2_TESTNET = "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA";

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
    cctpDomain: 26,
    usdcAddress: "0x6900000000000000000000000000000000000001",
    tokenMessengerV2Address: TMV2_TESTNET,
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
    cctpDomain: 0,
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    tokenMessengerV2Address: TMV2_TESTNET,
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
    cctpDomain: 6,
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    tokenMessengerV2Address: TMV2_TESTNET,
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
    cctpDomain: 3,
    usdcAddress: "0x325Ca85B58A0C2E441e7891B8D0B410b76b33C65",
    tokenMessengerV2Address: TMV2_TESTNET,
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
    cctpDomain: 1,
    usdcAddress: "0x5425890298aed601595a70AB815c96711a31Bc65",
    tokenMessengerV2Address: TMV2_TESTNET,
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
    cctpDomain: 2,
    usdcAddress: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
    tokenMessengerV2Address: TMV2_TESTNET,
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
    cctpDomain: 7,
    usdcAddress: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    tokenMessengerV2Address: TMV2_TESTNET,
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

/** Get CCTP route config for a source→destination pair. Returns null if either chain lacks CCTP. */
export function getCctpRoute(source: string, destination: string) {
  const src = getChainBySdkName(source);
  const dst = getChainBySdkName(destination);
  if (!src || !dst) return null;
  if (src.cctpDomain === null || dst.cctpDomain === null) return null;
  if (!src.usdcAddress || !dst.usdcAddress) return null;
  if (!src.tokenMessengerV2Address || !dst.tokenMessengerV2Address) return null;
  return { source: src, destination: dst };
}
