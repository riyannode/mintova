"use client";

import { shortenAddress, formatUsdc } from "@/lib/format";
import { getChainByChainId, type MintovaChain } from "@/lib/chains";

type BalanceEntry = {
  chain: string;
  amount: string;
  chainId?: number;
};

type Props = {
  address?: string;
  balances?: BalanceEntry[];
  onLogout?: () => void;
  onRefresh?: () => void;
};

export function WalletPanel({ address, balances, onLogout, onRefresh }: Props) {
  return (
    <div className="w-full max-w-[420px]">
      <div
        className="p-5 space-y-4"
        style={{
          background: "var(--surface-glass)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.25), 0 0 70px rgba(139, 92, 246, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Wallet</h2>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-[10px] font-medium px-2 py-0.5 transition-all duration-200"
              style={{
                color: "var(--accent)",
                background: "var(--accent-glow)",
                border: "1px solid rgba(255, 106, 85, 0.15)",
                borderRadius: "var(--radius-full)",
              }}
            >
              Refresh
            </button>
          )}
        </div>

        {address ? (
          <>
            {/* Address card */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "var(--mint-glow)", border: "1px solid rgba(124, 255, 178, 0.2)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-sm font-mono font-medium" style={{ color: "var(--text-primary)" }}>
                  {shortenAddress(address, 6)}
                </span>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(address)}
                className="text-[11px] font-medium px-2.5 py-1 transition-all duration-200"
                style={{
                  color: "var(--accent)",
                  background: "var(--accent-glow)",
                  border: "1px solid rgba(255, 106, 85, 0.15)",
                  borderRadius: "var(--radius-full)",
                }}
              >
                Copy
              </button>
            </div>

            {/* Pulse divider */}
            <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, var(--border-strong), transparent)" }} />

            {/* Balances */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
                Balances
              </label>
              {balances && balances.length > 0 ? (
                balances.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{
                      background: "var(--surface-elevated)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{
                          background: "var(--mint-glow)",
                          color: "var(--mint)",
                          border: "1px solid rgba(124, 255, 178, 0.15)",
                        }}
                      >
                        $
                      </div>
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{b.chain}</span>
                    </div>
                    <span className="text-sm font-medium font-mono" style={{ color: "var(--text-primary)" }}>
                      {formatUsdc(b.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  className="px-4 py-3 text-center"
                  style={{
                    background: "var(--surface-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>No tokens yet</p>
                </div>
              )}
            </div>

            {/* Pulse divider */}
            <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, var(--border-strong), transparent)" }} />

            {/* Actions */}
            <div className="space-y-2">
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs font-medium py-2.5 transition-all duration-200"
                style={{
                  color: "var(--accent)",
                  background: "var(--accent-glow)",
                  border: "1px solid rgba(255, 106, 85, 0.15)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                Get testnet USDC
              </a>
              <button
                onClick={onLogout}
                className="w-full py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98]"
                style={{
                  color: "var(--danger)",
                  border: "1px solid rgba(255, 107, 107, 0.2)",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(255, 107, 107, 0.05)",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
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
