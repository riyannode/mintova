"use client";

import { CHAINS, type MintovaChain } from "@/lib/chains";

type Props = {
  selected: string;
  onSelect: (sdkName: string) => void;
  filter?: (chain: MintovaChain) => boolean;
  compact?: boolean;
};

export function ChainSelector({ selected, onSelect, filter, compact }: Props) {
  const chains = filter ? CHAINS.filter(filter) : CHAINS;

  if (compact) {
    // Compact horizontal scroll for tight spaces
    return (
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {chains.map((chain) => {
          const active = selected === chain.sdkName;
          const disabled = !chain.enabled || !chain.bridgeEnabled;
          return (
            <button
              key={chain.id}
              onClick={() => !disabled && onSelect(chain.sdkName)}
              disabled={disabled}
              className="shrink-0 px-3 py-1.5 text-[11px] font-medium tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderRadius: "var(--radius-full)",
                border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                background: active ? "var(--accent-glow)" : "transparent",
                color: active ? "var(--accent)" : disabled ? "var(--text-muted)" : "var(--text-secondary)",
              }}
            >
              {chain.shortName}
              {disabled && (
                <span style={{ color: "var(--warning)", marginLeft: 4, fontSize: 9 }}>Soon</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Grid layout for main chain selector
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {chains.map((chain) => {
        const active = selected === chain.sdkName;
        const disabled = !chain.enabled || !chain.bridgeEnabled;
        return (
          <button
            key={chain.id}
            onClick={() => !disabled && onSelect(chain.sdkName)}
            disabled={disabled}
            className="px-2 py-2 text-[11px] font-medium tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-center"
            style={{
              borderRadius: "var(--radius-sm)",
              border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
              background: active ? "var(--accent-glow)" : "transparent",
              color: active ? "var(--accent)" : disabled ? "var(--text-muted)" : "var(--text-secondary)",
            }}
          >
            <span className="block">{chain.shortName}</span>
            {disabled && (
              <span className="block mt-0.5" style={{ color: "var(--warning)", fontSize: 8 }}>Soon</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
