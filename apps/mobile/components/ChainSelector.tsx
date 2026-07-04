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
    <div className="flex flex-wrap gap-1.5">
      {chains.map((chain) => (
        <button
          key={chain.id}
          onClick={() => chain.enabled && onSelect(chain.sdkName)}
          disabled={!chain.enabled}
          className="px-3 py-1.5 text-[11px] font-medium tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            borderRadius: "var(--radius-full)",
            border: `1px solid ${selected === chain.sdkName ? "var(--accent)" : "var(--border)"}`,
            background: selected === chain.sdkName ? "var(--accent-glow)" : "transparent",
            color: selected === chain.sdkName ? "var(--accent)" : "var(--text-secondary)",
          }}
        >
          {chain.displayName}
          {!chain.bridgeEnabled && chain.enabled && (
            <span style={{ color: "var(--warning)", marginLeft: 4, fontSize: 9 }}>Soon</span>
          )}
        </button>
      ))}
    </div>
  );
}
