"use client";

import { useState } from "react";
import { ChainSelector } from "./ChainSelector";
import { AmountInput } from "./AmountInput";
import { getEnabledBridgeChains } from "@/lib/chains";

export function BridgeCard() {
  const [fromChain, setFromChain] = useState("Ethereum_Sepolia");
  const [toChain, setToChain] = useState("Base_Sepolia");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  return (
    <div className="w-full max-w-[420px]">
      <div className="glass-card p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Bridge</h2>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>

        {/* Pulse accent line */}
        <div className="pulse-line" />

        {/* From */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>From</label>
          <ChainSelector selected={fromChain} onSelect={setFromChain} filter={(c) => c.bridgeEnabled} />
        </div>

        {/* To */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>To</label>
          <ChainSelector selected={toChain} onSelect={setToChain} filter={(c) => c.bridgeEnabled} />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>Amount</label>
          <AmountInput value={amount} onChange={setAmount} />
        </div>

        {/* Recipient */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>Recipient</label>
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
          disabled={!amount || !recipient}
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
