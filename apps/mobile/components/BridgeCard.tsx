"use client";

import { useState } from "react";
import { ChainSelector } from "./ChainSelector";
import { AmountInput } from "./AmountInput";

export function BridgeCard() {
  const [fromChain, setFromChain] = useState("Ethereum_Sepolia");
  const [toChain, setToChain] = useState("Base_Sepolia");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Bridge</h2>
          <span className="text-[10px] font-medium tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
            CCTP V2
          </span>
        </div>

        <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, var(--border-strong), transparent)" }} />

        {/* From */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
            From
          </label>
          <ChainSelector
            selected={fromChain}
            onSelect={setFromChain}
            filter={(c) => c.bridgeEnabled}
          />
        </div>

        {/* Swap chains button */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              const temp = fromChain;
              setFromChain(toChain);
              setToChain(temp);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--border)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4m0 0L3 8m4-4l4 4" />
              <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* To */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
            To
          </label>
          <ChainSelector
            selected={toChain}
            onSelect={setToChain}
            filter={(c) => c.bridgeEnabled && c.sdkName !== fromChain}
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
            Amount
          </label>
          <AmountInput value={amount} onChange={setAmount} />
        </div>

        {/* Recipient */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
            Recipient
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full text-sm px-4 py-3 outline-none transition-all duration-200"
            style={{
              background: "var(--surface-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
            }}
          />
        </div>

        {/* CTA */}
        <button
          disabled={!amount || !recipient || fromChain === toChain}
          className="w-full py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: "var(--mint)",
            color: "#09090E",
            borderRadius: "var(--radius-sm)",
            boxShadow: amount && recipient ? "0 0 30px var(--mint-glow)" : "none",
          }}
        >
          Bridge USDC
        </button>
      </div>
    </div>
  );
}
