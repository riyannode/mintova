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

  const bridgeChains = getEnabledBridgeChains();

  return (
    <div className="w-full max-w-sm bg-[#181B22] rounded-2xl border border-[#2A2E38] p-6 space-y-5">
      <h2 className="text-lg font-semibold">Bridge USDC</h2>

      <div className="space-y-2">
        <label className="text-xs text-[#8E929C] uppercase tracking-wider">From</label>
        <ChainSelector
          selected={fromChain}
          onSelect={setFromChain}
          filter={(c) => c.bridgeEnabled}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-[#8E929C] uppercase tracking-wider">To</label>
        <ChainSelector
          selected={toChain}
          onSelect={setToChain}
          filter={(c) => c.bridgeEnabled}
        />
      </div>

      <AmountInput value={amount} onChange={setAmount} />

      <div className="space-y-2">
        <label className="text-xs text-[#8E929C] uppercase tracking-wider">Recipient</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          className="w-full bg-[#20242D] text-[#F7F2E8] text-sm px-4 py-3 rounded-xl border border-[#2A2E38] outline-none focus:border-[#7CFFB2] transition"
        />
      </div>

      <button
        disabled={!amount || !recipient}
        className="w-full py-3 rounded-xl bg-[#7CFFB2] text-[#0E1014] font-semibold hover:bg-[#7CFFB2]/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Bridge USDC
      </button>
    </div>
  );
}
