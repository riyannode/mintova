/**
 * Balance fetching and mapping layer.
 * Maps UCW wallet balances to Mintova chain registry.
 */

import { getChainByUcwId, type MintovaChain } from "./chains";

export type ChainBalance = {
  chain: MintovaChain;
  usdcBalance: string;
  nativeBalance: string;
  isLoading: boolean;
  error?: string;
};

export type BalanceMap = Record<string, ChainBalance>;

/** Create empty balance map for all enabled chains */
export function createEmptyBalanceMap(): BalanceMap {
  const { getEnabledChains } = require("./chains");
  const chains = getEnabledChains();
  const map: BalanceMap = {};
  for (const chain of chains) {
    map[chain.id] = {
      chain,
      usdcBalance: "0",
      nativeBalance: "0",
      isLoading: false,
    };
  }
  return map;
}

/** Parse UCW token balance response into ChainBalance */
export function parseUcwBalance(
  ucwBalance: { token: { symbol: string; decimals: number }; amount: string; blockchain: string },
): { chainId: string; symbol: string; amount: string } | null {
  const chain = getChainByUcwId(ucwBalance.blockchain);
  if (!chain) return null;

  return {
    chainId: chain.id,
    symbol: ucwBalance.token.symbol,
    amount: ucwBalance.amount,
  };
}

/** Fetch balances for a wallet across all chains */
export async function fetchWalletBalances(
  userToken: string,
  walletId: string,
): Promise<BalanceMap> {
  const balanceMap = createEmptyBalanceMap();

  try {
    const res = await fetch("/api/wallet/balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userToken, walletId }),
    });
    const data = await res.json();

    if (data.balances && Array.isArray(data.balances)) {
      for (const bal of data.balances) {
        const parsed = parseUcwBalance(bal);
        if (parsed && balanceMap[parsed.chainId]) {
          if (parsed.symbol === "USDC") {
            balanceMap[parsed.chainId].usdcBalance = parsed.amount;
          } else {
            balanceMap[parsed.chainId].nativeBalance = parsed.amount;
          }
        }
      }
    }
  } catch (err: any) {
    console.error("Failed to fetch balances:", err);
  }

  return balanceMap;
}
