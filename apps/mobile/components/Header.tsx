"use client";

import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header
      className="relative z-20 flex items-center justify-between px-5 py-3"
      style={{
        background: "var(--surface-glass)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "var(--accent)", boxShadow: "0 0 20px var(--accent-glow)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Mintova
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-medium tracking-widest uppercase px-2 py-0.5 rounded-full"
          style={{
            color: "var(--mint)",
            background: "var(--mint-glow)",
            border: "1px solid rgba(124, 255, 178, 0.15)",
          }}
        >
          Testnet
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
