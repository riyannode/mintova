"use client";

import { shortenAddress, formatUsdc } from "@/lib/format";

type Props = {
  address?: string;
  balances?: { chain: string; amount: string }[];
  onLogout?: () => void;
};

export function WalletPanel({ address, balances, onLogout }: Props) {
  return (
    <div className="w-full max-w-[420px]">
      <div className="glass-card p-5 space-y-4">
        <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Wallet</h2>

        {address ? (
          <>
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <span className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>
                {shortenAddress(address)}
              </span>
              <button className="text-xs font-medium transition-colors duration-200" style={{ color: "var(--accent)" }}>
                Copy
              </button>
            </div>

            <div className="pulse-line" />

            {balances && balances.length > 0 ? (
              <div className="space-y-1.5">
                {balances.map((b) => (
                  <div
                    key={b.chain}
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{
                      background: "var(--surface-elevated)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{b.chain}</span>
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{formatUsdc(b.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No balances loaded</p>
            )}

            <div className="space-y-2">
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs font-medium transition-colors duration-200"
                style={{ color: "var(--accent)" }}
              >
                Get testnet USDC
              </a>
              <button
                onClick={onLogout}
                className="w-full py-2 text-xs font-medium transition-all duration-200 active:scale-[0.98]"
                style={{
                  color: "var(--danger)",
                  border: `1px solid rgba(255, 107, 107, 0.2)`,
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(255, 107, 107, 0.05)",
                }}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Not connected</p>
        )}
      </div>
    </div>
  );
}
