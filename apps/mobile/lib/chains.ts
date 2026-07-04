export type MintovaChain = {
  id: string;
  displayName: string;
  sdkName: string;
  chainId: number;
  type: "evm" | "solana";
  environment: "testnet" | "mainnet";
  enabled: boolean;
  bridgeEnabled: boolean;
  swapEnabled: boolean;
  sendEnabled: boolean;
  explorerBaseUrl: string;
};

export const CHAINS: MintovaChain[] = [
  {
    id: "arc-testnet",
    displayName: "Arc Testnet",
    sdkName: "Arc_Testnet",
    chainId: 5042002,
    type: "evm",
    environment: "testnet",
    enabled: true,
    bridgeEnabled: true,
    swapEnabled: false,
    sendEnabled: true,
    explorerBaseUrl: "https://testnet.arcscan.app",
  },
  {
    id: "ethereum-sepolia",
    displayName: "Ethereum Sepolia",
    sdkName: "Ethereum_Sepolia",
    chainId: 11155111,
    type: "evm",
    environment: "testnet",
    enabled: true,
    bridgeEnabled: true,
    swapEnabled: false,
    sendEnabled: true,
    explorerBaseUrl: "https://sepolia.etherscan.io",
  },
  {
    id: "base-sepolia",
    displayName: "Base Sepolia",
    sdkName: "Base_Sepolia",
    chainId: 84532,
    type: "evm",
    environment: "testnet",
    enabled: true,
    bridgeEnabled: true,
    swapEnabled: false,
    sendEnabled: true,
    explorerBaseUrl: "https://sepolia.basescan.org",
  },
  {
    id: "arbitrum-sepolia",
    displayName: "Arbitrum Sepolia",
    sdkName: "Arbitrum_Sepolia",
    chainId: 421614,
    type: "evm",
    environment: "testnet",
    enabled: true,
    bridgeEnabled: false,
    swapEnabled: false,
    sendEnabled: true,
    explorerBaseUrl: "https://sepolia.arbiscan.io",
  },
  {
    id: "avalanche-fuji",
    displayName: "Avalanche Fuji",
    sdkName: "Avalanche_Fuji",
    chainId: 43113,
    type: "evm",
    environment: "testnet",
    enabled: true,
    bridgeEnabled: false,
    swapEnabled: false,
    sendEnabled: true,
    explorerBaseUrl: "https://testnet.snowtrace.io",
  },
];

export function getEnabledBridgeChains(): MintovaChain[] {
  return CHAINS.filter((c) => c.enabled && c.bridgeEnabled);
}

export function getChainBySdkName(sdkName: string): MintovaChain | undefined {
  return CHAINS.find((c) => c.sdkName === sdkName);
}

export function assertSupportedRoute(source: string, destination: string): boolean {
  const src = getChainBySdkName(source);
  const dst = getChainBySdkName(destination);
  if (!src || !dst) return false;
  if (!src.enabled || !dst.enabled) return false;
  if (!src.bridgeEnabled || !dst.bridgeEnabled) return false;
  return true;
}
