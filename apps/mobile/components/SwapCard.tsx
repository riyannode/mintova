"use client";

import { useState } from "react";
import { ChainSelector } from "./ChainSelector";
import { AmountInput } from "./AmountInput";

export function SwapCard() {
  const [chain, setChain] = useState("Base_Sepolia");
  const [amount, setAmount] = useState("");

  return (
    <div className="w-full max-w-sm bg-[#181B22] rounded-2xl border border-[#2A2E38] p-6 space-y-5">
      <h2 className="text-lg font-semibold">Swap</h2>

      <div className="space-y-2">
        <label className="text-xs text-[#8E929C] uppercase tracking-wider">Chain</label>
        <ChainSelector selected={chain} onSelect={setChain} />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-[#8E929C] uppercase tracking-wider">You pay</label>
        <AmountInput value={amount} onChange={setAmount} />
      </div>

      <div className="bg-[#20242D] rounded-xl p-4 border border-[#2A2E38]">
        <span className="text-xs text-[#8E929C]">You receive</span>
        <p className="text-xl font-semibold text-[#8E929C]">--</p>
      </div>

      <button
        disabled
        className="w-full py-3 rounded-xl bg-[#7CFFB2] text-[#0E1014] font-semibold opacity-40 cursor-not-allowed"
      >
        Swap (Coming Soon)
      </button>
    </div>
  );
}
