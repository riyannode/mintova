"use client";

import { useState } from "react";
import { ChainSelector } from "./ChainSelector";
import { AmountInput } from "./AmountInput";

export function SwapCard() {
  const [chain, setChain] = useState("Base_Sepolia");
  const [amount, setAmount] = useState("");

  return (
    <div className="w-full max-w-[420px]">
      <div
        className="p-5 space-y-5"
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
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Swap</h2>
          <span
            className="text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-full"
            style={{
              color: "var(--warning)",
              background: "rgba(255, 184, 107, 0.1)",
              border: "1px solid rgba(255, 184, 107, 0.15)",
            }}
          >
            Coming Soon
          </span>
        </div>

        <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, var(--border-strong), transparent)" }} />

        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>Chain</label>
          <ChainSelector selected={chain} onSelect={setChain} compact />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>You pay</label>
          <AmountInput value={amount} onChange={setAmount} />
        </div>

        <div
          className="px-4 py-3"
          style={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>You receive</span>
          <p className="text-xl font-semibold mt-1" style={{ color: "var(--text-muted)" }}>-</p>
        </div>

        <button
          disabled
          className="w-full py-3.5 text-sm font-semibold opacity-30 cursor-not-allowed"
          style={{
            background: "var(--mint)",
            color: "#09090E",
            borderRadius: "var(--radius-sm)",
          }}
        >
          Swap
        </button>
      </div>
    </div>
  );
}
