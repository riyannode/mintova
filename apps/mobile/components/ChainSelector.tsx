"use client";

import { CHAINS, type MintovaChain } from "@/lib/chains";

type Props = {
  selected: string;
  onSelect: (sdkName: string) => void;
  filter?: (chain: MintovaChain) => boolean;
};

export function ChainSelector({ selected, onSelect, filter }: Props) {
  const chains = filter ? CHAINS.filter(filter) : CHAINS;

  return (
    <div className="flex flex-wrap gap-2">
      {chains.map((chain) => (
        <button
          key={chain.id}
          onClick={() => onSelect(chain.sdkName)}
          disabled={!chain.enabled}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
            selected === chain.sdkName
              ? "border-[#7CFFB2] bg-[#7CFFB2]/10 text-[#7CFFB2]"
              : chain.enabled
              ? "border-[#2A2E38] bg-[#181B22] text-[#F7F2E8] hover:border-[#8EA7FF]"
              : "border-[#2A2E38] bg-[#181B22] text-[#8E929C] opacity-50 cursor-not-allowed"
          }`}
        >
          {chain.displayName}
          {!chain.bridgeEnabled && chain.enabled && (
            <span className="ml-1 text-[#FFB86B]"> Soon</span>
          )}
        </button>
      ))}
    </div>
  );
}
