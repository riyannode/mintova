"use client";

export function LoginCard() {
  return (
    <div className="w-full max-w-[380px]">
      <div className="glass-card p-6 space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: "var(--accent)",
              boxShadow: "0 0 40px var(--accent-glow)",
            }}
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

        <div className="pulse-line" />

        <div className="space-y-2.5">
          <button
            className="w-full py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            Continue with Google
          </button>
          <button
            className="w-full py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
            style={{
              background: "var(--surface-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            Continue with Email
          </button>
          <button
            className="w-full py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
            style={{
              background: "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
