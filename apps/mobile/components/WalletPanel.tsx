"use client";

import { shortenAddress, formatUsdc } from "@/lib/format";

type Props = {
  address?: string;
  balances?: { chain: string; amount: string }[];
  onLogout?: () => void;
};

export function WalletPanel({ address, balances, onLogout }: Props) {
  return (
    <div className="w-full max-w-sm bg-[#181B22] rounded-2xl border border-[#2A2E38] p-6 space-y-4">
      <h2 className="text-lg font-semibold">Wallet</h2>

      {address ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-[#20242D] rounded-xl px-4 py-3">
            <span className="text-sm font-mono text-[#F7F2E8]">
              {shortenAddress(address)}
            </span>
            <button className="text-xs text-[#8EA7FF] hover:text-[#7CFFB2] transition">
              Copy
            </button>
          </div>

          {balances && balances.length > 0 ? (
            <div className="space-y-2">
              {balances.map((b) => (
                <div
                  key={b.chain}
                  className="flex justify-between text-sm bg-[#20242D] rounded-xl px-4 py-2"
                >
                  <span className="text-[#8E929C]">{b.chain}</span>
                  <span className="text-[#F7F2E8]">{formatUsdc(b.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#8E929C]">No balances loaded</p>
          )}

          <div className="pt-2 space-y-2">
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-[#8EA7FF] hover:text-[#7CFFB2] transition"
            >
              Get testnet USDC ↗
            </a>
            <button
              onClick={onLogout}
              className="w-full py-2 rounded-xl text-sm text-[#FF6B6B] border border-[#FF6B6B]/30 hover:bg-[#FF6B6B]/10 transition"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#8E929C]">Not connected</p>
      )}
    </div>
  );
}
