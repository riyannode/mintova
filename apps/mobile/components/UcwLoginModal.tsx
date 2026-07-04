"use client";

import { useUcwWallet } from "@/lib/useUcwWallet";
import { shortenAddress } from "@/lib/format";

type Props = {
  open: boolean;
  onClose: () => void;
  wallet: ReturnType<typeof useUcwWallet>;
};

export function UcwLoginModal({ open, onClose, wallet }: Props) {
  if (!open) return null;

  const { state, error, loginWithGoogle, initializeUser, clearError } = wallet;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[380px] overflow-hidden transition-all duration-300"
        style={{
          background: "var(--surface-glass)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.4), 0 0 70px rgba(139, 92, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        }}
      >
        {/* Header accent line */}
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg, var(--accent), var(--violet), var(--mint))" }} />

        <div className="p-6 space-y-5">
          {/* Close button */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              {state === "connected" ? "Wallet" : "Sign in"}
            </h3>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-70"
              style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Error state */}
          {error && (
            <div
              className="px-3 py-2 text-xs flex items-center gap-2"
              style={{
                background: "rgba(255, 107, 107, 0.08)",
                border: "1px solid rgba(255, 107, 107, 0.15)",
                borderRadius: "var(--radius-sm)",
                color: "var(--danger)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="flex-1">{error}</span>
              <button onClick={clearError} className="hover:opacity-70">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {/* Connected state: show wallet info */}
          {state === "connected" && wallet.wallet ? (
            <ConnectedView wallet={wallet} />
          ) : state === "logging_in" ? (
            <LoadingView message="Completing login..." />
          ) : state === "creating_wallet" ? (
            <LoadingView message="Creating wallet..." />
          ) : state === "initializing" ? (
            <LoadingView message="Preparing..." />
          ) : (
            <LoginButtonsView onGoogle={loginWithGoogle} state={state} />
          )}
        </div>
      </div>
    </div>
  );
}

function LoginButtonsView({ onGoogle, state }: { onGoogle: () => void; state: string }) {
  return (
    <div className="space-y-3">
      {/* Logo */}
      <div className="flex justify-center py-2">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: "var(--accent)",
            boxShadow: "0 0 30px var(--accent-glow)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
        Connect with Circle to create your wallet
      </p>

      {/* Google Login */}
      <button
        onClick={onGoogle}
        disabled={state === "initializing"}
        className="w-full py-3 text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-40"
        style={{
          background: "var(--accent)",
          color: "var(--bg)",
          borderRadius: "var(--radius-sm)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        <span className="text-[10px] font-medium tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>or</span>
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      </div>

      {/* Email Login */}
      <button
        className="w-full py-3 text-sm font-medium flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98]"
        style={{
          background: "var(--surface-elevated)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
        </svg>
        Continue with Email
      </button>

      {/* Connect Wallet */}
      <button
        className="w-full py-3 text-sm font-medium flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98]"
        style={{
          background: "transparent",
          color: "var(--text-muted)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
        Connect Wallet
      </button>
    </div>
  );
}

function ConnectedView({ wallet }: { wallet: ReturnType<typeof useUcwWallet> }) {
  const { wallet: w, balances, logout, refreshBalances } = wallet;

  return (
    <div className="space-y-4">
      {/* Address */}
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
          <div>
            <p className="text-sm font-medium font-mono" style={{ color: "var(--text-primary)" }}>
              {shortenAddress(w?.address || "", 6)}
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {w?.blockchain || "EVM"}
            </p>
          </div>
        </div>
        <button
          className="text-[11px] font-medium px-2.5 py-1 transition-all duration-200"
          style={{
            color: "var(--accent)",
            background: "var(--accent-glow)",
            border: "1px solid rgba(255, 106, 85, 0.15)",
            borderRadius: "var(--radius-full)",
          }}
          onClick={() => navigator.clipboard.writeText(w?.address || "")}
        >
          Copy
        </button>
      </div>

      {/* Balances */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
            Balances
          </label>
          <button onClick={refreshBalances} className="text-[10px] font-medium" style={{ color: "var(--accent)" }}>
            Refresh
          </button>
        </div>

        {balances.length > 0 ? (
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
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{b.token.symbol}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{b.blockchain}</p>
                </div>
              </div>
              <span className="text-sm font-medium font-mono" style={{ color: "var(--text-primary)" }}>
                {parseFloat(b.amount).toLocaleString("en-US", { maximumFractionDigits: 6 })}
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
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium mt-1 inline-block"
              style={{ color: "var(--accent)" }}
            >
              Get testnet USDC
            </a>
          </div>
        )}
      </div>

      {/* Pulse divider */}
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, var(--border-strong), transparent)" }} />

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={refreshBalances}
          className="flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98]"
          style={{
            background: "var(--surface-elevated)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 00-9-9 9.75 9.75 0 00-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 009 9 9.75 9.75 0 006.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          Refresh
        </button>
        <button
          onClick={logout}
          className="flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98]"
          style={{
            background: "rgba(255, 107, 107, 0.06)",
            color: "var(--danger)",
            border: "1px solid rgba(255, 107, 107, 0.15)",
            borderRadius: "var(--radius-sm)",
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
    </div>
  );
}

function LoadingView({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="relative w-10 h-10">
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            border: "2px solid var(--border)",
            borderTopColor: "var(--accent)",
          }}
        />
        <div
          className="absolute inset-2 rounded-full"
          style={{ background: "var(--surface)" }}
        />
      </div>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{message}</p>
    </div>
  );
}
