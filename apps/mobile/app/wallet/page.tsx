"use client";

import { useState, useEffect } from "react";
import { useUcwWallet } from "@/lib/useUcwWallet";
import { UcwLoginModal } from "@/components/UcwLoginModal";
import { WalletPanel } from "@/components/WalletPanel";
import { LoginCard } from "@/components/LoginCard";

export default function WalletPage() {
  const wallet = useUcwWallet();
  const [modalOpen, setModalOpen] = useState(false);

  // Auto-open modal on OAuth return (Pitfall 7)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    const isOAuthReturn = hash.includes("access_token") || hash.includes("id_token") || hash.includes("error");
    if (isOAuthReturn) {
      setModalOpen(true);
    }
  }, []);

  // Auto-close modal when wallet connects (Pitfall 7)
  useEffect(() => {
    if (wallet.isConnected) {
      setModalOpen(false);
    }
  }, [wallet.isConnected]);

  if (wallet.isConnected && wallet.wallet) {
    return (
      <>
        <WalletPanel
          address={wallet.wallet.address}
          balances={wallet.balances.map((b) => ({
            chain: b.blockchain || "EVM",
            amount: b.amount,
          }))}
          onLogout={wallet.logout}
          onRefresh={wallet.refreshBalances}
        />
        <UcwLoginModal open={modalOpen} onClose={() => setModalOpen(false)} wallet={wallet} />
      </>
    );
  }

  return (
    <>
      <div className="w-full max-w-[380px]">
        <div
          className="p-6 space-y-5"
          style={{
            background: "var(--surface-glass)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.25), 0 0 70px rgba(139, 92, 246, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "var(--accent)", boxShadow: "0 0 40px var(--accent-glow)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Mintova</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Move stablecoins across chains</p>
            </div>
          </div>

          <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, var(--border-strong), transparent)" }} />

          <div className="space-y-2.5">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-3 text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98]"
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

            <button
              onClick={() => setModalOpen(true)}
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

            <button
              onClick={() => setModalOpen(true)}
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

          {wallet.error && (
            <p className="text-xs text-center" style={{ color: "var(--danger)" }}>
              {wallet.error}
            </p>
          )}
        </div>
      </div>

      <UcwLoginModal open={modalOpen} onClose={() => setModalOpen(false)} wallet={wallet} />
    </>
  );
}
